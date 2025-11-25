import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255 })
  password: string;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "date" })
  dateOfBirth: Date;

  @Column({ type: "varchar", length: 20 })
  gender: string;

  @Column({ type: "text", nullable: true })
  bio: string;

  @Column({ type: "text", array: true, nullable: true })
  interests: string[];

  @Column({ type: "varchar", length: 500, nullable: true })
  profilePictureUrl: string;

  @Column({
    type: "geography",
    spatialFeatureType: "Point",
    srid: 4326,
    nullable: true,
  })
  location: any; // Use proper PostGIS type if available

  @Column({ type: "varchar", length: 12, nullable: true })
  @Index()
  geohash: string;

  @Column({ type: "varchar", length: 20, default: "user" })
  role: string;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @Column({ type: "boolean", default: false })
  isProfileComplete: boolean;

  @Column({ type: "timestamp with time zone", default: () => "NOW()" })
  lastActiveAt: Date;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt: Date;
}
