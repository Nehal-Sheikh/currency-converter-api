import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('currency_rates')
@Unique(['baseCurrency', 'targetCurrency'])
export class CurrencyRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  baseCurrency: string;

  @Column()
  targetCurrency: string;

  @Column('double')
  rate: number;

  @UpdateDateColumn()
  lastUpdated: Date;
}
