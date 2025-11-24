import { IsNotEmpty, IsString, IsOptional, IsIn } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateMessageDto {
  @ApiProperty({
    description: "The conversation ID where the message will be sent",
    example: "550e8400-e29b-41d4-a716-446655440004",
  })
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @ApiProperty({
    description: "The content of the message",
    example: "Hey! How are you doing today?",
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: "Type of message",
    example: "text",
    enum: ["text", "image", "video", "file"],
    default: "text",
  })
  @IsString()
  @IsOptional()
  @IsIn(["text", "image", "video", "file"])
  messageType?: string = "text";
}
