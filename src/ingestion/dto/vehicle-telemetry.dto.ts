import { IsString, IsNumber, IsDateString, IsNotEmpty } from 'class-validator';

export class VehicleTelemetryDto {
  @IsString()
  @IsNotEmpty()
  vehicleId: string;

  @IsNumber()
  @IsNotEmpty()
  soc: number; // State of Charge (Battery %)

  @IsNumber()
  @IsNotEmpty()
  kwhDeliveredDc: number;

  @IsNumber()
  @IsNotEmpty()
  batteryTemp: number;

  @IsDateString()
  @IsNotEmpty()
  timestamp: string;
}
