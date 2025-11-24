import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";
import { IsOptional, IsBoolean, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: "Whether the user profile is complete",
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  isProfileComplete?: boolean;

  @ApiPropertyOptional({
    description: "New password (will be hashed)",
    example: "newSecurePassword123",
    minLength: 8,
  })
  @IsString()
  @IsOptional()
  password?: string;
}
