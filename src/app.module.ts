import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "@nestjs/cache-manager";
import { ClientsModule, Transport } from "@nestjs/microservices";
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
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DB_HOST", "localhost"),
        port: configService.get("DB_PORT", 5432),
        username: configService.get("DB_USERNAME", "postgres"),
        password: configService.get("DB_PASSWORD", "password"),
        database: configService.get("DB_NAME", "meetbridge"),
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
      }),
      inject: [ConfigService],
    }),

    // Redis Cache
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get("REDIS_HOST", "localhost"),
        port: configService.get("REDIS_PORT", 6379),
        password: configService.get("REDIS_PASSWORD"),
        ttl: configService.get("CACHE_TTL", 300), // 5 minutes default
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),

    // Kafka Client
    ClientsModule.registerAsync([
      {
        name: "KAFKA_SERVICE",
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              brokers: configService
                .get("KAFKA_BROKERS", "localhost:9092")
                .split(","),
              ssl: configService.get("KAFKA_SSL") === "true",
              sasl: configService.get("KAFKA_USERNAME")
                ? {
                    mechanism: "plain",
                    username: configService.get("KAFKA_USERNAME"),
                    password: configService.get("KAFKA_PASSWORD"),
                  }
                : undefined,
            },
            consumer: {
              groupId: "meetbridge-backend",
              allowAutoTopicCreation: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),

    // Application Modules
    AuthModule,
    UsersModule,
    DiscoveryModule,
    MatchesModule,
    ChatModule,
    NotificationsModule,
    MissedConnectionsModule,
    KafkaModule,
    RedisModule,
  ],
})
export class AppModule {}
