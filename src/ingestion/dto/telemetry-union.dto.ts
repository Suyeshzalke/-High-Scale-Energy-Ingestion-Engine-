import { MeterTelemetryDto } from './meter-telemetry.dto';
import { VehicleTelemetryDto } from './vehicle-telemetry.dto';

export type TelemetryDto = MeterTelemetryDto | VehicleTelemetryDto;

export function isMeterTelemetry(
  dto: TelemetryDto,
): dto is MeterTelemetryDto {
  return 'meterId' in dto && 'kwhConsumedAc' in dto && 'voltage' in dto;
}

export function isVehicleTelemetry(
  dto: TelemetryDto,
): dto is VehicleTelemetryDto {
  return (
    'vehicleId' in dto &&
    'soc' in dto &&
    'kwhDeliveredDc' in dto &&
    'batteryTemp' in dto
  );
}
