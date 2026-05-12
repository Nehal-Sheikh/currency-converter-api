import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SaveHistoryDto, BulkSaveHistoryDto } from './dto/save-history.dto';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@Controller('history')
@UseGuards(JwtAuthGuard)
export class HistoryController {
  constructor(private historyService: HistoryService) {}

  @Get()
  async getHistory(@Request() req: RequestWithUser) {
    return this.historyService.getUserHistory(req.user.id);
  }

  @Post()
  async save(@Request() req: RequestWithUser, @Body() body: SaveHistoryDto) {
    return this.historyService.save(req.user.id, body);
  }

  @Post('bulk')
  async saveBulk(
    @Request() req: RequestWithUser,
    @Body() body: BulkSaveHistoryDto,
  ) {
    return this.historyService.saveBulk(req.user.id, body.records);
  }
}
