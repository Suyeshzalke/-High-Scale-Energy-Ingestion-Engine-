import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './services/ingestion.service';
import { MeterTelemetryRepository } from './repositories/meter-telemetry.repository';
import { VehicleTelemetryRepository } from './repositories/vehicle-telemetry.repository';
import { MeterTelemetry } from './entities/meter-telemetry.entity';
import { VehicleTelemetry } from './entities/vehicle-telemetry.entity';
import { MeterCurrentStatus } from './entities/meter-current-status.entity';
import { VehicleCurrentStatus } from './entities/vehicle-current-status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MeterTelemetry,
      VehicleTelemetry,
      MeterCurrentStatus,
      VehicleCurrentStatus,
    ]),
  ],
  controllers: [IngestionController],
  providers: [
    IngestionService,
    MeterTelemetryRepository,
    VehicleTelemetryRepository,
  ],
  exports: [
    MeterTelemetryRepository,
    VehicleTelemetryRepository,
  ],
})
export class IngestionModule {}
