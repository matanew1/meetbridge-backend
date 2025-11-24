import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  Notification,
  NotificationType,
} from "../entities/notification.entity";
import { User } from "../entities/user.entity";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: any
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId,
      type,
      title,
      message,
      data,
    });

    return this.notificationRepository.save(notification);
  }

  async findAllForUser(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
      take: limit,
      skip: offset,
    });
  }

  async findUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    notification.isRead = true;
    notification.readAt = new Date();
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  async delete(id: string, userId: string): Promise<void> {
    const result = await this.notificationRepository.delete({ id, userId });
    if (result.affected === 0) {
      throw new Error("Notification not found");
    }
  }

  // Specific notification methods
  async notifyMatch(
    userId: string,
    matchedUserName: string
  ): Promise<Notification> {
    return this.create(
      userId,
      NotificationType.MATCH,
      "New Match!",
      `You matched with ${matchedUserName}!`,
      { matchedUserName }
    );
  }

  async notifyMessage(
    userId: string,
    senderName: string,
    conversationId: string
  ): Promise<Notification> {
    return this.create(
      userId,
      NotificationType.MESSAGE,
      "New Message",
      `You have a new message from ${senderName}`,
      { senderName, conversationId }
    );
  }

  async notifyLike(userId: string, likerName: string): Promise<Notification> {
    return this.create(
      userId,
      NotificationType.LIKE,
      "Someone liked you!",
      `${likerName} liked your profile`,
      { likerName }
    );
  }
}
