import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('conversion_records')
export class ConversionRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fromCurrency: string;

  @Column()
  toCurrency: string;

  @Column('double')
  amount: number;

  @Column('double')
  result: number;

  @Column('double')
  exchangeRate: number;

  @Column({ nullable: true })
  historicalDate: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;
}
