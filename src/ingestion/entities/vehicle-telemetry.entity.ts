import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('vehicle_telemetry_history')
@Index(['vehicleId', 'timestamp'])
@Index(['timestamp'])
export class VehicleTelemetry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  vehicleId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  soc: number; // State of Charge (Battery %)

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  kwhDeliveredDc: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  batteryTemp: number;

  @Column({ type: 'timestamptz' })
  @Index()
  timestamp: Date;

  @CreateDateColumn()
  createdAt: Date;
}
