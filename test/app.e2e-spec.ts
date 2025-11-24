import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { TestAppModule } from "./test-app.module";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../src/entities/user.entity";
import { RedisService } from "../src/redis/redis.service";

describe("Auth (e2e)", () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let redisService: RedisService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User)
    );
    redisService = moduleFixture.get<RedisService>(RedisService);

    // Clear database and Redis before each test
    await userRepository.clear();
    await redisService.reset();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("/auth/register (POST)", () => {
    const registerData = {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
      dateOfBirth: "1990-01-01",
      gender: "male",
      bio: "Test bio",
      interests: ["test"],
    };

    it("should register a new user successfully", () => {
      return request(app.getHttpServer())
        .post("/auth/register")
        .send(registerData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("access_token");
          expect(res.body).toHaveProperty("user");
          expect(res.body.user.email).toBe(registerData.email);
          expect(res.body.user.name).toBe(registerData.name);
          expect(res.body.user).not.toHaveProperty("password");
        });
    });

    it("should return 409 for existing email", async () => {
      // First register
      await request(app.getHttpServer())
        .post("/auth/register")
        .send(registerData)
        .expect(201);

      // Try to register again with same email
      return request(app.getHttpServer())
        .post("/auth/register")
        .send(registerData)
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toBe("User with this email already exists");
        });
    });

    it("should return 400 for invalid data", () => {
      const invalidData = {
        email: "invalid-email",
        password: "123", // too short
        name: "T", // too short
        dateOfBirth: "invalid-date",
        gender: "male",
      };

      return request(app.getHttpServer())
        .post("/auth/register")
        .send(invalidData)
        .expect(400);
    });
  });

  describe("/auth/login (POST)", () => {
    const registerData = {
      email: "login@example.com",
      password: "password123",
      name: "Login User",
      dateOfBirth: "1990-01-01",
      gender: "male",
    };

    const loginData = {
      email: "login@example.com",
      password: "password123",
    };

    beforeEach(async () => {
      // Register user first
      await request(app.getHttpServer())
        .post("/auth/register")
        .send(registerData)
        .expect(201);
    });

    it("should login user successfully", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .send(loginData)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("access_token");
          expect(res.body).toHaveProperty("user");
          expect(res.body.user.email).toBe(loginData.email);
          expect(res.body.user).not.toHaveProperty("password");
        });
    });

    it("should return 401 for invalid credentials", () => {
      const invalidLogin = {
        email: "login@example.com",
        password: "wrongpassword",
      };

      return request(app.getHttpServer())
        .post("/auth/login")
        .send(invalidLogin)
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe("Invalid credentials");
        });
    });

    it("should return 401 for non-existent user", () => {
      const nonExistentLogin = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      return request(app.getHttpServer())
        .post("/auth/login")
        .send(nonExistentLogin)
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe("Invalid credentials");
        });
    });
  });

  describe("/auth/refresh (POST)", () => {
    const registerData = {
      email: "refresh@example.com",
      password: "password123",
      name: "Refresh User",
      dateOfBirth: "1990-01-01",
      gender: "male",
    };

    let accessToken: string;

    beforeEach(async () => {
      // Register and login user first
      const registerResponse = await request(app.getHttpServer())
        .post("/auth/register")
        .send(registerData)
        .expect(201);

      accessToken = registerResponse.body.access_token;
    });

    it("should refresh token successfully", () => {
      return request(app.getHttpServer())
        .post("/auth/refresh")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("access_token");
          expect(typeof res.body.access_token).toBe("string");
        });
    });

    it("should return 401 for invalid token", () => {
      return request(app.getHttpServer())
        .post("/auth/refresh")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);
    });

    it("should return 401 without authorization header", () => {
      return request(app.getHttpServer()).post("/auth/refresh").expect(401);
    });
  });

  describe("/auth/logout (POST)", () => {
    const registerData = {
      email: "logout@example.com",
      password: "password123",
      name: "Logout User",
      dateOfBirth: "1990-01-01",
      gender: "male",
    };

    let accessToken: string;

    beforeEach(async () => {
      // Register and login user first
      const registerResponse = await request(app.getHttpServer())
        .post("/auth/register")
        .send(registerData)
        .expect(201);

      accessToken = registerResponse.body.access_token;
    });

    it("should logout user successfully", () => {
      return request(app.getHttpServer())
        .post("/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("message");
          expect(res.body.message).toBe("Logged out successfully");
        });
    });

    it("should return 401 for invalid token", () => {
      return request(app.getHttpServer())
        .post("/auth/logout")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);
    });

    it("should return 401 without authorization header", () => {
      return request(app.getHttpServer()).post("/auth/logout").expect(401);
    });
  });

  describe("Token validation and Redis integration", () => {
    const registerData = {
      email: "token@example.com",
      password: "password123",
      name: "Token User",
      dateOfBirth: "1990-01-01",
      gender: "male",
    };

    let accessToken: string;
    let userId: string;

    beforeEach(async () => {
      // Register user
      const registerResponse = await request(app.getHttpServer())
        .post("/auth/register")
        .send(registerData)
        .expect(201);

      accessToken = registerResponse.body.access_token;
      userId = registerResponse.body.user.id;
    });

    it("should validate token against Redis after logout", async () => {
      // First, logout the user
      await request(app.getHttpServer())
        .post("/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(201);

      // Now try to use the token - should fail because it's removed from Redis
      await request(app.getHttpServer())
        .post("/auth/refresh")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(401);
    });

    it("should allow token refresh and validate new token", async () => {
      // Refresh token
      const refreshResponse = await request(app.getHttpServer())
        .post("/auth/refresh")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(201);

      const newToken = refreshResponse.body.access_token;

      // Use new token for another protected operation
      await request(app.getHttpServer())
        .post("/auth/logout")
        .set("Authorization", `Bearer ${newToken}`)
        .expect(201);
    });
  });
});
