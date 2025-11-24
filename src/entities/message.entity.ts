import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Conversation } from "./conversation.entity";
import { User } from "./user.entity";

@Entity("messages")
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  conversationId: string;

  @Column({ type: "uuid" })
  senderId: string;

  @ManyToOne(() => Conversation, { onDelete: "CASCADE" })
  @JoinColumn({ name: "conversation_id" })
  conversation: Conversation;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "sender_id" })
  sender: User;

  @Column({ type: "text" })
  content: string;

  @Column({ type: "varchar", length: 20, default: "text" })
  messageType: string;

  @Column({ type: "boolean", default: false })
  isRead: boolean;

  @Column({ type: "timestamp with time zone", nullable: true })
  readAt: Date;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt: Date;
}
