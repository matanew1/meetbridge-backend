import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsDateString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

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
    description: "JWT access token (stored in Redis)",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  access_token: string;

  @ApiProperty({
    description: "User information",
    type: "object",
    properties: {
      id: { type: "string", example: "550e8400-e29b-41d4-a716-446655440000" },
      email: { type: "string", example: "john.doe@example.com" },
      name: { type: "string", example: "John Doe" },
      dateOfBirth: { type: "string", format: "date", example: "1990-05-15" },
      gender: { type: "string", example: "male" },
      bio: { type: "string", example: "I love hiking and photography" },
      interests: {
        type: "array",
        items: { type: "string" },
        example: ["hiking", "photography"],
      },
      profilePictureUrl: {
        type: "string",
        example: "https://example.com/avatar.jpg",
      },
      isActive: { type: "boolean", example: true },
      isProfileComplete: { type: "boolean", example: true },
      lastActiveAt: {
        type: "string",
        format: "date-time",
        example: "2025-11-24T10:30:00Z",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2025-11-24T09:00:00Z",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2025-11-24T10:30:00Z",
      },
    },
  })
  user: any;
}

export class RefreshTokenResponseDto {
  @ApiProperty({
    description: "New JWT access token (also set in HTTP-only cookie)",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  access_token: string;
}

export class LogoutResponseDto {
  @ApiProperty({
    description: "Logout success message",
    example: "Logged out successfully",
  })
  message: string;
}
