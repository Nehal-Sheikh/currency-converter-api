import {
  IsString,
  IsNumber,
  IsOptional,
  IsISO8601,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SaveHistoryDto {
  @IsString()
  fromCurrency: string;

  @IsString()
  toCurrency: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  result: number;

  @IsNumber()
  exchangeRate: number;

  @IsOptional()
  @IsISO8601()
  historicalDate?: string;

  @IsDateString()
  timestamp: string;
}

export class BulkSaveHistoryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveHistoryDto)
  records: SaveHistoryDto[];
}
