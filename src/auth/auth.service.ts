import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { JwtService } from "@nestjs/jwt";
import { User } from "../entities/user.entity";
import { RedisService } from "../redis/redis.service";
import { RegisterDto, LoginDto } from "./dto/auth.dto";

@Injectable()
export class AuthService {
  private accessSecret = process.env.JWT_ACCESS_SECRET || "dev_secret";
  private accessExpiry = process.env.JWT_ACCESS_EXPIRY || "900s"; // 15m
  private refreshTtl = parseInt(
    process.env.REFRESH_TOKEN_TTL_SECONDS || "1209600"
  ); // 14 days

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    private redis: RedisService
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) return null;
    const valid = await bcrypt.compare(pass, user.password);
    if (!valid) return null;
    return user;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role || "user",
    };

    // Check if user is already logged in and invalidate old session
    const client = this.redis.getClient();
    const existingRefresh = await client.get(`refresh_token:${user.id}`);
    if (existingRefresh) {
      // Delete old refresh token
      await client.del(`refresh_token:${user.id}`);
    }

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.accessSecret,
      expiresIn: this.accessExpiry,
      issuer: process.env.JWT_ISSUER || "my-app",
    });

    const refresh = await this.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken: refresh, // opaque
      expiresIn: this.accessExpiry,
    };
  }

  private async createRefreshToken(userId: string) {
    // refreshId and secret
    const refreshId = uuidv4();
    const tokenSecret = uuidv4() + uuidv4(); // random secret
    const combined = `${refreshId}.${tokenSecret}`;
    const hashed = await bcrypt.hash(tokenSecret, 12);
    const client = this.redis.getClient();
    const key = `refresh:${refreshId}`;
    // store a JSON payload so we can extend if needed
    await client.set(
      key,
      JSON.stringify({ userId, hash: hashed }),
      "EX",
      this.refreshTtl
    );

    // Store the refresh token by userId
    await client.set(
      `refresh_token:${userId}`,
      combined,
      "EX",
      this.refreshTtl
    );

    return combined;
  }

  async refresh(refreshToken: string) {
    if (!refreshToken || !refreshToken.includes(".")) {
      throw new UnauthorizedException("Invalid refresh token structure");
    }
    const [refreshId, tokenSecret] = refreshToken.split(".", 2);
    const client = this.redis.getClient();
    const key = `refresh:${refreshId}`;
    const raw = await client.get(key);
    if (!raw) {
      throw new UnauthorizedException("Refresh token not found or revoked");
    }
    const parsed = JSON.parse(raw);
    const { userId, hash } = parsed;

    const valid = await bcrypt.compare(tokenSecret, hash);
    if (!valid) {
      // possible token theft — revoke immediately
      await client.del(key);
      throw new UnauthorizedException("Invalid refresh token");
    }

    // Check if the token matches the stored one
    const storedToken = await client.get(`refresh_token:${userId}`);
    if (storedToken !== refreshToken) {
      throw new UnauthorizedException("Refresh token mismatch");
    }

    // rotate: create new refresh token, delete old
    await client.del(key);
    await client.del(`refresh_token:${userId}`);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException("User not found");

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role || "user",
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.accessSecret,
      expiresIn: this.accessExpiry,
      issuer: process.env.JWT_ISSUER || "my-app",
    });

    const newRefresh = await this.createRefreshToken(user.id);
    return {
      accessToken,
      refreshToken: newRefresh,
      expiresIn: this.accessExpiry,
    };
  }

  async logout(refreshToken: string, accessToken?: string) {
    if (!refreshToken || !refreshToken.includes(".")) {
      throw new UnauthorizedException("Invalid refresh token");
    }
    const [refreshId] = refreshToken.split(".", 1);
    const client = this.redis.getClient();
    const key = `refresh:${refreshId}`;

    // Check if token exists
    const tokenData = await client.get(key);
    if (!tokenData) {
      throw new UnauthorizedException(
        "User is not logged in or token is invalid"
      );
    }

    const parsed = JSON.parse(tokenData);
    const userId = parsed.userId;

    // Delete refresh tokens
    await client.del(key);
    await client.del(`refresh_token:${userId}`);

    // Blacklist access token if provided
    if (accessToken) {
      try {
        const decoded = this.jwtService.decode(accessToken) as any;
        if (decoded && decoded.exp) {
          const ttl = decoded.exp - Math.floor(Date.now() / 1000);
          if (ttl > 0) {
            await client.set(`blacklist:${accessToken}`, "true", "EX", ttl);
          }
        }
      } catch (error) {
        // Ignore invalid token
      }
    }
  }

  async register(registerDto: RegisterDto) {
    const { email, password, ...userData } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = this.userRepository.create({
      ...userData,
      email,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    return savedUser;
  }
}
