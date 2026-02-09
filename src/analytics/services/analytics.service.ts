import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleTelemetry } from '../ingestion/entities/vehicle-telemetry.entity';
import { MeterTelemetry } from '../ingestion/entities/meter-telemetry.entity';
import { VehicleCurrentStatus } from '../ingestion/entities/vehicle-current-status.entity';
import { PerformanceResponseDto } from '../dto/performance-response.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(VehicleTelemetry)
    private readonly vehicleHistoryRepository: Repository<VehicleTelemetry>,
    @InjectRepository(MeterTelemetry)
    private readonly meterHistoryRepository: Repository<MeterTelemetry>,
    @InjectRepository(VehicleCurrentStatus)
    private readonly vehicleCurrentStatusRepository: Repository<VehicleCurrentStatus>,
  ) {}

  /**
   * Get 24-hour performance analytics for a vehicle
   * Optimized to avoid full table scans using indexed queries
   */
  async getVehiclePerformance(
    vehicleId: string,
  ): Promise<PerformanceResponseDto> {
    // Check if vehicle exists
    const currentStatus = await this.vehicleCurrentStatusRepository.findOne({
      where: { vehicleId },
    });

    if (!currentStatus) {
      throw new NotFoundException(`Vehicle ${vehicleId} not found`);
    }

    // Calculate 24-hour window
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

    // Query vehicle telemetry (indexed on vehicleId + timestamp)
    const vehicleRecords = await this.vehicleHistoryRepository
      .createQueryBuilder('vt')
      .where('vt.vehicleId = :vehicleId', { vehicleId })
      .andWhere('vt.timestamp >= :startTime', { startTime })
      .andWhere('vt.timestamp <= :endTime', { endTime })
      .orderBy('vt.timestamp', 'ASC')
      .getMany();

    if (vehicleRecords.length === 0) {
      return this.createEmptyResponse(vehicleId, startTime, endTime);
    }

    // Calculate vehicle metrics
    const totalDeliveredDc = vehicleRecords.reduce(
      (sum, record) => sum + parseFloat(record.kwhDeliveredDc.toString()),
      0,
    );

    const totalBatteryTemp = vehicleRecords.reduce(
      (sum, record) => sum + parseFloat(record.batteryTemp.toString()),
      0,
    );
    const averageBatteryTemp = totalBatteryTemp / vehicleRecords.length;

    // For AC consumption, we need to correlate with meter data
    // In a real system, we'd have a mapping table (vehicleId -> meterId)
    // For this assignment, we'll use a heuristic: find meters active in the same time window
    // and aggregate their consumption (assuming one meter per charging session)

    // Get all meter records in the same time window
    // Note: In production, you'd have a vehicle-meter mapping table
    const meterRecords = await this.meterHistoryRepository
      .createQueryBuilder('mt')
      .where('mt.timestamp >= :startTime', { startTime })
      .andWhere('mt.timestamp <= :endTime', { endTime })
      .orderBy('mt.timestamp', 'ASC')
      .getMany();

    // Calculate total AC consumed
    // In a real system, you'd filter by associated meterId(s) for this vehicle
    // For this demo, we'll sum all meter consumption in the time window
    // (assuming fleet-level aggregation or single meter per vehicle)
    const totalConsumedAc = meterRecords.reduce(
      (sum, record) => sum + parseFloat(record.kwhConsumedAc.toString()),
      0,
    );

    // Calculate efficiency ratio
    const efficiencyRatio =
      totalConsumedAc > 0 ? totalDeliveredDc / totalConsumedAc : 0;

    // Determine efficiency status
    let efficiencyStatus: 'optimal' | 'warning' | 'critical';
    if (efficiencyRatio >= 0.85) {
      efficiencyStatus = 'optimal';
    } else if (efficiencyRatio >= 0.75) {
      efficiencyStatus = 'warning';
    } else {
      efficiencyStatus = 'critical';
    }

    return {
      vehicleId,
      period: {
        start: startTime,
        end: endTime,
      },
      energy: {
        totalConsumedAc: parseFloat(totalConsumedAc.toFixed(3)),
        totalDeliveredDc: parseFloat(totalDeliveredDc.toFixed(3)),
        efficiencyRatio: parseFloat(efficiencyRatio.toFixed(4)),
      },
      battery: {
        averageTemp: parseFloat(averageBatteryTemp.toFixed(2)),
        currentSoc: parseFloat(currentStatus.soc.toString()),
      },
      summary: {
        totalRecords: vehicleRecords.length,
        efficiencyStatus,
      },
    };
  }

  private createEmptyResponse(
    vehicleId: string,
    startTime: Date,
    endTime: Date,
  ): PerformanceResponseDto {
    return {
      vehicleId,
      period: {
        start: startTime,
        end: endTime,
      },
      energy: {
        totalConsumedAc: 0,
        totalDeliveredDc: 0,
        efficiencyRatio: 0,
      },
      battery: {
        averageTemp: 0,
        currentSoc: null,
      },
      summary: {
        totalRecords: 0,
        efficiencyStatus: 'optimal',
      },
    };
  }
}
