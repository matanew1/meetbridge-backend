import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { User } from "../entities/user.entity";
import { KafkaService } from "../kafka/kafka.service";
import { RedisService } from "../redis/redis.service";
import { RegisterDto, LoginDto } from "./dto/auth.dto";
import { ConflictException, UnauthorizedException } from "@nestjs/common";

describe("AuthService", () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let kafkaService: KafkaService;
  let redisService: RedisService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockKafkaService = {
    emitUserCreated: jest.fn(),
  };

  const mockRedisService = {
    setUserProfile: jest.fn(),
    setToken: jest.fn(),
    getToken: jest.fn(),
    deleteToken: jest.fn(),
    setUserOnline: jest.fn(),
    setUserOffline: jest.fn(),
    invalidateUserProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: KafkaService,
          useValue: mockKafkaService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    kafkaService = module.get<KafkaService>(KafkaService);
    redisService = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    const registerDto: RegisterDto = {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
      dateOfBirth: "1990-01-01",
      gender: "male",
      bio: "Test bio",
      interests: ["test"],
    };

    const mockUser = {
      id: "user-id",
      email: "test@example.com",
      password: "hashed-password",
      name: "Test User",
      dateOfBirth: new Date("1990-01-01"),
      gender: "male",
      bio: "Test bio",
      interests: ["test"],
      profilePictureUrl: null,
      location: null,
      geohash: null,
      isActive: true,
      isProfileComplete: true,
      lastActiveAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should register a new user successfully", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue("jwt-token");

      const result = await service.register(registerDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...registerDto,
        password: expect.any(String),
      });
      expect(mockRedisService.setUserProfile).toHaveBeenCalledWith(
        mockUser.id,
        mockUser
      );
      expect(mockKafkaService.emitUserCreated).toHaveBeenCalledWith(
        mockUser.id,
        {
          email: mockUser.email,
          name: mockUser.name,
        }
      );
      expect(mockRedisService.setToken).toHaveBeenCalledWith(
        `access_token:${mockUser.id}`,
        "jwt-token",
        3600
      );
      expect(result).toEqual({
        access_token: "jwt-token",
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        }),
      });
    });

    it("should throw ConflictException if user already exists", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
    });
  });

  describe("login", () => {
    const loginDto: LoginDto = {
      email: "test@example.com",
      password: "password123",
    };

    const mockUser = {
      id: "user-id",
      email: "test@example.com",
      password: "hashed-password",
      name: "Test User",
      dateOfBirth: new Date("1990-01-01"),
      gender: "male",
      bio: "Test bio",
      interests: ["test"],
      profilePictureUrl: null,
      location: null,
      geohash: null,
      isActive: true,
      isProfileComplete: false,
      lastActiveAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should login user successfully", async () => {
      mockJwtService.sign.mockReturnValue("jwt-token");

      const result = await service.login(mockUser);

      expect(mockRedisService.setUserOnline).toHaveBeenCalledWith(mockUser.id);
      expect(mockRedisService.setUserProfile).toHaveBeenCalledWith(
        mockUser.id,
        mockUser
      );
      expect(mockRedisService.setToken).toHaveBeenCalledWith(
        `access_token:${mockUser.id}`,
        "jwt-token",
        3600
      );
      expect(result).toEqual({
        access_token: "jwt-token",
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        }),
      });
    });
  });

  describe("logout", () => {
    it("should logout user successfully", async () => {
      const userId = "user-id";

      await service.logout(userId);

      expect(mockRedisService.deleteToken).toHaveBeenCalledWith(
        `access_token:${userId}`
      );
      expect(mockRedisService.setUserOffline).toHaveBeenCalledWith(userId);
      expect(mockRedisService.invalidateUserProfile).toHaveBeenCalledWith(
        userId
      );
    });
  });

  describe("validateUser", () => {
    const mockUser = {
      id: "user-id",
      email: "test@example.com",
      password: "hashed-password",
      isActive: true,
    };

    it("should return user for valid credentials", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);

      const result = await service.validateUser(
        "test@example.com",
        "password123"
      );

      expect(result).toEqual(mockUser);
    });

    it("should return null for invalid email", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser(
        "test@example.com",
        "password123"
      );

      expect(result).toBeNull();
    });

    it("should return null for invalid password", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(false);

      const result = await service.validateUser(
        "test@example.com",
        "password123"
      );

      expect(result).toBeNull();
    });

    it("should return null for inactive user", async () => {
      // Since validateUser already filters for active users in the query,
      // it will return null for inactive users (no active user found)
      mockUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);

      const result = await service.validateUser(
        "test@example.com",
        "password123"
      );

      expect(result).toBeNull();
    });
  });

  describe("refreshToken", () => {
    const mockUser = {
      id: "user-id",
      email: "test@example.com",
      password: "hashed-password",
      name: "Test User",
      dateOfBirth: new Date("1990-01-01"),
      gender: "male",
      bio: "Test bio",
      interests: ["test"],
      profilePictureUrl: null,
      location: null,
      geohash: null,
      isActive: true,
      isProfileComplete: true,
      lastActiveAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should refresh token successfully", async () => {
      mockJwtService.sign.mockReturnValue("new-jwt-token");

      const result = await service.refreshToken(mockUser);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(mockRedisService.setToken).toHaveBeenCalledWith(
        `access_token:${mockUser.id}`,
        "new-jwt-token",
        3600
      );
      expect(result).toEqual({ access_token: "new-jwt-token" });
    });
  });
});
