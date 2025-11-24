import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { JwtStrategy } from "./jwt.strategy";
import { RedisService } from "../redis/redis.service";
import { UnauthorizedException } from "@nestjs/common";

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;
  let redisService: RedisService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockRedisService = {
    getToken: jest.fn(),
  };

  beforeEach(async () => {
    mockConfigService.get.mockReturnValue("test-secret");

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    redisService = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("validate", () => {
    const payload = {
      sub: "user-id",
      email: "test@example.com",
    };

    it("should validate and return user payload when token exists in Redis", async () => {
      mockRedisService.getToken.mockResolvedValue("valid-token");

      const result = await strategy.validate(payload);

      expect(mockRedisService.getToken).toHaveBeenCalledWith(
        "access_token:user-id"
      );
      expect(result).toEqual({
        id: payload.sub,
        email: payload.email,
      });
    });

    it("should throw UnauthorizedException when token does not exist in Redis", async () => {
      mockRedisService.getToken.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException
      );
      expect(mockRedisService.getToken).toHaveBeenCalledWith(
        "access_token:user-id"
      );
    });
  });
});
