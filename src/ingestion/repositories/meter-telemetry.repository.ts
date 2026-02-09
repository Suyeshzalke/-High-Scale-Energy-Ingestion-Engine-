import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeterTelemetry } from '../entities/meter-telemetry.entity';
import { MeterCurrentStatus } from '../entities/meter-current-status.entity';
import { MeterTelemetryDto } from '../dto/meter-telemetry.dto';

@Injectable()
export class MeterTelemetryRepository {
  constructor(
    @InjectRepository(MeterTelemetry)
    private readonly historyRepository: Repository<MeterTelemetry>,
    @InjectRepository(MeterCurrentStatus)
    private readonly currentStatusRepository: Repository<MeterCurrentStatus>,
  ) {}

  /**
   * Append-only INSERT for historical audit trail
   */
  async insertHistorical(data: MeterTelemetryDto): Promise<MeterTelemetry> {
    const telemetry = this.historyRepository.create({
      meterId: data.meterId,
      kwhConsumedAc: data.kwhConsumedAc,
      voltage: data.voltage,
      timestamp: new Date(data.timestamp),
    });

    return await this.historyRepository.save(telemetry);
  }

  /**
   * UPSERT for fast current status lookup
   */
  async upsertCurrentStatus(
    data: MeterTelemetryDto,
  ): Promise<MeterCurrentStatus> {
    const status = this.currentStatusRepository.create({
      meterId: data.meterId,
      kwhConsumedAc: data.kwhConsumedAc,
      voltage: data.voltage,
      lastTimestamp: new Date(data.timestamp),
    });

    return await this.currentStatusRepository.save(status);
  }

  /**
   * Get current status for a meter (fast lookup)
   */
  async getCurrentStatus(
    meterId: string,
  ): Promise<MeterCurrentStatus | null> {
    return await this.currentStatusRepository.findOne({
      where: { meterId },
    });
  }
}
