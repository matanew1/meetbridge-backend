import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsDateString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserResponseDto } from "../../users/dto/user-response.dto";

export class RegisterDto {
  @ApiProperty({
    description: "User email address",
    example: "john.doe@example.com",
    format: "email",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "User password (minimum 8 characters)",
    example: "securePassword123",
    minLength: 8,
    maxLength: 100,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @ApiProperty({
    description: "User full name",
    example: "John Doe",
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: "User date of birth",
    example: "1990-05-15",
    format: "date",
  })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({
    description: "User gender",
    example: "male",
    enum: ["male", "female", "other"],
  })
  @IsString()
  gender: string;

  @ApiPropertyOptional({
    description: "User biography",
    example: "I love hiking and photography",
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({
    description: "User interests as array of strings",
    example: ["hiking", "photography", "cooking"],
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  interests?: string[];
}

export class LoginDto {
  @ApiProperty({
    description: "User email address",
    example: "john.doe@example.com",
    format: "email",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "User password",
    example: "securePassword123",
  })
  @IsString()
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: "JWT access token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  accessToken: string;

  @ApiProperty({
    description: "Opaque refresh token",
    example: "refreshId.tokenSecret",
  })
  refreshToken: string;

  @ApiProperty({
    description: "Access token expiry time",
    example: "900s",
  })
  expiresIn: string;
}

export class RefreshTokenResponseDto {
  @ApiProperty({
    description: "New JWT access token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  accessToken: string;

  @ApiProperty({
    description: "New opaque refresh token",
    example: "newRefreshId.newTokenSecret",
  })
  refreshToken: string;

  @ApiProperty({
    description: "Access token expiry time",
    example: "900s",
  })
  expiresIn: string;
}

export class RefreshDto {
  @ApiProperty({
    description: "Opaque refresh token",
    example: "refreshId.tokenSecret",
  })
  @IsString()
  refreshToken: string;
}

export class LogoutDto {
  @ApiProperty({
    description: "Opaque refresh token to invalidate",
    example: "refreshId.tokenSecret",
  })
  @IsString()
  refreshToken: string;
}

export class LogoutResponseDto {
  @ApiProperty({
    description: "Logout success message",
    example: "Logged out successfully",
  })
  message: string;
}
