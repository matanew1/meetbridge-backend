import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { User } from "./user.entity";

@Entity("matches")
@Unique(["userId1", "userId2"])
export class Match {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  userId1: string;

  @Column({ type: "uuid" })
  userId2: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id_1" })
  user1: User;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id_2" })
  user2: User;

  @Column({ type: "boolean", default: false })
  isMutual: boolean;

  @CreateDateColumn({ type: "timestamp with time zone" })
  matchedAt: Date;
}
