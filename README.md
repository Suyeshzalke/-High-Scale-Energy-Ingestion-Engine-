

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL 15+ (if running without Docker)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd energy-ingestion-engine
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### Running with Docker Compose (Recommended)

```bash
# Start PostgreSQL and application
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

The application will be available at `http://localhost:3000/v1`

### Running Locally

1. **Start PostgreSQL** (if not using Docker):
```bash
docker-compose up -d postgres
```

2. **Run migrations** (TypeORM will auto-sync schema in development):
```bash
npm run start:dev
```

The application will start on `http://localhost:3000/v1`

## 📡 API Endpoints

### Ingestion Endpoints

#### POST `/v1/ingestion/telemetry`
Polymorphic endpoint that accepts either Meter or Vehicle telemetry.

**Request Body (Meter)**:
```json
{
  "meterId": "METER-001",
  "kwhConsumedAc": 15.5,
  "voltage": 240.0,
  "timestamp": "2026-02-09T10:30:00Z"
}
```

**Request Body (Vehicle)**:
```json
{
  "vehicleId": "EV-001",
  "soc": 85.5,
  "kwhDeliveredDc": 12.3,
  "batteryTemp": 25.5,
  "timestamp": "2026-02-09T10:30:00Z"
}
```

**Response**: `202 Accepted`
```json
{
  "message": "Telemetry ingested successfully",
  "type": "meter" // or "vehicle"
}
```

#### POST `/v1/ingestion/meter`
Dedicated endpoint for meter telemetry (same body as above).

#### POST `/v1/ingestion/vehicle`
Dedicated endpoint for vehicle telemetry (same body as above).

### Analytics Endpoints

#### GET `/v1/analytics/performance/:vehicleId`
Returns 24-hour performance summary for a vehicle.

**Response**:
```json
{
  "vehicleId": "EV-001",
  "period": {
    "start": "2026-02-08T10:30:00Z",
    "end": "2026-02-09T10:30:00Z"
  },
  "energy": {
    "totalConsumedAc": 150.5,
    "totalDeliveredDc": 128.2,
    "efficiencyRatio": 0.8518
  },
  "battery": {
    "averageTemp": 24.3,
    "currentSoc": 85.5
  },
  "summary": {
    "totalRecords": 1440,
    "efficiencyStatus": "optimal"
  }
}
```

## 🗄️ Database Schema

### Historical Tables (Cold Store)

#### `meter_telemetry_history`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| meterId | VARCHAR(100) | Meter identifier (indexed) |
| kwhConsumedAc | DECIMAL(10,3) | AC energy consumed |
| voltage | DECIMAL(10,2) | Voltage reading |
| timestamp | TIMESTAMPTZ | Reading timestamp (indexed) |
| createdAt | TIMESTAMP | Record creation time |

**Indexes**:
- `(meterId, timestamp)` - Composite index for time-range queries
- `timestamp` - Single column index for time-based analytics

#### `vehicle_telemetry_history`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| vehicleId | VARCHAR(100) | Vehicle identifier (indexed) |
| soc | DECIMAL(5,2) | State of Charge (0-100%) |
| kwhDeliveredDc | DECIMAL(10,3) | DC energy delivered |
| batteryTemp | DECIMAL(5,2) | Battery temperature (°C) |
| timestamp | TIMESTAMPTZ | Reading timestamp (indexed) |
| createdAt | TIMESTAMP | Record creation time |

**Indexes**:
- `(vehicleId, timestamp)` - Composite index for time-range queries
- `timestamp` - Single column index for time-based analytics

### Current Status Tables (Hot Store)

#### `meter_current_status`
| Column | Type | Description |
|--------|------|-------------|
| meterId | VARCHAR(100) | Primary key |
| kwhConsumedAc | DECIMAL(10,3) | Latest AC consumption |
| voltage | DECIMAL(10,2) | Latest voltage |
| lastTimestamp | TIMESTAMPTZ | Last update time |
| createdAt | TIMESTAMP | Record creation time |
| updatedAt | TIMESTAMP | Last update time |

#### `vehicle_current_status`
| Column | Type | Description |
|--------|------|-------------|
| vehicleId | VARCHAR(100) | Primary key |
| soc | DECIMAL(5,2) | Current State of Charge |
| kwhDeliveredDc | DECIMAL(10,3) | Latest DC delivery |
| batteryTemp | DECIMAL(5,2) | Current battery temperature |
| lastTimestamp | TIMESTAMPTZ | Last update time |
| createdAt | TIMESTAMP | Record creation time |
| updatedAt | TIMESTAMP | Last update time |

## 📈 Performance Considerations

### Handling 14.4 Million Records Daily

With 10,000 devices sending data every 60 seconds:
- **Daily Records**: 10,000 devices × 1,440 minutes = 14.4M records/day
- **Peak Throughput**: ~167 requests/second (assuming uniform distribution)

**Optimizations Implemented**:

1. **Indexed Queries**: All analytics queries use indexed columns to avoid full table scans
2. **Hot/Cold Separation**: Dashboard queries hit the small hot store (10K rows) instead of billions
3. **Batch Processing**: Historical inserts can be batched in production
4. **Connection Pooling**: TypeORM manages connection pools efficiently
5. **Partitioning Ready**: Schema supports table partitioning by timestamp for long-term storage

### Recommended Production Enhancements

1. **Table Partitioning**: Partition historical tables by month/year
2. **Read Replicas**: Use read replicas for analytics queries
3. **Caching Layer**: Redis cache for current status lookups
4. **Message Queue**: Kafka/RabbitMQ for async ingestion
5. **Vehicle-Meter Mapping**: Add mapping table for accurate correlation
6. **Data Retention Policies**: Archive old partitions to cheaper storage

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Validation Rules

### Meter Telemetry
- `kwhConsumedAc`: Must be non-negative
- `voltage`: Must be between 0 and 1000V
- `timestamp`: Must be within 5 minutes of current time

### Vehicle Telemetry
- `soc`: Must be between 0 and 100%
- `kwhDeliveredDc`: Must be non-negative
- `batteryTemp`: Must be between -50°C and 100°C
- `timestamp`: Must be within 5 minutes of current time

## 🔧 Development

```bash
# Development mode with hot reload
npm run start:dev

# Build for production
npm run build

# Production mode
npm run start:prod

# Linting
npm run lint

# Format code
npm run format
``