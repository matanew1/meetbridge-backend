import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  RefreshTokenResponseDto,
  LogoutResponseDto,
} from "./dto/auth.dto";
import { LocalAuthGuard } from "./local-auth.guard";
import { JwtAuthGuard } from "./jwt-auth.guard";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({
    summary: "Register a new user",
    description:
      "Create a new user account with email, password, and profile information. JWT token is returned in response and stored in Redis.",
  })
  @ApiResponse({
    status: 201,
    description:
      "User successfully registered and logged in (JWT token returned in response and stored in Redis)",
    type: AuthResponseDto,
    schema: {
      example: {
        access_token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwiaWF0IjoxNjM3NzYwMDAwLCJleHAiOjE2Mzc3NjM2MDB9.example",
        user: {
          id: "550e8400-e29b-41d4-a716-446655440000",
          email: "john.doe@example.com",
          name: "John Doe",
          dateOfBirth: "1990-05-15",
          gender: "male",
          bio: "I love hiking and photography",
          interests: ["hiking", "photography", "cooking"],
          profilePictureUrl: "https://example.com/avatar.jpg",
          isActive: true,
          isProfileComplete: true,
          lastActiveAt: "2025-11-24T10:30:00Z",
          createdAt: "2025-11-24T09:00:00Z",
          updatedAt: "2025-11-24T10:30:00Z",
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: "User with this email already exists",
    schema: {
      example: {
        statusCode: 409,
        message: "User with this email already exists",
        error: "Conflict",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Validation error",
    schema: {
      example: {
        statusCode: 400,
        message: [
          "email must be an email",
          "password must be longer than or equal to 8 characters",
        ],
        error: "Bad Request",
      },
    },
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Login user",
    description:
      "Authenticate user with email and password. JWT token is returned in response and stored in Redis.",
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description:
      "User successfully logged in (JWT token returned in response and stored in Redis)",
    type: AuthResponseDto,
    schema: {
      example: {
        access_token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwiaWF0IjoxNjM3NzYwMDAwLCJleHAiOjE2Mzc3NjM2MDB9.example",
        user: {
          id: "550e8400-e29b-41d4-a716-446655440000",
          email: "john.doe@example.com",
          name: "John Doe",
          dateOfBirth: "1990-05-15",
          gender: "male",
          bio: "I love hiking and photography",
          interests: ["hiking", "photography"],
          isActive: true,
          isProfileComplete: true,
          lastActiveAt: "2025-11-24T10:30:00Z",
          createdAt: "2025-11-24T09:00:00Z",
          updatedAt: "2025-11-24T10:30:00Z",
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Invalid credentials",
    schema: {
      example: {
        statusCode: 401,
        message: "Invalid credentials",
        error: "Unauthorized",
      },
    },
  })
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post("refresh")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Refresh access token",
    description:
      "Generate a new access token using the current valid token. New token is returned in response and stored in Redis.",
  })
  @ApiResponse({
    status: 201,
    description:
      "New access token generated (returned in response and stored in Redis)",
    type: RefreshTokenResponseDto,
    schema: {
      example: {
        access_token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwiaWF0IjoxNjM3NzYzNjAwLCJleHAiOjE2Mzc3NjcyMDB9.example",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or expired token",
    schema: {
      example: {
        statusCode: 401,
        message: "Unauthorized",
        error: "Unauthorized",
      },
    },
  })
  async refresh(@Request() req) {
    return this.authService.refreshToken(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Logout user",
    description:
      "Logout the current user and invalidate their session. Removes access token from Redis.",
  })
  @ApiResponse({
    status: 201,
    description:
      "User successfully logged out (access token removed from Redis)",
    type: LogoutResponseDto,
    schema: {
      example: {
        message: "Logged out successfully",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid token",
    schema: {
      example: {
        statusCode: 401,
        message: "Unauthorized",
        error: "Unauthorized",
      },
    },
  })
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }
}
