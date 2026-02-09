import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionModule } from './ingestion/ingestion.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { HealthController } from './health/health.controller';
import { MeterTelemetry } from './ingestion/entities/meter-telemetry.entity';
import { VehicleTelemetry } from './ingestion/entities/vehicle-telemetry.entity';
import { MeterCurrentStatus } from './ingestion/entities/meter-current-status.entity';
import { VehicleCurrentStatus } from './ingestion/entities/vehicle-current-status.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'fleet_energy',
      entities: [
        MeterTelemetry,
        VehicleTelemetry,
        MeterCurrentStatus,
        VehicleCurrentStatus,
      ],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    IngestionModule,
    AnalyticsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
