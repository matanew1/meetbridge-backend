import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Query,
  UseGuards,
  Request,
  Param,
} from "@nestjs/common";
import { MissedConnectionsService } from "./missed-connections.service";
import { CreateMissedConnectionDto } from "./dto/create-missed-connection.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("missed-connections")
@UseGuards(JwtAuthGuard)
export class MissedConnectionsController {
  constructor(
    private readonly missedConnectionsService: MissedConnectionsService
  ) {}

  @Post()
  create(
    @Request() req,
    @Body() createMissedConnectionDto: CreateMissedConnectionDto
  ) {
    return this.missedConnectionsService.create(
      req.user.id,
      createMissedConnectionDto
    );
  }

  @Get()
  findAll(@Request() req) {
    return this.missedConnectionsService.findAll(req.user.id);
  }

  @Get("nearby")
  findNearby(
    @Request() req,
    @Query("lat") lat: number,
    @Query("lng") lng: number,
    @Query("radius") radius?: number
  ) {
    return this.missedConnectionsService.findNearby(
      req.user.id,
      lat,
      lng,
      radius
    );
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Request() req) {
    return this.missedConnectionsService.remove(id, req.user.id);
  }
}
