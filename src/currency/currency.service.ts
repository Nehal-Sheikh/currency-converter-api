import {
  Injectable,
  OnModuleInit,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { SupportedCurrency } from './entities/supported-currency.entity';
import { CurrencyRate } from './entities/currency-rate.entity';
import { CURRENCY_API_BASE_URL, CACHE_TTL } from '../common/constants';

interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

interface ApiResponse<T> {
  data: T;
}

@Injectable()
export class CurrencyService implements OnModuleInit {
  private readonly apiKey: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    @InjectRepository(SupportedCurrency)
    private supportedRepository: Repository<SupportedCurrency>,
    @InjectRepository(CurrencyRate)
    private rateRepository: Repository<CurrencyRate>,
  ) {
    const key = this.configService.get<string>('CURRENCY_API_KEY');
    if (!key) {
      throw new Error('CURRENCY_API_KEY is not defined in .env');
    }
    this.apiKey = key;
  }

  async onModuleInit() {
    await this.seedSupportedCurrencies();
  }

  private async seedSupportedCurrencies() {
    try {
      const response = await firstValueFrom<
        AxiosResponse<ApiResponse<Record<string, CurrencyInfo>>>
      >(
        this.httpService.get(`${CURRENCY_API_BASE_URL}/currencies`, {
          params: { apikey: this.apiKey },
        }),
      );

      const currencies = response.data.data;
      for (const code in currencies) {
        const currency = currencies[code];
        let existing = await this.supportedRepository.findOne({ where: { code } });
        if (existing) {
          existing.name = currency.name;
          existing.symbol = currency.symbol;
          await this.supportedRepository.save(existing);
        } else {
          await this.supportedRepository.save({
            code: currency.code,
            name: currency.name,
            symbol: currency.symbol,
          });
        }
      }
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to seed currencies:', message);
    }
  }

  async getSupportedCurrencies() {
    return this.supportedRepository.find();
  }

  async getLatestRate(from: string, to: string) {
    const cachedRate = await this.rateRepository.findOne({
      where: { baseCurrency: from, targetCurrency: to },
    });

    if (cachedRate) {
      const ageInSeconds =
        (new Date().getTime() - cachedRate.lastUpdated.getTime()) / 1000;
      if (ageInSeconds < CACHE_TTL) {
        return {
          rate: cachedRate.rate,
          isCached: true,
          cacheAge: ageInSeconds,
        };
      }
    }

    try {
      const response = await firstValueFrom<
        AxiosResponse<ApiResponse<Record<string, number>>>
      >(
        this.httpService.get(`${CURRENCY_API_BASE_URL}/latest`, {
          params: {
            apikey: this.apiKey,
            base_currency: from,
            currencies: to,
          },
        }),
      );

      const rate = response.data.data[to];
      if (cachedRate) {
        cachedRate.rate = rate;
        cachedRate.lastUpdated = new Date();
        await this.rateRepository.save(cachedRate);
      } else {
        await this.rateRepository.save({
          baseCurrency: from,
          targetCurrency: to,
          rate: rate,
        });
      }

      return { rate: rate, isCached: false };
    } catch (error: any) {
      const status = error?.response?.status;
      console.error(`API Error (${status || 'unknown'}):`, error?.message);
      
      if (cachedRate) {
        return {
          rate: cachedRate.rate,
          isCached: true,
          cacheAge: (new Date().getTime() - cachedRate.lastUpdated.getTime()) / 1000,
          warning: 'Live rates unavailable.',
        };
      }
      
      throw new HttpException(
        'Service Unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async getHistoricalRate(from: string, to: string, date: string) {
    const requestedDate = new Date(date);
    if (requestedDate > new Date()) {
      throw new HttpException(
        'Future dates are not supported',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const response = await firstValueFrom<
        AxiosResponse<ApiResponse<Record<string, Record<string, number>>>>
      >(
        this.httpService.get(`${CURRENCY_API_BASE_URL}/historical`, {
          params: {
            apikey: this.apiKey,
            base_currency: from,
            currencies: to,
            date: date,
          },
        }),
      );
      return { rate: response.data.data[date][to] };
    } catch {
      throw new HttpException(
        'Historical rates unavailable',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getTrends(from: string, to: string) {
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const results = await Promise.all(
      dates.map(async (date) => {
        try {
          const res = await this.getHistoricalRate(from, to, date);
          return { date, rate: res.rate };
        } catch {
          return { date, rate: null };
        }
      }),
    );

    return results;
  }
}

