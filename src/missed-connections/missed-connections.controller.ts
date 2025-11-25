import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Query,
  UseGuards,
  Request,
  Param,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { MissedConnectionsService } from "./missed-connections.service";
import { CreateMissedConnectionDto } from "./dto/create-missed-connection.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags("missed-connections")
@ApiBearerAuth("JWT-auth")
@Controller("missed-connections")
@UseGuards(JwtAuthGuard)
export class MissedConnectionsController {
  constructor(
    private readonly missedConnectionsService: MissedConnectionsService
  ) {}

  @Post()
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Create missed connection",
    description:
      "Create a new missed connection post with location and description",
  })
  @ApiResponse({
    status: 201,
    description: "Missed connection created successfully",
    schema: {
      example: {
        id: "550e8400-e29b-41d4-a716-446655440009",
        userId: "550e8400-e29b-41d4-a716-446655440000",
        location: "Central Park, near the Bethesda Fountain",
        description:
          "Tall guy with brown hair, wearing a blue jacket and reading a book",
        coordinates: {
          type: "Point",
          coordinates: [-73.9654, 40.7829],
        },
        occurredAt: "2025-11-24T14:30:00Z",
        createdAt: "2025-11-24T15:00:00Z",
        updatedAt: "2025-11-24T15:00:00Z",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Validation error",
    schema: {
      example: {
        statusCode: 400,
        message: ["location should not be empty", "latitude must be a number"],
        error: "Bad Request",
      },
    },
  })
  create(
    @Request() req,
    @Body() createMissedConnectionDto: CreateMissedConnectionDto
  ) {
    return this.missedConnectionsService.create(
      req.user.id,
      createMissedConnectionDto
    );
  }

  @Get()
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get user missed connections",
    description: "Retrieve all missed connections posted by the current user",
  })
  @ApiResponse({
    status: 200,
    description: "Missed connections retrieved successfully",
    schema: {
      example: [
        {
          id: "550e8400-e29b-41d4-a716-446655440009",
          userId: "550e8400-e29b-41d4-a716-446655440000",
          location: "Central Park, near the Bethesda Fountain",
          description:
            "Tall guy with brown hair, wearing a blue jacket and reading a book",
          coordinates: {
            type: "Point",
            coordinates: [-73.9654, 40.7829],
          },
          occurredAt: "2025-11-24T14:30:00Z",
          createdAt: "2025-11-24T15:00:00Z",
          updatedAt: "2025-11-24T15:00:00Z",
        },
      ],
    },
  })
  findAll(@Request() req) {
    return this.missedConnectionsService.findAll(req.user.id);
  }

  @Get("nearby")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Find nearby missed connections",
    description:
      "Find missed connections near a specific location within a radius",
  })
  @ApiQuery({
    name: "lat",
    description: "Latitude of the search location",
    example: 40.7829,
    type: Number,
    required: true,
  })
  @ApiQuery({
    name: "lng",
    description: "Longitude of the search location",
    example: -73.9654,
    type: Number,
    required: true,
  })
  @ApiQuery({
    name: "radius",
    description: "Search radius in meters",
    example: 1000,
    type: Number,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: "Nearby missed connections retrieved successfully",
    schema: {
      example: [
        {
          id: "550e8400-e29b-41d4-a716-446655440009",
          userId: "550e8400-e29b-41d4-a716-446655440000",
          location: "Central Park, near the Bethesda Fountain",
          description:
            "Tall guy with brown hair, wearing a blue jacket and reading a book",
          coordinates: {
            type: "Point",
            coordinates: [-73.9654, 40.7829],
          },
          distance: 150,
          occurredAt: "2025-11-24T14:30:00Z",
          createdAt: "2025-11-24T15:00:00Z",
          updatedAt: "2025-11-24T15:00:00Z",
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: "Invalid coordinates",
    schema: {
      example: {
        statusCode: 400,
        message: "Invalid latitude or longitude values",
        error: "Bad Request",
      },
    },
  })
  findNearby(
    @Request() req,
    @Query("lat") lat: number,
    @Query("lng") lng: number,
    @Query("radius") radius?: number
  ) {
    return this.missedConnectionsService.findNearby(
      req.user.id,
      lat,
      lng,
      radius
    );
  }

  @Delete(":id")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Delete missed connection",
    description: "Delete a specific missed connection post",
  })
  @ApiParam({
    name: "id",
    description: "Missed connection ID to delete",
    example: "550e8400-e29b-41d4-a716-446655440009",
  })
  @ApiResponse({
    status: 200,
    description: "Missed connection deleted successfully",
    schema: {
      example: {
        message: "Missed connection deleted successfully",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Missed connection not found",
    schema: {
      example: {
        statusCode: 404,
        message: "Missed connection not found",
        error: "Not Found",
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - not the owner",
    schema: {
      example: {
        statusCode: 403,
        message: "You can only delete your own missed connections",
        error: "Forbidden",
      },
    },
  })
  remove(@Param("id") id: string, @Request() req) {
    return this.missedConnectionsService.remove(id, req.user.id);
  }
}
