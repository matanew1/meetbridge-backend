import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET"),
    });
  }

  async validate(payload: any) {
    // Check if token exists in Redis (additional security layer)
    const storedToken = await this.redisService.getToken(
      `access_token:${payload.sub}`
    );
    if (!storedToken) {
      throw new UnauthorizedException("Token has been revoked");
    }

    return { id: payload.sub, email: payload.email };
  }
}
