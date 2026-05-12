import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversionRecord } from './entities/conversion-record.entity';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ConversionRecord])],
  providers: [HistoryService],
  controllers: [HistoryController],
})
export class HistoryModule {}
