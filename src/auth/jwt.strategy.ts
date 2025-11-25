import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private redis: RedisService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || "dev_secret",
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    // Check if token is blacklisted
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token) {
      const client = this.redis.getClient();
      const isBlacklisted = await client.get(`blacklist:${token}`);
      if (isBlacklisted) {
        throw new UnauthorizedException("Token has been revoked");
      }
    }
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
