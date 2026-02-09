import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleTelemetry } from '../entities/vehicle-telemetry.entity';
import { VehicleCurrentStatus } from '../entities/vehicle-current-status.entity';
import { VehicleTelemetryDto } from '../dto/vehicle-telemetry.dto';

@Injectable()
export class VehicleTelemetryRepository {
  constructor(
    @InjectRepository(VehicleTelemetry)
    private readonly historyRepository: Repository<VehicleTelemetry>,
    @InjectRepository(VehicleCurrentStatus)
    private readonly currentStatusRepository: Repository<VehicleCurrentStatus>,
  ) {}

  /**
   * Append-only INSERT for historical audit trail
   */
  async insertHistorical(
    data: VehicleTelemetryDto,
  ): Promise<VehicleTelemetry> {
    const telemetry = this.historyRepository.create({
      vehicleId: data.vehicleId,
      soc: data.soc,
      kwhDeliveredDc: data.kwhDeliveredDc,
      batteryTemp: data.batteryTemp,
      timestamp: new Date(data.timestamp),
    });

    return await this.historyRepository.save(telemetry);
  }

  /**
   * UPSERT for fast current status lookup
   */
  async upsertCurrentStatus(
    data: VehicleTelemetryDto,
  ): Promise<VehicleCurrentStatus> {
    const status = this.currentStatusRepository.create({
      vehicleId: data.vehicleId,
      soc: data.soc,
      kwhDeliveredDc: data.kwhDeliveredDc,
      batteryTemp: data.batteryTemp,
      lastTimestamp: new Date(data.timestamp),
    });

    return await this.currentStatusRepository.save(status);
  }

  /**
   * Get current status for a vehicle (fast lookup)
   */
  async getCurrentStatus(
    vehicleId: string,
  ): Promise<VehicleCurrentStatus | null> {
    return await this.currentStatusRepository.findOne({
      where: { vehicleId },
    });
  }
}
