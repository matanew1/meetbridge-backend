import { IsNotEmpty, IsString, IsDateString, IsNumber } from "class-validator";

export class CreateMissedConnectionDto {
  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsDateString()
  occurredAt: string;
}
