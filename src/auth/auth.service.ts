import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../entities/user.entity";
import { KafkaService } from "../kafka/kafka.service";
import { RedisService } from "../redis/redis.service";
import { RegisterDto, LoginDto } from "./dto/auth.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly kafkaService: KafkaService,
    private readonly redisService: RedisService
  ) {}

  async register(
    registerDto: RegisterDto
  ): Promise<{ access_token: string; user: User }> {
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

    // Cache user profile
    await this.redisService.setUserProfile(savedUser.id, savedUser);

    // Emit user created event
    await this.kafkaService.emitUserCreated(savedUser.id, {
      email: savedUser.email,
      name: savedUser.name,
    });

    // Generate JWT and store in Redis
    const payload = { sub: savedUser.id, email: savedUser.email };
    const access_token = this.jwtService.sign(payload);
    await this.redisService.setToken(
      `access_token:${savedUser.id}`,
      access_token,
      3600
    ); // 1 hour

    // Remove password from response
    const { password: _, ...userWithoutPassword } = savedUser;

    return { access_token, user: userWithoutPassword as User };
  }

  async login(user: User): Promise<{ access_token: string; user: User }> {
    // User is already validated by LocalStrategy
    // Generate JWT and store in Redis
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);
    await this.redisService.setToken(
      `access_token:${user.id}`,
      access_token,
      3600
    ); // 1 hour

    // Set user online in Redis
    await this.redisService.setUserOnline(user.id);

    // Cache user profile
    await this.redisService.setUserProfile(user.id, user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return { access_token, user: userWithoutPassword as User };
  }

  async logout(userId: string): Promise<void> {
    // Remove access token from Redis
    await this.redisService.deleteToken(`access_token:${userId}`);

    // Set user offline in Redis
    await this.redisService.setUserOffline(userId);

    // Invalidate user cache
    await this.redisService.invalidateUserProfile(userId);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    console.log(`Validating user: ${email}`);
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
    });
    console.log(`User found: ${!!user}`);
    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      console.log(`Password valid: ${isValid}`);
      if (isValid) {
        return user;
      }
    }

    return null;
  }

  async refreshToken(user: User): Promise<{ access_token: string }> {
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    // Store new token in Redis
    await this.redisService.setToken(
      `access_token:${user.id}`,
      access_token,
      3600
    ); // 1 hour

    return { access_token };
  }
}
