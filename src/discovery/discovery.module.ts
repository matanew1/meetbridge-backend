import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DiscoveryService } from "./discovery.service";
import { DiscoveryController } from "./discovery.controller";
import { User } from "../entities/user.entity";
import { Match } from "../entities/match.entity";
import { KafkaModule } from "../kafka/kafka.module";
import { RedisModule } from "../redis/redis.module";

@Module({
  imports: [TypeOrmModule.forFeature([User, Match]), KafkaModule, RedisModule],
  controllers: [DiscoveryController],
  providers: [DiscoveryService],
  exports: [DiscoveryService],
})
export class DiscoveryModule {}
