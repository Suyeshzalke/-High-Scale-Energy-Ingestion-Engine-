import { Injectable, BadRequestException } from '@nestjs/common';
import { MeterTelemetryRepository } from '../repositories/meter-telemetry.repository';
import { VehicleTelemetryRepository } from '../repositories/vehicle-telemetry.repository';
import {
  TelemetryDto,
  isMeterTelemetry,
  isVehicleTelemetry,
} from '../dto/telemetry-union.dto';
import { MeterTelemetryDto } from '../dto/meter-telemetry.dto';
import { VehicleTelemetryDto } from '../dto/vehicle-telemetry.dto';

@Injectable()
export class IngestionService {
  constructor(
    private readonly meterRepository: MeterTelemetryRepository,
    private readonly vehicleRepository: VehicleTelemetryRepository,
  ) {}

  /**
   * Polymorphic ingestion handler that routes to appropriate repository
   */
  async ingest(telemetry: TelemetryDto): Promise<void> {
    // Validate timestamp is recent (within last 5 minutes to handle clock skew)
    const timestamp = new Date(telemetry.timestamp);
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    if (timestamp < fiveMinutesAgo || timestamp > fiveMinutesFromNow) {
      throw new BadRequestException(
        'Timestamp must be within 5 minutes of current time',
      );
    }

    if (isMeterTelemetry(telemetry)) {
      await this.ingestMeterTelemetry(telemetry);
    } else if (isVehicleTelemetry(telemetry)) {
      await this.ingestVehicleTelemetry(telemetry);
    } else {
      throw new BadRequestException(
        'Invalid telemetry format. Must be either Meter or Vehicle telemetry.',
      );
    }
  }

  private async ingestMeterTelemetry(data: MeterTelemetryDto): Promise<void> {
    // Validate meter data
    if (data.kwhConsumedAc < 0) {
      throw new BadRequestException('kwhConsumedAc must be non-negative');
    }
    if (data.voltage < 0 || data.voltage > 1000) {
      throw new BadRequestException('voltage must be between 0 and 1000');
    }

    // Insert into historical store (append-only)
    await this.meterRepository.insertHistorical(data);

    // Upsert into current status store (hot path)
    await this.meterRepository.upsertCurrentStatus(data);
  }

  private async ingestVehicleTelemetry(
    data: VehicleTelemetryDto,
  ): Promise<void> {
    // Validate vehicle data
    if (data.soc < 0 || data.soc > 100) {
      throw new BadRequestException('soc must be between 0 and 100');
    }
    if (data.kwhDeliveredDc < 0) {
      throw new BadRequestException('kwhDeliveredDc must be non-negative');
    }
    if (data.batteryTemp < -50 || data.batteryTemp > 100) {
      throw new BadRequestException(
        'batteryTemp must be between -50 and 100 degrees Celsius',
      );
    }

    // Insert into historical store (append-only)
    await this.vehicleRepository.insertHistorical(data);

    // Upsert into current status store (hot path)
    await this.vehicleRepository.upsertCurrentStatus(data);
  }
}
