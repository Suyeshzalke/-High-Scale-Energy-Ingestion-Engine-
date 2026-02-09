import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Optional mapping table for correlating vehicles with meters
 * This enables accurate AC/DC efficiency calculations
 */
@Entity('vehicle_meter_mapping')
@Index(['vehicleId'])
@Index(['meterId'])
export class VehicleMeterMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  vehicleId: string;

  @Column({ type: 'varchar', length: 100 })
  meterId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
