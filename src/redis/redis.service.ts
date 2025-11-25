import { Injectable, Inject, OnModuleInit } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit {
  private redisClient: Redis;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  onModuleInit() {
    // Initialize direct Redis client for critical operations
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD || undefined,
    });
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  getClient(): Redis {
    return this.redisClient;
  }

  async reset(): Promise<void> {
    await this.cacheManager.clear();
  }

  // Direct Redis operations for critical data (tokens)
  async setToken(
    key: string,
    value: string,
    ttlSeconds: number
  ): Promise<void> {
    console.log(`RedisService.setToken: key=${key}, ttl=${ttlSeconds}`);
    await this.redisClient.setex(key, ttlSeconds, value);
  }

  async getToken(key: string): Promise<string | null> {
    const token = await this.redisClient.get(key);
    console.log(`RedisService.getToken: key=${key}, token=${!!token}`);
    return token;
  }

  async deleteToken(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  // User-specific cache methods
  async getUserProfile(userId: string): Promise<any> {
    return this.get(`user:profile:${userId}`);
  }

  async setUserProfile(userId: string, profile: any, ttl = 300): Promise<void> {
    await this.set(`user:profile:${userId}`, profile, ttl);
  }

  async invalidateUserProfile(userId: string): Promise<void> {
    await this.del(`user:profile:${userId}`);
  }

  // Discovery cache methods
  async getDiscoveryProfiles(userId: string, filters: any): Promise<any[]> {
    const cacheKey = `discovery:${userId}:${JSON.stringify(filters)}`;
    return this.get(cacheKey) || [];
  }

  async setDiscoveryProfiles(
    userId: string,
    filters: any,
    profiles: any[],
    ttl = 180
  ): Promise<void> {
    const cacheKey = `discovery:${userId}:${JSON.stringify(filters)}`;
    await this.set(cacheKey, profiles, ttl);
  }

  async invalidateDiscoveryCache(userId: string): Promise<void> {
    // This is a simplified invalidation - in production, you'd want to use Redis keys pattern matching
    // For now, we'll just clear a few common filter combinations
    const commonFilters = [
      {},
      { gender: "male" },
      { gender: "female" },
      { ageMin: 18, ageMax: 30 },
    ];

    for (const filter of commonFilters) {
      const cacheKey = `discovery:${userId}:${JSON.stringify(filter)}`;
      await this.del(cacheKey);
    }
  }

  // Conversation cache methods
  async getConversationMessages(
    conversationId: string,
    page = 1
  ): Promise<any[]> {
    const cacheKey = `conversation:messages:${conversationId}:${page}`;
    return this.get(cacheKey) || [];
  }

  async setConversationMessages(
    conversationId: string,
    page: number,
    messages: any[],
    ttl = 300
  ): Promise<void> {
    const cacheKey = `conversation:messages:${conversationId}:${page}`;
    await this.set(cacheKey, messages, ttl);
  }

  async invalidateConversationCache(conversationId: string): Promise<void> {
    // Invalidate first few pages of messages
    for (let page = 1; page <= 5; page++) {
      await this.del(`conversation:messages:${conversationId}:${page}`);
    }
  }

  // Rate limiting
  async checkRateLimit(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<boolean> {
    const cacheKey = `ratelimit:${key}`;
    const current = (await this.get<number>(cacheKey)) || 0;

    if (current >= limit) {
      return false;
    }

    await this.set(cacheKey, current + 1, Math.ceil(windowMs / 1000));
    return true;
  }

  // Online presence
  async setUserOnline(userId: string): Promise<void> {
    await this.set(`user:online:${userId}`, true, 300); // 5 minutes
  }

  async setUserOffline(userId: string): Promise<void> {
    await this.del(`user:online:${userId}`);
  }

  async isUserOnline(userId: string): Promise<boolean> {
    return (await this.get(`user:online:${userId}`)) === true;
  }

  async getOnlineUsers(): Promise<string[]> {
    // This would require Redis SCAN in production
    // For now, return empty array as this is complex to implement efficiently
    return [];
  }
}
