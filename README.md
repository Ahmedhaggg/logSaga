- LogSage – Scalable Logging & Monitoring Platform

## Project Overview

**LogSage** is an advanced log aggregation, querying, and monitoring platform built with **TypeScript**, **NestJS**, and **PostgreSQL**. Designed for developers and DevOps teams, it provides a robust solution for ingesting, searching, and analyzing logs and metrics across distributed services, with a focus on scalability, extensibility, and maintainability. The platform leverages **Object-Oriented Programming (OOP)** principles, **design patterns**, and a modular architecture to ensure clean code and ease of enhancement.

### Objectives

- Implement a scalable logging and metrics system using NestJS and PostgreSQL.
- Apply OOP principles (encapsulation, inheritance, polymorphism) and design patterns (e.g., Repository, Factory, Strategy).
- Enhance expertise in SQL query optimization and database schema design.
- Link developers to services and alerts for targeted monitoring.

## Core Features

- **Role-Based Access Control (RBAC)**: Secure user authentication with Admin and Viewer roles.
- **Service Management**: Define and assign services to developers.
- **API Key Management**: Secure log and metric ingestion via API keys.
- **Real-Time Log and Metric Ingestion**: High-performance ingestion with validation.
- **Advanced Log Querying**: Filterable and paginated log search with full-text capabilities.
- **Alerting System**: Configurable rules for logs and metrics, tied to services and users.
- **Service Metrics**: Monitor performance metrics for external services.
- **Usage Analytics**: Insights into log and metric ingestion patterns.
- **Notification Management**: Customizable user notification preferences.

---

# Developer Documentation

## Architecture Overview

LogSage adopts a **modular, layered architecture** inspired by **Domain-Driven Design (DDD)** and **Clean Architecture**. This structure separates concerns, promotes testability, and ensures scalability.

### Design Patterns

- **Repository Pattern**: Abstracts database operations.
- **Factory Pattern**: Creates notification handlers dynamically.
- **Strategy Pattern**: Supports multiple ingestion strategies.
- **Decorator Pattern**: Enhances request handling with metadata.
- **Observer Pattern**: Enables real-time alerting.

### Project Structure

```
src/
├── shared/                  # Cross-cutting concerns
│   ├── guards/             # Authentication and authorization
│   ├── decorators/         # Custom decorators
│   ├── interceptors/       # Request/response transformers
│   ├── filters/            # Exception handling
│   ├── utils/              # Helper functions
│   └── interfaces/         # Shared contracts
├── modules/                 # Feature modules
│   ├── auth/               # Authentication and user management
│   ├── services/           # Service definition and user assignment
│   ├── api-keys/           # API key management
│   ├── logs/               # Log ingestion and querying
│   ├── alerts/             # Alert rule creation and notifications
│   ├── metrics/            # Service metric ingestion and analysis
│   ├── analytics/          # Usage and storage analytics
│   └── notifications/      # Notification preferences and history
├── config/                  # Configuration management
├── database/                # Migrations and seeders
└── tests/                   # Unit and integration tests
```

### Module Anatomy

```
modules/<module-name>/
├── controllers/     # REST API endpoints
├── services/        # Business logic
├── repositories/    # Data access layer
├── dtos/            # Input/output validation
├── entities/        # ORM entities
├── interfaces/      # Module-specific contracts
└── <module>.module.ts  # NestJS module definition
```

---

## User Management Module

### Purpose

Manages user authentication, profile updates, and role-based access control using **Google OAuth**. Admins can invite users, manage roles, assign services, and deactivate accounts.

### Key Features

- **RBAC**: Roles (Admin, Viewer) with granular permissions.
- **Google OAuth**: Secure single sign-on.
- **User Invitations**: Email-based onboarding.
- **Service Assignment**: Link developers to services.
- **Profile Management**: Update email and metadata.
- **Soft Deletion**: Deactivate accounts with audit trails.

### API Endpoints

| Method | Endpoint                  | Description                   | Roles       |
| ------ | ------------------------- | ----------------------------- | ----------- |
| GET    | `/users/:id`              | Fetch user profile            | Admin, Self |
| PATCH  | `/users/:id`              | Update user profile           | Admin, Self |
| DELETE | `/users/:id`              | Soft delete user              | Admin       |
| POST   | `/users/invite`           | Invite new user via email     | Admin       |
| POST   | `/users/:userId/services` | Assign service to user        | Admin       |
| GET    | `/users/:userId/services` | List user’s services          | Admin, Self |
| POST   | `/auth/google-login`      | Authenticate via Google OAuth | All         |

### Entity

```ts
@Entity()
class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column({ enum: ['Admin', 'Viewer'] })
  role: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => Service, (service) => service.users)
  @JoinTable({ name: 'user_services' })
  services: Service[];
}
```

---

## Services Module

### Purpose

