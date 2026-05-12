import {
  IsString,
  IsNumber,
  IsPositive,
  Length,
  IsOptional,
  IsISO8601,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ConvertRequestDto {
  @IsString()
  @Length(3, 3)
  from: string;

  @IsString()
  @Length(3, 3)
  to: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsISO8601()
  date?: string;
}
