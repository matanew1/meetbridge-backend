import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MissedConnectionsService } from "./missed-connections.service";
import { MissedConnectionsController } from "./missed-connections.controller";
import { MissedConnection } from "../entities/missed-connection.entity";

@Module({
  imports: [TypeOrmModule.forFeature([MissedConnection])],
  controllers: [MissedConnectionsController],
  providers: [MissedConnectionsService],
  exports: [MissedConnectionsService],
})
export class MissedConnectionsModule {}
