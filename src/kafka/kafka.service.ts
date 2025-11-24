import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

export enum KafkaTopics {
  USER_CREATED = 'user.created',
  MATCH_CREATED = 'match.created',
  MESSAGE_SENT = 'message.sent',
  NOTIFICATION_SENT = 'notification.sent',
  MISSED_CONNECTION_CREATED = 'missed-connection.created',
}

@Injectable()
export class KafkaService implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    // Subscribe to response topics if needed
    // this.kafkaClient.subscribeToResponseOf('some-request-topic');
    await this.kafkaClient.connect();
  }

  async emitUserCreated(userId: string, userData: any) {
    return this.kafkaClient.emit(KafkaTopics.USER_CREATED, {
      userId,
      userData,
      timestamp: new Date().toISOString(),
    });
  }

  async emitMatchCreated(matchId: string, userId1: string, userId2: string) {
    return this.kafkaClient.emit(KafkaTopics.MATCH_CREATED, {
      matchId,
      userId1,
      userId2,
      timestamp: new Date().toISOString(),
    });
  }

  async emitMessageSent(conversationId: string, messageId: string, senderId: string, receiverId: string) {
    return this.kafkaClient.emit(KafkaTopics.MESSAGE_SENT, {
      conversationId,
      messageId,
      senderId,
      receiverId,
      timestamp: new Date().toISOString(),
    });
  }

  async emitNotificationSent(notificationId: string, userId: string, type: string) {
    return this.kafkaClient.emit(KafkaTopics.NOTIFICATION_SENT, {
      notificationId,
      userId,
      type,
      timestamp: new Date().toISOString(),
    });
  }

  async emitMissedConnectionCreated(missedConnectionId: string, userId: string, targetUserId: string) {
    return this.kafkaClient.emit(KafkaTopics.MISSED_CONNECTION_CREATED, {
      missedConnectionId,
      userId,
      targetUserId,
      timestamp: new Date().toISOString(),
    });
  }

  // Method to send messages with response handling
  async sendMessageWithResponse(topic: string, message: any) {
    return this.kafkaClient.send(topic, message).toPromise();
  }
}