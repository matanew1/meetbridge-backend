import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "@nestjs/cache-manager";
import * as redisStore from "cache-manager-redis-store";

// Modules
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { DiscoveryModule } from "./discovery/discovery.module";
import { MatchesModule } from "./matches/matches.module";
import { ChatModule } from "./chat/chat.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { MissedConnectionsModule } from "./missed-connections/missed-connections.module";
import { KafkaModule } from "./kafka/kafka.module";
import { RedisModule } from "./redis/redis.module";

// Entities
import { User } from "./entities/user.entity";
import { Match } from "./entities/match.entity";
import { Conversation } from "./entities/conversation.entity";
import { Message } from "./entities/message.entity";
import { Notification } from "./entities/notification.entity";
import { MissedConnection } from "./entities/missed-connection.entity";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get("DATABASE_URL");
        let dbConfig: any = {
          type: "postgres",
          entities: [
            User,
            Match,
            Conversation,
            Message,
            Notification,
            MissedConnection,
          ],
          synchronize: configService.get("NODE_ENV") !== "production",
          logging: configService.get("NODE_ENV") === "development",
          ssl: configService.get("NODE_ENV") === "production",
        };

        if (databaseUrl) {
          // Parse DATABASE_URL for production (e.g., Render)
          const url = new URL(databaseUrl);
          dbConfig = {
            ...dbConfig,
            host: url.hostname,
            port: parseInt(url.port, 10),
            username: url.username,
            password: url.password,
            database: url.pathname.slice(1), // Remove leading slash
          };
        } else {
          // Use individual environment variables for development
          dbConfig = {
            ...dbConfig,
            host: configService.get("DB_HOST", "localhost"),
            port: configService.get("DB_PORT", 5432),
            username: configService.get("DB_USERNAME", "postgres"),
            password: configService.get("DB_PASSWORD", "password"),
            database: configService.get("DB_NAME", "meetbridge"),
          };
        }

        return dbConfig;
      },
      inject: [ConfigService],
    }),

    // Redis Cache
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get("REDIS_URL");
        let redisConfig: any = {
          store: redisStore,
          ttl: configService.get("CACHE_TTL", 300), // 5 minutes default
        };

        if (redisUrl) {
          // Parse REDIS_URL for production (e.g., Render)
          const url = new URL(redisUrl);
          redisConfig = {
            ...redisConfig,
            host: url.hostname,
            port: parseInt(url.port, 10),
            password: url.password,
          };
        } else {
          // Use individual environment variables for development
          redisConfig = {
            ...redisConfig,
            host: configService.get("REDIS_HOST", "localhost"),
            port: configService.get("REDIS_PORT", 6379),
            password: configService.get("REDIS_PASSWORD"),
          };
        }

        return redisConfig;
      },
      inject: [ConfigService],
      isGlobal: true,
    }),

    // Application Modules
    AuthModule,
    UsersModule,
    DiscoveryModule,
    MatchesModule,
    ChatModule,
    NotificationsModule,
    MissedConnectionsModule,
    // KafkaModule, // Temporarily disabled for testing
    RedisModule,
  ],
})
export class AppModule {}
