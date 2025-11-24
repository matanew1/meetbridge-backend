import { IsNotEmpty, IsString, IsOptional, IsIn } from "class-validator";

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  @IsIn(["text", "image", "video", "file"])
  messageType?: string = "text";
}
