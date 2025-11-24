import {
  Controller,
  Get,
  Put,
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
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags("notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get user notifications",
    description:
      "Retrieve all notifications for the current user with pagination",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of notifications to return",
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
    description: "Notifications retrieved successfully",
    schema: {
      example: [
        {
          id: "550e8400-e29b-41d4-a716-446655440007",
          userId: "550e8400-e29b-41d4-a716-446655440000",
          type: "match",
          title: "New Match!",
          message: "You have a new match with Jane Smith",
          data: {
            matchId: "550e8400-e29b-41d4-a716-446655440003",
            userId: "550e8400-e29b-41d4-a716-446655440002",
          },
          isRead: false,
          createdAt: "2025-11-24T10:35:00Z",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440008",
          userId: "550e8400-e29b-41d4-a716-446655440000",
          type: "message",
          title: "New Message",
          message: "Jane Smith sent you a message",
          data: {
            conversationId: "550e8400-e29b-41d4-a716-446655440004",
            messageId: "550e8400-e29b-41d4-a716-446655440005",
          },
          isRead: false,
          createdAt: "2025-11-24T11:00:00Z",
        },
      ],
    },
  })
  findAll(
    @Request() req,
    @Query("limit") limit?: number,
    @Query("offset") offset?: number
  ) {
    return this.notificationsService.findAllForUser(req.user.id, limit, offset);
  }

  @Get("unread-count")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get unread notifications count",
    description: "Get the count of unread notifications for the current user",
  })
  @ApiResponse({
    status: 200,
    description: "Unread count retrieved successfully",
    schema: {
      example: {
        count: 3,
      },
    },
  })
  getUnreadCount(@Request() req) {
    return this.notificationsService.findUnreadCount(req.user.id);
  }

  @Put(":id/read")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Mark notification as read",
    description: "Mark a specific notification as read",
  })
  @ApiParam({
    name: "id",
    description: "Notification ID to mark as read",
    example: "550e8400-e29b-41d4-a716-446655440007",
  })
  @ApiResponse({
    status: 200,
    description: "Notification marked as read successfully",
    schema: {
      example: {
        id: "550e8400-e29b-41d4-a716-446655440007",
        userId: "550e8400-e29b-41d4-a716-446655440000",
        type: "match",
        title: "New Match!",
        message: "You have a new match with Jane Smith",
        isRead: true,
        readAt: "2025-11-24T11:15:00Z",
        createdAt: "2025-11-24T10:35:00Z",
        updatedAt: "2025-11-24T11:15:00Z",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Notification not found",
    schema: {
      example: {
        statusCode: 404,
        message: "Notification not found",
        error: "Not Found",
      },
    },
  })
  markAsRead(@Param("id") id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Put("read-all")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Mark all notifications as read",
    description: "Mark all notifications for the current user as read",
  })
  @ApiResponse({
    status: 200,
    description: "All notifications marked as read successfully",
    schema: {
      example: {
        message: "All notifications marked as read",
        updatedCount: 5,
      },
    },
  })
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(":id")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Delete notification",
    description: "Delete a specific notification",
  })
  @ApiParam({
    name: "id",
    description: "Notification ID to delete",
    example: "550e8400-e29b-41d4-a716-446655440007",
  })
  @ApiResponse({
    status: 200,
    description: "Notification deleted successfully",
    schema: {
      example: {
        message: "Notification deleted successfully",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Notification not found",
    schema: {
      example: {
        statusCode: 404,
        message: "Notification not found",
        error: "Not Found",
      },
    },
  })
  remove(@Param("id") id: string, @Request() req) {
    return this.notificationsService.delete(id, req.user.id);
  }
}
