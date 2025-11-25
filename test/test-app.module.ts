import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "@nestjs/cache-manager";
import * as redisStore from "cache-manager-redis-store";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

// Services and Controllers
import { AuthService } from "../src/auth/auth.service";
import { AuthController } from "../src/auth/auth.controller";
import { UsersService } from "../src/users/users.service";
import { RedisService } from "../src/redis/redis.service";
import { JwtStrategy } from "../src/auth/jwt.strategy";

// Entities
import { User } from "../src/entities/user.entity";

// DTOs
import { RegisterDto } from "../src/auth/dto/auth.dto";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.test", ".env"],
    }),

    // Test Database (SQLite in-memory)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        type: "sqlite",
        database: ":memory:",
        entities: [User],
        synchronize: true, // Only for testing
        dropSchema: true,
      }),
      inject: [],
    }),

    // Redis Cache for testing
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get("REDIS_HOST", "localhost"),
        port: configService.get("REDIS_PORT", 6379),
        password: configService.get("REDIS_PASSWORD"),
        ttl: 300,
      }),
      isGlobal: true,
      inject: [ConfigService],
    }),

    // JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET", "test-secret"),
        signOptions: { expiresIn: "7d" },
      }),
      inject: [ConfigService],
    }),

    // Passport
    PassportModule,

    // TypeORM for User entity
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, RedisService, JwtStrategy],
})
export class TestAppModule {}
