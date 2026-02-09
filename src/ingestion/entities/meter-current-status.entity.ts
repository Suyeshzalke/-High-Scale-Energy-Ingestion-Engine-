import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('meter_current_status')
export class MeterCurrentStatus {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  meterId: string;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  kwhConsumedAc: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  voltage: number;

  @Column({ type: 'timestamptz' })
  lastTimestamp: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
