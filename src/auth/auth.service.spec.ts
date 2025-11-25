import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { User } from "../entities/user.entity";
import { RedisService } from "../redis/redis.service";
import { RegisterDto } from "./dto/auth.dto";
import * as bcrypt from "bcrypt";

describe("AuthService", () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let redisService: RedisService;

  const mockUserRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockRedisService = {
    getClient: jest.fn(),
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
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    redisService = module.get<RedisService>(RedisService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("validateUser", () => {
    it("should return user if credentials are valid", async () => {
      const user = { id: "1", email: "test@example.com", password: "hashed" };
      const plainPassword = "password";

      mockUserRepository.findOneBy.mockResolvedValue(user);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);

      const result = await service.validateUser(user.email, plainPassword);

      expect(result).toEqual(user);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: user.email,
      });
    });

    it("should return null if user not found", async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      const result = await service.validateUser("test@example.com", "password");

      expect(result).toBeNull();
    });

    it("should return null if password is invalid", async () => {
      const user = { id: "1", email: "test@example.com", password: "hashed" };

      mockUserRepository.findOneBy.mockResolvedValue(user);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false);

      const result = await service.validateUser(user.email, "wrongpassword");

      expect(result).toBeNull();
    });
  });

  describe("login", () => {
    it("should return access and refresh tokens", async () => {
      const user = { id: "1", email: "test@example.com", role: "user" };
      const accessToken = "access-token";
      const refreshToken = "refresh-id.refresh-secret";

      const mockClient = {
        get: jest.fn().mockResolvedValue(null), // No existing refresh
        del: jest.fn(),
        set: jest.fn(),
      };
      mockRedisService.getClient.mockReturnValue(mockClient);
      mockJwtService.signAsync.mockResolvedValue(accessToken);
      jest
        .spyOn(service as any, "createRefreshToken")
        .mockResolvedValue(refreshToken);

      const result = await service.login(user);

      expect(result).toEqual({
        accessToken,
        refreshToken,
        expiresIn: "900s",
      });
      expect(mockClient.get).toHaveBeenCalledWith("refresh_token:1");
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
        },
        {
          secret: expect.any(String),
          expiresIn: "900s",
          issuer: expect.any(String),
        }
      );
    });

    it("should invalidate existing refresh token if user already logged in", async () => {
      const user = { id: "1", email: "test@example.com", role: "user" };
      const accessToken = "access-token";
      const refreshToken = "refresh-id.refresh-secret";

      const mockClient = {
        get: jest.fn().mockResolvedValue("old-refresh-id"), // Existing refresh
        del: jest.fn(),
        set: jest.fn(),
      };
      mockRedisService.getClient.mockReturnValue(mockClient);
      mockJwtService.signAsync.mockResolvedValue(accessToken);
      jest
        .spyOn(service as any, "createRefreshToken")
        .mockResolvedValue(refreshToken);

      await service.login(user);

      expect(mockClient.get).toHaveBeenCalledWith("refresh_token:1");
      expect(mockClient.del).toHaveBeenCalledWith("refresh_token:1");
    });
  });

  describe("refresh", () => {
    it("should return new tokens if refresh token is valid", async () => {
      const refreshToken = "refresh-id.refresh-secret";
      const userId = "1";
      const user = { id: userId, email: "test@example.com", role: "user" };
      const accessToken = "new-access-token";
      const newRefreshToken = "new-refresh-id.new-refresh-secret";

      const mockClient = {
        get: jest.fn((key) => {
          if (key === "refresh:refresh-id") {
            return Promise.resolve(
              JSON.stringify({ userId, hash: "hashed-secret" })
            );
          }
          if (key === "refresh_token:1") {
            return Promise.resolve(refreshToken);
          }
          return Promise.resolve(null);
        }),
        del: jest.fn(),
      };
      mockRedisService.getClient.mockReturnValue(mockClient);
      mockUserRepository.findOne.mockResolvedValue(user);
      mockJwtService.signAsync.mockResolvedValue(accessToken);
      jest
        .spyOn(service as any, "createRefreshToken")
        .mockResolvedValue(newRefreshToken);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);

      const result = await service.refresh(refreshToken);

      expect(result).toEqual({
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: "900s",
      });
      expect(mockClient.get).toHaveBeenCalledWith("refresh:refresh-id");
      expect(mockClient.del).toHaveBeenCalledWith("refresh:refresh-id");
      expect(mockClient.del).toHaveBeenCalledWith("refresh_token:1");
    });

    it("should throw UnauthorizedException if refresh token structure is invalid", async () => {
      await expect(service.refresh("invalid")).rejects.toThrow(
        "Invalid refresh token structure"
      );
    });

    it("should throw UnauthorizedException if refresh token not found", async () => {
      const mockClient = {
        get: jest.fn().mockResolvedValue(null),
      };
      mockRedisService.getClient.mockReturnValue(mockClient);

      await expect(service.refresh("id.secret")).rejects.toThrow(
        "Refresh token not found or revoked"
      );
    });

    it("should throw UnauthorizedException if refresh token secret is invalid", async () => {
      const mockClient = {
        get: jest
          .fn()
          .mockResolvedValue(JSON.stringify({ userId: "1", hash: "hashed" })),
        del: jest.fn(),
      };
      mockRedisService.getClient.mockReturnValue(mockClient);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false);

      await expect(service.refresh("id.secret")).rejects.toThrow(
        "Invalid refresh token"
      );
    });
  });

  describe("logout", () => {
    it("should delete refresh token from redis if valid", async () => {
      const refreshToken = "refresh-id.secret";
      const mockClient = {
        get: jest
          .fn()
          .mockResolvedValue(JSON.stringify({ userId: "1", hash: "hash" })),
        del: jest.fn(),
      };
      mockRedisService.getClient.mockReturnValue(mockClient);

      await service.logout(refreshToken);

      expect(mockClient.get).toHaveBeenCalledWith("refresh:refresh-id");
      expect(mockClient.del).toHaveBeenCalledWith("refresh:refresh-id");
      expect(mockClient.del).toHaveBeenCalledWith("refresh_token:1");
    });

    it("should throw if refresh token structure is invalid", async () => {
      await expect(service.logout("invalid")).rejects.toThrow(
        "Invalid refresh token"
      );
    });

    it("should throw if refresh token does not exist", async () => {
      const refreshToken = "refresh-id.secret";
      const mockClient = {
        get: jest.fn().mockResolvedValue(null),
        del: jest.fn(),
      };
      mockRedisService.getClient.mockReturnValue(mockClient);

      await expect(service.logout(refreshToken)).rejects.toThrow(
        "User is not logged in or token is invalid"
      );
    });
  });

  describe("register", () => {
    it("should create and return new user", async () => {
      const registerDto: RegisterDto = {
        email: "new@example.com",
        password: "password",
        name: "New User",
        dateOfBirth: "1990-01-01",
        gender: "male",
        bio: "Bio",
        interests: ["interest1"],
      };
      const hashedPassword = "hashed-password";
      const savedUser = { id: "1", ...registerDto, password: hashedPassword };

      mockUserRepository.findOne.mockResolvedValue(null);
      jest.spyOn(bcrypt, "hash").mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockReturnValue(savedUser);
      mockUserRepository.save.mockResolvedValue(savedUser);

      const result = await service.register(registerDto);

      expect(result).toEqual(savedUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...registerDto,
        password: hashedPassword,
      });
    });

    it("should throw ConflictException if user already exists", async () => {
      const registerDto: RegisterDto = {
        email: "existing@example.com",
        password: "password",
        name: "Existing User",
        dateOfBirth: "1990-01-01",
        gender: "male",
      };

      mockUserRepository.findOne.mockResolvedValue({
        id: "1",
        email: registerDto.email,
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        "User with this email already exists"
      );
    });
  });
});
