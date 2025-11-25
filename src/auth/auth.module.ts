import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { User } from "../entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtStrategy } from "./jwt.strategy";
import { RedisModule } from "../redis/redis.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({}),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
