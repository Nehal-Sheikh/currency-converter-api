import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CurrencyService } from './currency.service';
import { CurrencyController } from './currency.controller';
import { SupportedCurrency } from './entities/supported-currency.entity';
import { CurrencyRate } from './entities/currency-rate.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupportedCurrency, CurrencyRate]),
    HttpModule.register({
      timeout: 8000,
      maxRedirects: 5,
    }),
  ],
  providers: [CurrencyService],
  controllers: [CurrencyController],
  exports: [CurrencyService],
})
export class CurrencyModule {}
