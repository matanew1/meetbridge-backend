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
import { ChatService } from "./chat.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("chat")
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get("conversations")
  getConversations(@Request() req) {
    return this.chatService.findConversationsForUser(req.user.id);
  }

  @Get("conversations/:id")
  getConversation(@Param("id") id: string, @Request() req) {
    return this.chatService.findConversationById(id, req.user.id);
  }

  @Post("conversations")
  createConversation(@Body("participants") participants: string[]) {
    return this.chatService.createConversation(participants);
  }

  @Get("conversations/:id/messages")
  getMessages(
    @Param("id") id: string,
    @Request() req,
    @Query("limit") limit?: number,
    @Query("offset") offset?: number
  ) {
    return this.chatService.getMessages(id, req.user.id, limit, offset);
  }

  @Post("messages")
  sendMessage(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    const { conversationId, ...messageData } = createMessageDto as any;
    return this.chatService.sendMessage(
      conversationId,
      req.user.id,
      messageData
    );
  }

  @Put("messages/:id/read")
  markMessageAsRead(@Param("id") id: string, @Request() req) {
    return this.chatService.markMessageAsRead(id, req.user.id);
  }
}
