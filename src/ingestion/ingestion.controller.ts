import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { IngestionService } from './services/ingestion.service';
import {
  TelemetryDto,
  isMeterTelemetry,
  isVehicleTelemetry,
} from './dto/telemetry-union.dto';
import { MeterTelemetryDto } from './dto/meter-telemetry.dto';
import { VehicleTelemetryDto } from './dto/vehicle-telemetry.dto';

@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('telemetry')
  @HttpCode(HttpStatus.ACCEPTED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async ingestTelemetry(@Body() telemetry: TelemetryDto): Promise<{
    message: string;
    type: 'meter' | 'vehicle';
  }> {
    await this.ingestionService.ingest(telemetry);

    const type = isMeterTelemetry(telemetry) ? 'meter' : 'vehicle';
    return {
      message: 'Telemetry ingested successfully',
      type,
    };
  }

  @Post('meter')
  @HttpCode(HttpStatus.ACCEPTED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async ingestMeter(@Body() telemetry: MeterTelemetryDto): Promise<{
    message: string;
  }> {
    await this.ingestionService.ingest(telemetry);
    return {
      message: 'Meter telemetry ingested successfully',
    };
  }

  @Post('vehicle')
  @HttpCode(HttpStatus.ACCEPTED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async ingestVehicle(@Body() telemetry: VehicleTelemetryDto): Promise<{
    message: string;
  }> {
    await this.ingestionService.ingest(telemetry);
    return {
      message: 'Vehicle telemetry ingested successfully',
    };
  }
}