Manages the definition and assignment of external services (e.g., `billing-service`) to developers, enabling targeted monitoring and alerting.

### Key Features

- **Service Creation**: Define new services with metadata.
- **User Assignment**: Link developers to services.
- **Service Listing**: Retrieve all services or user-specific services.
- **Metadata Support**: Store service-specific details in JSONB.

### API Endpoints

| Method | Endpoint                     | Description                    | Roles         |
| ------ | ---------------------------- | ------------------------------ | ------------- |
| POST   | `/services`                  | Create new service             | Admin         |
| GET    | `/services`                  | List all services              | Admin, Viewer |
| GET    | `/services/:serviceId`       | Fetch service details          | Admin, Viewer |
| POST   | `/services/:serviceId/users` | Assign users to service        | Admin         |
| GET    | `/services/:serviceId/users` | List users assigned to service | Admin         |

### Entity

```ts
@Entity()
class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => User, (user) => user.services)
  users: User[];
}
```

---

## API Keys Module

### Purpose

Enables secure log and metric ingestion through API key authentication, with features for key generation, revocation, and usage monitoring.

### Key Features

- **Key Generation**: Cryptographically secure API keys.
- **Revocation**: Deactivate compromised keys.
- **Usage Tracking**: Monitor key activity.
- **Rate Limiting**: Prevent abuse.

### API Endpoints

| Method | Endpoint               | Description                | Roles |
| ------ | ---------------------- | -------------------------- | ----- |
| POST   | `/api-keys`            | Generate new API key       | Admin |
| GET    | `/api-keys`            | List all API keys          | Admin |
| PATCH  | `/api-keys/:id/revoke` | Revoke API key             | Admin |
| GET    | `/api-keys/usage`      | Fetch key usage statistics | Admin |

### Entity

```ts
@Entity()
class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  key: string; // Hashed

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  usageStats: Record<string, any>;
}
```

---

## Logs Module

### Purpose

Handles ingestion, storage, and querying of logs with advanced filtering and pagination, linked to services.

### Key Features

- **Real-Time Ingestion**: Validates logs via API keys and service IDs.
- **Full-Text Search**: Uses PostgreSQL `tsvector`.
- **Pagination**: Cursor-based for scalability.
- **Retention Policies**: Configurable log expiration.
- **Metadata Support**: JSONB for context.

### API Endpoints

| Method | Endpoint | Description             | Roles         |
| ------ | -------- | ----------------------- | ------------- |
| POST   | `/logs`  | Ingest new log entry    | API Key       |
| GET    | `/logs`  | Query logs with filters | Admin, Viewer |

### Query Parameters (`GET /logs`)

| Param       | Type     | Description                                    |
| ----------- | -------- | ---------------------------------------------- |
| `level`     | string   | Log level (`info`, `warn`, `error`, `debug`)   |
| `serviceId` | string   | Service ID (e.g., `service-001`)               |
| `search`    | string   | Full-text search on message and metadata       |
| `from`      | ISO date | Start timestamp                                |
| `to`        | ISO date | End timestamp                                  |
| `limit`     | number   | Max results (default: 50)                      |
| `cursor`    | string   | Cursor for pagination                          |
| `sort`      | string   | `asc` or `desc` by timestamp (default: `desc`) |

### Entity

```ts
@Entity()
class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  apiKeyId: string;

  @Column()
  serviceId: string;

  @Column({ enum: ['info', 'warn', 'error', 'debug'] })
  level: string;

  @Column()
  message: string;

  @Column()
  timestamp: Date;

  @Column({ type: 'jsonb', nullable: true })
  context: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'tsvector', generated: true })
  searchVector: any;
}
```

---

## Alerting Module

### Purpose

Enables users to define rules for monitoring logs and metrics, tied to services and developers, with notifications via extensible channels.

### Key Features

- **Dynamic Rules**: Conditions scoped to services.
- **User-Specific Alerts**: Notify assigned developers.
- **Notification Channels**: Pluggable handlers.
- **Rate Limiting**: Prevents alert spam.
- **History Tracking**: Audit trail of alerts.

### API Endpoints

| Method | Endpoint               | Description            | Roles         |
| ------ | ---------------------- | ---------------------- | ------------- |
| POST   | `/alerts`              | Create alert rule      | Admin         |
| GET    | `/alerts`              | List alert rules       | Admin         |
| GET    | `/alerts/user/:userId` | List alerts for a user | Admin, Viewer |
| GET    | `/alerts/:id`          | Fetch alert rule       | Admin         |
| PATCH  | `/alerts/:id`          | Update alert rule      | Admin         |
| DELETE | `/alerts/:id`          | Delete alert rule      | Admin         |
| POST   | `/alerts/test`         | Trigger test alert     | Admin         |

### Example Alert Rule

