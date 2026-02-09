import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './services/analytics.service';
import { VehicleTelemetry } from '../ingestion/entities/vehicle-telemetry.entity';
import { MeterTelemetry } from '../ingestion/entities/meter-telemetry.entity';
import { VehicleCurrentStatus } from '../ingestion/entities/vehicle-current-status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VehicleTelemetry,
      MeterTelemetry,
      VehicleCurrentStatus,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
