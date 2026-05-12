import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('supported_currencies')
export class SupportedCurrency {
  @PrimaryColumn()
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  symbol: string;
}
