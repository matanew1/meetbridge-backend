import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  Request,
} from "@nestjs/common";
import { MatchesService } from "./matches.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("matches")
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  findAllForUser(@Request() req) {
    return this.matchesService.findAllForUser(req.user.id);
  }

  @Get("mutual")
  findMutualMatches(@Request() req) {
    return this.matchesService.findMutualMatches(req.user.id);
  }

  @Post(":userId")
  create(@Request() req, @Param("userId") userId: string) {
    return this.matchesService.create(req.user.id, userId);
  }

  @Post(":id/mutual")
  makeMutual(@Param("id") id: string) {
    return this.matchesService.makeMutual(id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.matchesService.remove(id);
  }
}
