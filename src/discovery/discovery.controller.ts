import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { DiscoveryService, DiscoveryFilters } from "./discovery.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("discovery")
@UseGuards(JwtAuthGuard)
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get("profiles")
  getDiscoveryProfiles(
    @Request() req,
    @Query() filters: DiscoveryFilters,
    @Query("limit") limit?: number,
    @Query("offset") offset?: number
  ) {
    return this.discoveryService.getDiscoveryProfiles(
      req.user.id,
      filters,
      limit,
      offset
    );
  }

  @Post("like/:userId")
  likeProfile(@Request() req, @Query("userId") userId: string) {
    return this.discoveryService.likeProfile(req.user.id, userId);
  }

  @Post("pass/:userId")
  passProfile(@Request() req, @Query("userId") userId: string) {
    return this.discoveryService.passProfile(req.user.id, userId);
  }
}