```json
{
  "name": "High Error Rate",
  "type": "metric",
  "serviceId": "service-001",
  "userIds": ["user-001", "user-002"],
  "metricName": "error_count",
  "threshold": 10,
  "withinMinutes": 5,
  "target": { "type": "email", "to": "team@example.com" }
}
```

### Entity

```ts
@Entity()
class Alert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  type: 'log' | 'metric';

  @Column()
  serviceId: string;

  @Column({ type: 'jsonb', nullable: true })
  userIds: string[];

  @Column({ nullable: true })
  metricName?: string;

  @Column({ nullable: true })
  query?: string;

  @Column()
  threshold: number;

  @Column()
  withinMinutes: number;

  @Column({ type: 'jsonb' })
  target: { type: string; to: string };

  @CreateDateColumn()
  createdAt: Date;
}
```

---

## Metrics Module

### Purpose

Collects, stores, and analyzes metrics submitted by external services, linked to service IDs, with support for alerting and visualization.

### Key Features

- **Service-Specific Metrics**: Captures metrics tied to services.
- **Time-Series Storage**: Uses TimescaleDB.
- **Flexible Metric Types**: Numeric metrics with JSONB metadata.
- **Prometheus Integration**: Exposes metrics in OpenMetrics format.
- **Threshold Alerts**: Alerts for anomalies.
- **Historical Queries**: Metric trends analysis.

### API Endpoints

| Method | Endpoint             | Description                    | Roles         |
| ------ | -------------------- | ------------------------------ | ------------- |
| POST   | `/metrics`           | Ingest new metric              | API Key       |
| GET    | `/metrics`           | Query metrics with filters     | Admin, Viewer |
| POST   | `/metrics/alert`     | Create metric-based alert      | Admin         |
| GET    | `/metrics/history`   | Query historical metric trends | Admin, Viewer |
| DELETE | `/metrics/alert/:id` | Delete metric alert            | Admin         |

### Entity

```ts
@Entity()
class Metric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  apiKeyId: string;

  @Column()
  serviceId: string;

  @Column()
  name: string;

  @Column()
  value: number;

  @Column()
  timestamp: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

## Usage Analytics Module

### Purpose

Provides insights into log and metric volume, service activity, and storage trends.

### Key Features

- **Log and Metric Volume Trends**: Aggregates ingestion stats.
- **Service Insights**: Identifies high-traffic services.
- **Storage Monitoring**: Tracks database growth.

### API Endpoints

| Method | Endpoint                   | Description                           | Roles |
| ------ | -------------------------- | ------------------------------------- | ----- |
| GET    | `/analytics/log-volume`    | Fetch log volume stats                | Admin |
| GET    | `/analytics/metric-volume` | Fetch metric volume stats             | Admin |
| GET    | `/analytics/top-services`  | List top services by log/metric count | Admin |
| GET    | `/analytics/api-usage`     | API key usage stats                   | Admin |
| GET    | `/analytics/storage-usage` | Database storage usage                | Admin |

---

## Notification Module

### Purpose

Manages user notification preferences and tracks notification history.

### Key Features

- **Preference Management**: Configure notification channels.
- **History Tracking**: View past notifications.
- **Real-Time Updates**: Immediate preference application.

### API Endpoints

| Method | Endpoint                     | Description                     | Roles |
| ------ | ---------------------------- | ------------------------------- | ----- |
| GET    | `/notifications/history`     | Fetch notification history      | All   |
| PATCH  | `/notifications/preferences` | Update notification preferences | All   |

### Entity

```ts
@Entity()
class NotificationHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string; // References User

  @Column({ nullable: true })
  alertId: string; // References Alert, nullable for manual/test notifications

  @Column()
  type: string; // e.g., 'email', 'slack', 'webhook'

  @Column()
  message: string; // Notification content

  @Column()
  sentAt: Date; // Timestamp of notification

  @Column({ enum: ['sent', 'failed', 'pending'] })
  status: string; // Notification delivery status

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional details (e.g., error message if failed)
}
```

---

## Database Design

### Schema

- **Users**: Stores user data with service associations.
- **Services**: Defines external services.
- **User_Services**: Junction table for user-service relationships.
- **ApiKeys**: Tracks API keys.
- **Logs**: Stores log entries with service IDs.
- **Metrics**: Stores service metrics as a TimescaleDB hypertable.
- **Alerts**: Defines alert rules with service and user links.
- **Notifications**: Tracks notification history and preferences.

### Optimizations

- **Partitioning**: Logs and metrics partitioned by timestamp.
- **Indexing**: GIN for full-text search, B-tree for service IDs and timestamps.
- **TimescaleDB**: Enabled for metrics.

### Future Enhancements

- Integrate **Elasticsearch** for advanced analytics.
- Add **WebSocket** for real-time metrics treaming.
- Implement **sharding** for database scaling.
