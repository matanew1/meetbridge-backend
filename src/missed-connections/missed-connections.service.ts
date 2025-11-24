import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MissedConnection } from "../entities/missed-connection.entity";
import { CreateMissedConnectionDto } from "./dto/create-missed-connection.dto";

@Injectable()
export class MissedConnectionsService {
  constructor(
    @InjectRepository(MissedConnection)
    private readonly missedConnectionRepository: Repository<MissedConnection>
  ) {}

  async create(
    userId: string,
    createMissedConnectionDto: CreateMissedConnectionDto
  ): Promise<MissedConnection> {
    const missedConnection = this.missedConnectionRepository.create({
      userId,
      ...createMissedConnectionDto,
    });

    return this.missedConnectionRepository.save(missedConnection);
  }

  async findAll(userId: string): Promise<MissedConnection[]> {
    return this.missedConnectionRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  async findNearby(
    userId: string,
    latitude: number,
    longitude: number,
    radiusKm = 10
  ): Promise<MissedConnection[]> {
    // This would use PostGIS ST_DWithin for spatial queries
    // For now, return all user's missed connections
    return this.missedConnectionRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.missedConnectionRepository.delete({
      id,
      userId,
    });

    if (result.affected === 0) {
      throw new Error("Missed connection not found");
    }
  }
}
