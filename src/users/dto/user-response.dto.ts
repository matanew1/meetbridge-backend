import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UserResponseDto {
  @ApiProperty({
    description: "User unique identifier",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  id: string;

  @ApiProperty({
    description: "User email address",
    example: "john.doe@example.com",
  })
  email: string;

  @ApiProperty({
    description: "User full name",
    example: "John Doe",
  })
  name: string;

  @ApiProperty({
    description: "User date of birth",
    example: "1990-05-15",
    format: "date",
  })
  dateOfBirth: string;

  @ApiProperty({
    description: "User gender",
    example: "male",
  })
  gender: string;

  @ApiPropertyOptional({
    description: "User biography",
    example: "I love hiking and photography",
  })
  bio?: string;

  @ApiPropertyOptional({
    description: "User interests",
    example: ["hiking", "photography"],
    type: [String],
  })
  interests?: string[];

  @ApiPropertyOptional({
    description: "Profile picture URL",
    example: "https://example.com/avatar.jpg",
  })
  profilePictureUrl?: string;

  @ApiProperty({
    description: "Whether the user is active",
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: "Whether the profile is complete",
    example: true,
  })
  isProfileComplete: boolean;

  @ApiProperty({
    description: "Last active timestamp",
    example: "2025-11-24T10:30:00.000Z",
    format: "date-time",
  })
  lastActiveAt: Date;

  @ApiProperty({
    description: "Account creation timestamp",
    example: "2025-11-24T09:00:00.000Z",
    format: "date-time",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Last update timestamp",
    example: "2025-11-24T10:30:00.000Z",
    format: "date-time",
  })
  updatedAt: Date;
}
