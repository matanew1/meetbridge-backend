import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Match } from './match.entity';
import { KafkaService } from '../kafka/kafka.service';
import { RedisService } from '../redis/redis.service';

export interface DiscoveryFilters {
  gender?: string;
  minAge?: number;
  maxAge?: number;
  maxDistance?: number;
  interests?: string[];
}

@Injectable()
export class DiscoveryService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    private readonly kafkaService: KafkaService,
    private readonly redisService: RedisService,
  ) {}

  async getDiscoveryProfiles(
    userId: string,
    filters: DiscoveryFilters = {},
    limit = 20,
    offset = 0,
  ): Promise<User[]> {
    // Check cache first
    const cacheKey = `discovery:${userId}:${JSON.stringify(filters)}:${limit}:${offset}`;
    let profiles = await this.redisService.get<User[]>(cacheKey);

    if (!profiles) {
      // Build query
      const query = this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.sentLikes', 'sentLikes')
        .leftJoin('user.receivedLikes', 'receivedLikes')
        .where('user.id != :userId', { userId })
        .andWhere('user.isActive = true')
        .andWhere('user.isProfileComplete = true');

      // Apply filters
      if (filters.gender) {
        query.andWhere('user.gender = :gender', { gender: filters.gender });
      }

      if (filters.minAge || filters.maxAge) {
        const now = new Date();
        if (filters.minAge) {
          const minBirthDate = new Date(now.getFullYear() - filters.minAge, now.getMonth(), now.getDate());
          query.andWhere('user.dateOfBirth <= :minBirthDate', { minBirthDate });
        }
        if (filters.maxAge) {
          const maxBirthDate = new Date(now.getFullYear() - filters.maxAge, now.getMonth(), now.getDate());
          query.andWhere('user.dateOfBirth >= :maxBirthDate', { maxBirthDate });
        }
      }

      // Exclude users already liked/disliked/matched
      query.andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('match.userId1')
          .from(Match, 'match')
          .where('match.userId2 = :userId')
          .orWhere('match.userId1 = :userId')
          .getQuery();
        return 'user.id NOT IN ' + subQuery;
      });

      // Exclude users who liked but weren't matched with
      query.andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('like.targetUserId')
          .from('user_likes', 'like') // Assuming you have a likes table
          .where('like.userId = :userId')
          .getQuery();
        return 'user.id NOT IN ' + subQuery;
      });

      // Apply pagination
      query.limit(limit).offset(offset);

      profiles = await query.getMany();

      // Cache results for 5 minutes
      await this.redisService.set(cacheKey, profiles, 300);
    }

    return profiles;
  }

  async likeProfile(userId: string, targetUserId: string): Promise<{ isMatch: boolean }> {
    // Check if already liked
    const existingLike = await this.matchRepository.findOne({
      where: [
        { userId1: userId, userId2: targetUserId },
        { userId1: targetUserId, userId2: userId },
      ],
    });

    if (existingLike) {
      throw new Error('Already processed this profile');
    }

    // Check if target user liked back (mutual match)
    const mutualLike = await this.matchRepository.findOne({
      where: { userId1: targetUserId, userId2: userId },
    });

    const isMatch = !!mutualLike;

    // Create match record
    const match = this.matchRepository.create({
      userId1: userId,
      userId2: targetUserId,
      isMutual: isMatch,
    });

    await this.matchRepository.save(match);

    // Invalidate discovery cache for both users
    await this.redisService.invalidateDiscoveryCache(userId);
    await this.redisService.invalidateDiscoveryCache(targetUserId);

    // Emit match created event
    await this.kafkaService.emitMatchCreated(match.id, userId, targetUserId);

    return { isMatch };
  }

  async passProfile(userId: string, targetUserId: string): Promise<void> {
    // For pass, we just invalidate cache - no database record needed
    await this.redisService.invalidateDiscoveryCache(userId);
  }

  async getMatches(userId: string): Promise<User[]> {
    const matches = await this.matchRepository.find({
      where: [
        { userId1: userId, isMutual: true },
        { userId2: userId, isMutual: true },
      ],
      relations: ['user1', 'user2'],
    });

    const matchedUsers: User[] = [];
    for (const match of matches) {
      const matchedUser = match.userId1 === userId ? match.user2 : match.user1;
      matchedUsers.push(matchedUser);
    }

    return matchedUsers;
  }
}