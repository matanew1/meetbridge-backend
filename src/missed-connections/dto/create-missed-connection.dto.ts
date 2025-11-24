import { IsNotEmpty, IsString, IsDateString, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateMissedConnectionDto {
  @ApiProperty({
    description: "Location description where the missed connection occurred",
    example: "Central Park, near the Bethesda Fountain",
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: "Detailed description of the person or situation",
    example:
      "Tall guy with brown hair, wearing a blue jacket and reading a book",
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: "Latitude coordinate of the location",
    example: 40.7829,
    type: Number,
  })
  @IsNumber()
  latitude: number;

  @ApiProperty({
    description: "Longitude coordinate of the location",
    example: -73.9654,
    type: Number,
  })
  @IsNumber()
  longitude: number;

  @ApiProperty({
    description: "Date and time when the missed connection occurred",
    example: "2025-11-24T14:30:00Z",
    format: "date-time",
  })
  @IsDateString()
  occurredAt: string;
}
