import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Match } from "../entities/match.entity";
import { User } from "../entities/user.entity";

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(userId1: string, userId2: string): Promise<Match> {
    // Check if users exist
    const user1 = await this.userRepository.findOne({ where: { id: userId1 } });
    const user2 = await this.userRepository.findOne({ where: { id: userId2 } });

    if (!user1 || !user2) {
      throw new NotFoundException("User not found");
    }

    // Check if match already exists
    const existingMatch = await this.matchRepository.findOne({
      where: [
        { userId1, userId2 },
        { userId1: userId2, userId2: userId1 },
      ],
    });

    if (existingMatch) {
      return existingMatch;
    }

    const match = this.matchRepository.create({ userId1, userId2 });
    return this.matchRepository.save(match);
  }

  async findAllForUser(userId: string): Promise<Match[]> {
    return this.matchRepository.find({
      where: [{ userId1: userId }, { userId2: userId }],
      relations: ["user1", "user2"],
    });
  }

  async findMutualMatches(userId: string): Promise<Match[]> {
    return this.matchRepository.find({
      where: [
        { userId1: userId, isMutual: true },
        { userId2: userId, isMutual: true },
      ],
      relations: ["user1", "user2"],
    });
  }

  async makeMutual(matchId: string): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { id: matchId },
    });
    if (!match) {
      throw new NotFoundException("Match not found");
    }

    match.isMutual = true;
    return this.matchRepository.save(match);
  }

  async remove(id: string): Promise<void> {
    const result = await this.matchRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException("Match not found");
    }
  }
}
