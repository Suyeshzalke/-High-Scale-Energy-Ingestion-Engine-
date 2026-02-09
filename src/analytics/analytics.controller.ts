import { Controller, Get, Param } from '@nestjs/common';
import { AnalyticsService } from './services/analytics.service';
import { PerformanceResponseDto } from './dto/performance-response.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('performance/:vehicleId')
  async getPerformance(
    @Param('vehicleId') vehicleId: string,
  ): Promise<PerformanceResponseDto> {
    return await this.analyticsService.getVehiclePerformance(vehicleId);
  }
}
