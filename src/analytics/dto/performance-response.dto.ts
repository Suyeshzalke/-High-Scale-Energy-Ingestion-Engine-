export class PerformanceResponseDto {
  vehicleId: string;
  period: {
    start: Date;
    end: Date;
  };
  energy: {
    totalConsumedAc: number; // Total AC consumed from grid
    totalDeliveredDc: number; // Total DC delivered to battery
    efficiencyRatio: number; // DC/AC ratio (should be < 1, typically 0.85-0.95)
  };
  battery: {
    averageTemp: number;
    currentSoc: number | null;
  };
  summary: {
    totalRecords: number;
    efficiencyStatus: 'optimal' | 'warning' | 'critical';
  };
}
