import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";

export enum NotificationType {
  MATCH = "match",
  MESSAGE = "message",
  LIKE = "like",
  SYSTEM = "system",
}

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "varchar", length: 50 })
  type: NotificationType;

  @Column({ type: "text" })
  title: string;

  @Column({ type: "text" })
  message: string;

  @Column({ type: "jsonb", nullable: true })
  data: any;

  @Column({ type: "boolean", default: false })
  isRead: boolean;

  @Column({ type: "timestamp with time zone", nullable: true })
  readAt: Date;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt: Date;
}
