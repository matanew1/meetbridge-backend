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

    // Generate JWT
    const payload = { sub: savedUser.id, email: savedUser.email };
    const access_token = this.jwtService.sign(payload);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = savedUser;

    return { access_token, user: userWithoutPassword as User };
  }

  async login(
    loginDto: LoginDto
  ): Promise<{ access_token: string; user: User }> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({
      where: { email },
      select: ["id", "email", "password", "name", "gender", "isActive"],
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException("Account is deactivated");
    }

    // Set user online in Redis
    await this.redisService.setUserOnline(user.id);

    // Cache user profile
    await this.redisService.setUserProfile(user.id, user);

    // Generate JWT
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return { access_token, user: userWithoutPassword as User };
  }

  async logout(userId: string): Promise<void> {
    // Set user offline in Redis
    await this.redisService.setUserOffline(userId);

    // Invalidate user cache
    await this.redisService.invalidateUserProfile(userId);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    return null;
  }

  async refreshToken(user: User): Promise<{ access_token: string }> {
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return { access_token };
  }
}
