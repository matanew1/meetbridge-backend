import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsArray,
  IsUrl,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({
    description: "User email address",
    example: "jane.smith@example.com",
    format: "email",
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "User password",
    example: "securePassword456",
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: "User full name",
    example: "Jane Smith",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "User date of birth",
    example: "1992-08-20",
    format: "date",
  })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({
    description: "User gender",
    example: "female",
    enum: ["male", "female", "other"],
  })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiPropertyOptional({
    description: "User biography",
    example: "Passionate about art and travel",
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({
    description: "User interests as array of strings",
    example: ["art", "travel", "music"],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  interests?: string[];

  @ApiPropertyOptional({
    description: "Profile picture URL",
    example: "https://example.com/avatar2.jpg",
    format: "url",
  })
  @IsUrl()
  @IsOptional()
  profilePictureUrl?: string;
}
