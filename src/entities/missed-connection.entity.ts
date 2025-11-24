import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity("missed_connections")
export class MissedConnection {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "varchar", length: 100 })
  location: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "geography", spatialFeatureType: "Point", srid: 4326 })
  coordinates: any;

  @Column({ type: "varchar", length: 12 })
  geohash: string;

  @Column({ type: "timestamp with time zone" })
  occurredAt: Date;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt: Date;
}
