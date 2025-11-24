import {
  Controller,
  Get,
  Put,
  Delete,
  Query,
  UseGuards,
  Request,
  Param,
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(
    @Request() req,
    @Query("limit") limit?: number,
    @Query("offset") offset?: number
  ) {
    return this.notificationsService.findAllForUser(req.user.id, limit, offset);
  }

  @Get("unread-count")
  getUnreadCount(@Request() req) {
    return this.notificationsService.findUnreadCount(req.user.id);
  }

  @Put(":id/read")
  markAsRead(@Param("id") id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Put("read-all")
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Request() req) {
    return this.notificationsService.delete(id, req.user.id);
  }
}
