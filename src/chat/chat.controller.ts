import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from "@nestjs/swagger";
import { ChatService } from "./chat.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags("chat")
@Controller("chat")
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get("conversations")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get user conversations",
    description: "Retrieve all conversations for the current user",
  })
  @ApiResponse({
    status: 200,
    description: "Conversations retrieved successfully",
    schema: {
      example: [
        {
          id: "550e8400-e29b-41d4-a716-446655440004",
          participants: [
            "550e8400-e29b-41d4-a716-446655440000",
            "550e8400-e29b-41d4-a716-446655440002",
          ],
          lastMessage: {
            id: "550e8400-e29b-41d4-a716-446655440005",
            content: "Hey! How are you doing today?",
            messageType: "text",
            senderId: "550e8400-e29b-41d4-a716-446655440000",
            createdAt: "2025-11-24T11:00:00Z",
          },
          createdAt: "2025-11-24T10:35:00Z",
          updatedAt: "2025-11-24T11:00:00Z",
        },
      ],
    },
  })
  getConversations(@Request() req) {
    return this.chatService.findConversationsForUser(req.user.id);
  }

  @Get("conversations/:id")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get conversation details",
    description: "Retrieve detailed information about a specific conversation",
  })
  @ApiParam({
    name: "id",
    description: "Conversation ID",
    example: "550e8400-e29b-41d4-a716-446655440004",
  })
  @ApiResponse({
    status: 200,
    description: "Conversation details retrieved successfully",
    schema: {
      example: {
        id: "550e8400-e29b-41d4-a716-446655440004",
        participants: [
          {
            id: "550e8400-e29b-41d4-a716-446655440000",
            name: "John Doe",
            profilePictureUrl: "https://example.com/avatar.jpg",
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440002",
            name: "Jane Smith",
            profilePictureUrl: "https://example.com/avatar2.jpg",
          },
        ],
        messages: [],
        createdAt: "2025-11-24T10:35:00Z",
        updatedAt: "2025-11-24T11:00:00Z",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Conversation not found",
    schema: {
      example: {
        statusCode: 404,
        message: "Conversation not found",
        error: "Not Found",
      },
    },
  })
  getConversation(@Param("id") id: string, @Request() req) {
    return this.chatService.findConversationById(id, req.user.id);
  }

  @Post("conversations")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Create new conversation",
    description: "Create a new conversation with specified participants",
  })
  @ApiBody({
    description: "Conversation creation data",
    schema: {
      type: "object",
      properties: {
        participants: {
          type: "array",
          items: { type: "string" },
          example: [
            "550e8400-e29b-41d4-a716-446655440000",
            "550e8400-e29b-41d4-a716-446655440002",
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Conversation created successfully",
    schema: {
      example: {
        id: "550e8400-e29b-41d4-a716-446655440004",
        participants: [
          "550e8400-e29b-41d4-a716-446655440000",
          "550e8400-e29b-41d4-a716-446655440002",
        ],
        createdAt: "2025-11-24T10:35:00Z",
        updatedAt: "2025-11-24T10:35:00Z",
      },
    },
  })
  createConversation(@Body("participants") participants: string[]) {
    return this.chatService.createConversation(participants);
  }

  @Get("conversations/:id/messages")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get conversation messages",
    description:
      "Retrieve messages from a specific conversation with pagination",
  })
  @ApiParam({
    name: "id",
    description: "Conversation ID",
    example: "550e8400-e29b-41d4-a716-446655440004",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of messages to return",
    example: 50,
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
    description: "Messages retrieved successfully",
    schema: {
      example: [
        {
          id: "550e8400-e29b-41d4-a716-446655440005",
          conversationId: "550e8400-e29b-41d4-a716-446655440004",
          senderId: "550e8400-e29b-41d4-a716-446655440000",
          content: "Hey! How are you doing today?",
          messageType: "text",
          isRead: false,
          createdAt: "2025-11-24T11:00:00Z",
          updatedAt: "2025-11-24T11:00:00Z",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440006",
          conversationId: "550e8400-e29b-41d4-a716-446655440004",
          senderId: "550e8400-e29b-41d4-a716-446655440002",
          content: "Hi! I'm doing great, thanks for asking!",
          messageType: "text",
          isRead: true,
          createdAt: "2025-11-24T11:05:00Z",
          updatedAt: "2025-11-24T11:05:00Z",
        },
      ],
    },
  })
  getMessages(
    @Param("id") id: string,
    @Request() req,
    @Query("limit") limit?: number,
    @Query("offset") offset?: number
  ) {
    return this.chatService.getMessages(id, req.user.id, limit, offset);
  }

  @Post("messages")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Send message",
    description: "Send a new message to a conversation",
  })
  @ApiResponse({
    status: 201,
    description: "Message sent successfully",
    schema: {
      example: {
        id: "550e8400-e29b-41d4-a716-446655440005",
        conversationId: "550e8400-e29b-41d4-a716-446655440004",
        senderId: "550e8400-e29b-41d4-a716-446655440000",
        content: "Hey! How are you doing today?",
        messageType: "text",
        isRead: false,
        createdAt: "2025-11-24T11:00:00Z",
        updatedAt: "2025-11-24T11:00:00Z",
      },
    },
  })
  sendMessage(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    const { conversationId, ...messageData } = createMessageDto as any;
    return this.chatService.sendMessage(
      conversationId,
      req.user.id,
      messageData
    );
  }

  @Put("messages/:id/read")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Mark message as read",
    description: "Mark a specific message as read by the current user",
  })
  @ApiParam({
    name: "id",
    description: "Message ID to mark as read",
    example: "550e8400-e29b-41d4-a716-446655440005",
  })
  @ApiResponse({
    status: 200,
    description: "Message marked as read successfully",
    schema: {
      example: {
        id: "550e8400-e29b-41d4-a716-446655440005",
        conversationId: "550e8400-e29b-41d4-a716-446655440004",
        senderId: "550e8400-e29b-41d4-a716-446655440002",
        content: "Hi! I'm doing great, thanks for asking!",
        messageType: "text",
        isRead: true,
        readAt: "2025-11-24T11:10:00Z",
        createdAt: "2025-11-24T11:05:00Z",
        updatedAt: "2025-11-24T11:10:00Z",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Message not found",
    schema: {
      example: {
        statusCode: 404,
        message: "Message not found",
        error: "Not Found",
      },
    },
  })
  markMessageAsRead(@Param("id") id: string, @Request() req) {
    return this.chatService.markMessageAsRead(id, req.user.id);
  }
}
