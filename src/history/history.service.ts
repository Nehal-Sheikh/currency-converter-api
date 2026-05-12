import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversionRecord } from './entities/conversion-record.entity';
import { SaveHistoryDto } from './dto/save-history.dto';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(ConversionRecord)
    private historyRepository: Repository<ConversionRecord>,
  ) {}

  async save(userId: string, data: SaveHistoryDto) {
    const record = this.historyRepository.create({
      ...data,
      userId,
      timestamp: new Date(data.timestamp),
    });
    return this.historyRepository.save(record);
  }

  async saveBulk(userId: string, records: SaveHistoryDto[]) {
    const entities = records.map((record) =>
      this.historyRepository.create({
        ...record,
        userId,
        timestamp: new Date(record.timestamp),
      }),
    );
    await this.historyRepository.save(entities);
    return this.getUserHistory(userId);
  }

  async getUserHistory(userId: string) {
    return this.historyRepository.find({
      where: { userId },
      order: { timestamp: 'DESC' },
    });
  }
}
