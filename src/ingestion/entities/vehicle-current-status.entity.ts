import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('vehicle_current_status')
export class VehicleCurrentStatus {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  vehicleId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  soc: number; // State of Charge (Battery %)

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  kwhDeliveredDc: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  batteryTemp: number;

  @Column({ type: 'timestamptz' })
  lastTimestamp: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
