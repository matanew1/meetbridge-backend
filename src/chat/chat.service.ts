import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Conversation } from "../entities/conversation.entity";
import { Message } from "../entities/message.entity";
import { User } from "../entities/user.entity";
import { CreateMessageDto } from "./dto/create-message.dto";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async createConversation(participants: string[]): Promise<Conversation> {
    // Ensure all participants exist
    for (const participantId of participants) {
      const user = await this.userRepository.findOne({
        where: { id: participantId },
      });
      if (!user) {
        throw new NotFoundException(`User ${participantId} not found`);
      }
    }

    const conversation = this.conversationRepository.create({ participants });
    return this.conversationRepository.save(conversation);
  }

  async findConversationsForUser(userId: string): Promise<Conversation[]> {
    return this.conversationRepository
      .createQueryBuilder("conversation")
      .where(":userId = ANY(conversation.participants)", { userId })
      .leftJoinAndSelect("conversation.messages", "messages")
      .orderBy("conversation.lastMessageAt", "DESC")
      .getMany();
  }

  async findConversationById(
    id: string,
    userId: string
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ["messages", "messages.sender"],
    });

    if (!conversation || !conversation.participants.includes(userId)) {
      throw new NotFoundException("Conversation not found");
    }

    return conversation;
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    createMessageDto: CreateMessageDto
  ): Promise<Message> {
    // Verify conversation exists and user is participant
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });
    if (!conversation || !conversation.participants.includes(senderId)) {
      throw new NotFoundException("Conversation not found");
    }

    const message = this.messageRepository.create({
      conversationId,
      senderId,
      ...createMessageDto,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update conversation's last message time
    await this.conversationRepository.update(conversationId, {
      lastMessageAt: new Date(),
    });

    return savedMessage;
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ["conversation"],
    });

    if (!message || !message.conversation.participants.includes(userId)) {
      throw new NotFoundException("Message not found");
    }

    message.isRead = true;
    message.readAt = new Date();
    return this.messageRepository.save(message);
  }

  async getMessages(
    conversationId: string,
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<Message[]> {
    // Verify user is participant
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });
    if (!conversation || !conversation.participants.includes(userId)) {
      throw new NotFoundException("Conversation not found");
    }

    return this.messageRepository.find({
      where: { conversationId },
      relations: ["sender"],
      order: { createdAt: "DESC" },
      take: limit,
      skip: offset,
    });
  }
}
