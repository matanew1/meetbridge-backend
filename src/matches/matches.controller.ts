import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { MatchesService } from "./matches.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags("matches")
@Controller("matches")
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get all matches for user",
    description:
      "Retrieve all matches (both mutual and pending) for the current user",
  })
  @ApiResponse({
    status: 200,
    description: "Matches retrieved successfully",
    schema: {
      example: [
        {
          id: "550e8400-e29b-41d4-a716-446655440003",
          user1Id: "550e8400-e29b-41d4-a716-446655440000",
          user2Id: "550e8400-e29b-41d4-a716-446655440002",
          isMutual: true,
          createdAt: "2025-11-24T10:35:00Z",
          updatedAt: "2025-11-24T10:35:00Z",
          user1: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            name: "John Doe",
            profilePictureUrl: "https://example.com/avatar.jpg",
          },
          user2: {
            id: "550e8400-e29b-41d4-a716-446655440002",
            name: "Jane Smith",
            profilePictureUrl: "https://example.com/avatar2.jpg",
          },
        },
      ],
    },
  })
  findAllForUser(@Request() req) {
    return this.matchesService.findAllForUser(req.user.id);
  }

  @Get("mutual")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get mutual matches",
    description:
      "Retrieve only mutual matches (where both users have liked each other)",
  })
  @ApiResponse({
    status: 200,
    description: "Mutual matches retrieved successfully",
    schema: {
      example: [
        {
          id: "550e8400-e29b-41d4-a716-446655440003",
          user1Id: "550e8400-e29b-41d4-a716-446655440000",
          user2Id: "550e8400-e29b-41d4-a716-446655440002",
          isMutual: true,
          createdAt: "2025-11-24T10:35:00Z",
          updatedAt: "2025-11-24T10:35:00Z",
          user1: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            name: "John Doe",
            profilePictureUrl: "https://example.com/avatar.jpg",
          },
          user2: {
            id: "550e8400-e29b-41d4-a716-446655440002",
            name: "Jane Smith",
            profilePictureUrl: "https://example.com/avatar2.jpg",
          },
        },
      ],
    },
  })
  findMutualMatches(@Request() req) {
    return this.matchesService.findMutualMatches(req.user.id);
  }

  @Post(":userId")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Create a match",
    description: "Create a new match between current user and specified user",
  })
  @ApiParam({
    name: "userId",
    description: "ID of the user to match with",
    example: "550e8400-e29b-41d4-a716-446655440002",
  })
  @ApiResponse({
    status: 201,
    description: "Match created successfully",
    schema: {
      example: {
        id: "550e8400-e29b-41d4-a716-446655440003",
        user1Id: "550e8400-e29b-41d4-a716-446655440000",
        user2Id: "550e8400-e29b-41d4-a716-446655440002",
        isMutual: false,
        createdAt: "2025-11-24T10:35:00Z",
        updatedAt: "2025-11-24T10:35:00Z",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Match already exists or invalid user",
    schema: {
      example: {
        statusCode: 400,
        message: "Match already exists between these users",
        error: "Bad Request",
      },
    },
  })
  create(@Request() req, @Param("userId") userId: string) {
    return this.matchesService.create(req.user.id, userId);
  }

  @Post(":id/mutual")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Make match mutual",
    description:
      "Convert a one-way match to a mutual match (both users like each other)",
  })
  @ApiParam({
    name: "id",
    description: "Match ID to make mutual",
    example: "550e8400-e29b-41d4-a716-446655440003",
  })
  @ApiResponse({
    status: 201,
    description: "Match made mutual successfully",
    schema: {
      example: {
        id: "550e8400-e29b-41d4-a716-446655440003",
        user1Id: "550e8400-e29b-41d4-a716-446655440000",
        user2Id: "550e8400-e29b-41d4-a716-446655440002",
        isMutual: true,
        createdAt: "2025-11-24T10:35:00Z",
        updatedAt: "2025-11-24T10:40:00Z",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Match not found",
    schema: {
      example: {
        statusCode: 404,
        message: "Match not found",
        error: "Not Found",
      },
    },
  })
  makeMutual(@Param("id") id: string) {
    return this.matchesService.makeMutual(id);
  }

  @Delete(":id")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Delete a match",
    description: "Remove a match between users",
  })
  @ApiParam({
    name: "id",
    description: "Match ID to delete",
    example: "550e8400-e29b-41d4-a716-446655440003",
  })
  @ApiResponse({
    status: 200,
    description: "Match deleted successfully",
    schema: {
      example: {
        message: "Match deleted successfully",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Match not found",
    schema: {
      example: {
        statusCode: 404,
        message: "Match not found",
        error: "Not Found",
      },
    },
  })
  remove(@Param("id") id: string) {
    return this.matchesService.remove(id);
  }
}
