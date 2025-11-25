import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  RefreshTokenResponseDto,
  RefreshDto,
  LogoutDto,
} from "./dto/auth.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({
    summary: "Register a new user",
    description:
      "Create a new user account with email, password, and profile information.",
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: "User successfully registered",
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: "User with this email already exists",
  })
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return this.authService.login(user);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Login user",
    description: "Authenticate user with email and password.",
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: "User successfully logged in",
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Invalid credentials",
  })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password
    );
    if (!user) {
      return { error: "Invalid credentials" };
    }
    return this.authService.login(user);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Refresh access token",
    description: "Refresh the access token using refresh token.",
  })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({
    status: 200,
    description: "Access token refreshed",
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Invalid refresh token",
  })
  async refresh(@Body() refreshDto: RefreshDto) {
    return this.authService.refresh(refreshDto.refreshToken);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Logout user",
    description:
      "Logout the current user, invalidate refresh token, and optionally blacklist access token.",
  })
  @ApiBody({ type: LogoutDto })
  @ApiResponse({
    status: 200,
    description: "User successfully logged out",
  })
  async logout(@Body() logoutDto: LogoutDto, @Request() req) {
    const accessToken = req.headers.authorization?.replace("Bearer ", "");
    await this.authService.logout(logoutDto.refreshToken, accessToken);
    return { message: "Logged out successfully" };
  }
}
