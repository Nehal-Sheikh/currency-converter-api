import { Controller, Get, Query } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { ConvertRequestDto } from './dto/convert-request.dto';

@Controller('currency')
export class CurrencyController {
  constructor(private currencyService: CurrencyService) {}

  @Get('supported')
  async getSupported() {
    return this.currencyService.getSupportedCurrencies();
  }

  @Get('latest')
  async getLatest(@Query() query: ConvertRequestDto) {
    const result = await this.currencyService.getLatestRate(
      query.from,
      query.to,
    );
    return {
      ...result,
      amount: query.amount,
      result: query.amount * result.rate,
    };
  }

  @Get('historical')
  async getHistorical(@Query() query: ConvertRequestDto) {
    if (!query.date) {
      return this.getLatest(query);
    }
    const result = await this.currencyService.getHistoricalRate(
      query.from,
      query.to,
      query.date,
    );
    return {
      ...result,
      amount: query.amount,
      result: query.amount * result.rate,
    };
  }

  @Get('trends')
  async getTrends(@Query('from') from: string, @Query('to') to: string) {
    return this.currencyService.getTrends(from, to);
  }
}

