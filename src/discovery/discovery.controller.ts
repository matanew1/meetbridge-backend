import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from "@nestjs/swagger";
import { DiscoveryService, DiscoveryFilters } from "./discovery.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags("discovery")
@Controller("discovery")
@UseGuards(JwtAuthGuard)
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get("profiles")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get discovery profiles",
    description:
      "Retrieve a list of potential matches based on user preferences and filters",
  })
  @ApiQuery({
    name: "gender",
    required: false,
    description: "Filter by gender preference",
    example: "female",
    enum: ["male", "female", "other"],
  })
  @ApiQuery({
    name: "minAge",
    required: false,
    description: "Minimum age filter",
    example: 18,
    type: Number,
  })
  @ApiQuery({
    name: "maxAge",
    required: false,
    description: "Maximum age filter",
    example: 35,
    type: Number,
  })
  @ApiQuery({
    name: "maxDistance",
    required: false,
    description: "Maximum distance in kilometers",
    example: 50,
    type: Number,
  })
  @ApiQuery({
    name: "interests",
    required: false,
    description: "Filter by shared interests (comma-separated)",
    example: "hiking,photography,cooking",
    type: String,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of profiles to return",
    example: 20,
    type: Number,
  })
  @ApiQuery({
    name: "offset",
    required: false,
    description: "Pagination offset",
    example: 0,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: "Discovery profiles retrieved successfully",
    schema: {
      example: [
        {
          id: "550e8400-e29b-41d4-a716-446655440002",
          email: "jane.smith@example.com",
          name: "Jane Smith",
          dateOfBirth: "1992-08-20",
          gender: "female",
          bio: "Passionate about art and travel",
          interests: ["art", "travel", "music"],
          profilePictureUrl: "https://example.com/avatar2.jpg",
          isActive: true,
          isProfileComplete: true,
          lastActiveAt: "2025-11-24T10:30:00Z",
          createdAt: "2025-11-24T09:00:00Z",
          updatedAt: "2025-11-24T10:30:00Z",
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid token",
    schema: {
      example: {
        statusCode: 401,
        message: "Unauthorized",
        error: "Unauthorized",
      },
    },
  })
  getDiscoveryProfiles(
    @Request() req,
    @Query() filters: DiscoveryFilters,
    @Query("limit") limit?: number,
    @Query("offset") offset?: number
  ) {
    return this.discoveryService.getDiscoveryProfiles(
      req.user.id,
      filters,
      limit,
      offset
    );
  }

  @Post("like/:userId")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Like a profile",
    description: "Express interest in another user profile",
  })
  @ApiParam({
    name: "userId",
    description: "ID of the user to like",
    example: "550e8400-e29b-41d4-a716-446655440002",
  })
  @ApiResponse({
    status: 201,
    description: "Profile liked successfully",
    schema: {
      example: {
        message: "Profile liked successfully",
        match: {
          id: "550e8400-e29b-41d4-a716-446655440003",
          user1Id: "550e8400-e29b-41d4-a716-446655440000",
          user2Id: "550e8400-e29b-41d4-a716-446655440002",
          createdAt: "2025-11-24T10:35:00Z",
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Cannot like your own profile or already liked",
    schema: {
      example: {
        statusCode: 400,
        message: "Cannot like your own profile",
        error: "Bad Request",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "User not found",
    schema: {
      example: {
        statusCode: 404,
        message: "User not found",
        error: "Not Found",
      },
    },
  })
  likeProfile(@Request() req, @Query("userId") userId: string) {
    return this.discoveryService.likeProfile(req.user.id, userId);
  }

  @Post("pass/:userId")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Pass on a profile",
    description: "Skip a user profile (not interested)",
  })
  @ApiParam({
    name: "userId",
    description: "ID of the user to pass on",
    example: "550e8400-e29b-41d4-a716-446655440002",
  })
  @ApiResponse({
    status: 201,
    description: "Profile passed successfully",
    schema: {
      example: {
        message: "Profile passed successfully",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Cannot pass on your own profile",
    schema: {
      example: {
        statusCode: 400,
        message: "Cannot pass on your own profile",
        error: "Bad Request",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "User not found",
    schema: {
      example: {
        statusCode: 404,
        message: "User not found",
        error: "Not Found",
      },
    },
  })
  passProfile(@Request() req, @Query("userId") userId: string) {
    return this.discoveryService.passProfile(req.user.id, userId);
  }
}
