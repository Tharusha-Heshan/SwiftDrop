# SwiftDrop - Intelligent Logistics & Courier Platform

Enterprise Application Development (EAD) - Level 3 Semester 1  
Academic Monorepo: Spring Boot (Java 21) & React (TypeScript, Vite)

---

## 1. Project Overview

SwiftDrop is an enterprise-grade parcel delivery and logistics management platform engineered for island-wide courier fulfillment. Designed following a modular monolith architecture (Spring Modulith), the platform coordinates package bookings, real-time vehicle assignments, automated status tracking, dynamic road-distance pricing, event-driven customer alerts (Email and SMS), and merchant B2B integrations.

### Key Capabilities

* **Customer Portal**: Self-service parcel booking, quote estimation, dynamic delivery speeds (Standard, Express, Same-Day), and public tracking token lookups.
* **Courier Mobile/Web Portal**: Real-time assignment queues, workflow transition controls (Picked Up, In Transit, Delivered, Failed), proof-of-delivery receipts, and horizontal security barriers.
* **Dispatcher Operations**: Visual workload monitoring, active vehicle assignment and re-assignment with audit reasons, and regional zone management.
* **Intelligent AI Assistant**: Conversational assistant powered by Google Gemini and Model Context Protocol (MCP) function calling for live rate calculation and order tracking.
* **Dynamic Route & Distance Pricing**: Real-time road distance calculation via Google Maps Routes API, falling back to tiered district rate structures.
* **Event-Driven Messaging & Webhooks**: RabbitMQ broker coordinating transactional customer emails (Brevo SMTP), mock SMS alerts, and merchant webhook delivery with HMAC-SHA256 verification.
* **Role-Based Access Control (RBAC)**: Centralized identity authentication via Auth0 JWT tokens, synchronized to an internal user directory with vertical privilege enforcement.

---

## 2. System Architecture

The application is structured as a modular monolith where each business capability is encapsulated within an isolated Spring Modulith module. Modules interact strictly through published domain events or explicitly exposed `@NamedInterface` boundaries.

```
                          [ Client Browser / SPA ]
                                     |
               +---------------------+---------------------+
               |                     |                     |
     (Customer / Merchant)       (Courier)           (Dispatcher)
               |                     |                     |
               v                     v                     v
         [ Port 5173: React 19 + TypeScript + Vite Single-Page Application ]
                                     |
                          HTTPS / REST API / JWT
                                     |
                                     v
                 [ Port 8080: Spring Boot 4 Backend API ]
   +-------------------------------------------------------------------+
   |  Spring Modulith Architecture                                     |
   |                                                                   |
   |  +------------+   +------------+   +------------+   +-----------+ |
   |  |  Customer  |   |  Courier   |   | Dispatcher |   |  Pricing  | |
   |  +------------+   +------------+   +------------+   +-----------+ |
   |         |               |                |                |       |
   |         +-------+-------+--------+-------+                |       |
   |                 | Domain Events  |                        |       |
   |                 v                v                        v       |
   |          +--------------+  +--------------+        +------------+ |
   |          | Notification |  |   Identity   |        |  AI Assist | |
   |          +--------------+  +--------------+        +------------+ |
   +-------------------------------------------------------------------+
        |                |              |                    |
        v                v              v                    v
  [ PostgreSQL ]    [ RabbitMQ ]   [ Brevo SMTP ]    [ Google Maps / Gemini ]
   Flyway v1-v21     Message Broker Email Alerts      Routing & Function Calls
```

### Module Responsibilities

| Module | Package Root | Responsibilities |
|---|---|---|
| **Customer** | `com.swiftdrop.backend.customer` | Package bookings, addresses, public tracking tokens, customer cancellation. |
| **Courier** | `com.swiftdrop.backend.courier` | Courier workflow state machine, delivery proofs, failure reporting, horizontal tenant checks. |
| **Dispatcher** | `com.swiftdrop.backend.dispatcher` | Courier assignments, availability locking (`SELECT FOR UPDATE`), workload capacity. |
| **Pricing** | `com.swiftdrop.backend.pricing` | Tariff rules, weight penalties, Google Maps driving distance calculations. |
| **Notification** | `com.swiftdrop.backend.notification` | RabbitMQ listeners, Brevo SMTP emails, mock SMS dispatcher, merchant webhooks. |
| **AI Assistant** | `com.swiftdrop.backend.ai` | Gemini LLM integration, rate limiting, and Model Context Protocol (MCP) tools. |
| **Identity** | `com.swiftdrop.backend.identity` | Auth0 token parsing, internal user directory, role mapping (`AppUser`). |
| **Merchant** | `com.swiftdrop.backend.merchant` | B2B batch CSV order ingestion, OAuth machine-to-machine tokens, lifecycle hooks. |
| **Security** | `com.swiftdrop.backend.security` | JWT filter chains, role-based URL guards, actuator security. |
| **Shared** | `com.swiftdrop.backend.shared` | RFC 7807 Problem Detail exception handlers and global utilities. |

---

## 3. Repository Structure

```text
SwiftDrop/
|-- backend/                       # Spring Boot REST API (Java 21, Maven)
|   |-- src/
|   |   |-- main/java/com/swiftdrop/backend/
|   |   |   |-- ai/                # AI assistant, Gemini client & MCP tools
|   |   |   |-- courier/           # Courier lifecycle & delivery proof
|   |   |   |-- customer/          # Customer bookings & tracking
|   |   |   |-- dispatcher/        # Dispatcher operations & assignment
|   |   |   |-- identity/          # Auth0 directory & AppUser entity
|   |   |   |-- merchant/          # Merchant B2B API & batch booking
|   |   |   |-- notification/      # Email, SMS & Webhook dispatcher
|   |   |   |-- pricing/           # Distance engine & tariff calculation
|   |   |   |-- security/          # Security filters & JWT validation
|   |   |   `-- shared/            # Global exception handlers (RFC 7807)
|   |   |-- main/resources/
|   |   |   |-- db/migration/      # Flyway SQL migrations (v1 - v21)
|   |   |   `-- application*.properties
|   |   `-- test/java/             # 56 test classes, 385 test cases
|   |-- mvnw.cmd / mvnw            # Maven Wrapper
|   `-- pom.xml                    # Project dependencies & build config
|-- frontend/                      # React 19 SPA (TypeScript, Vite)
|   |-- src/
|   |   |-- features/              # Feature modules (auth, ai, courier, merchant, dispatcher)
|   |   |-- components/            # Reusable UI component library
|   |   |-- app/                   # Root router & application layouts
|   |   `-- assets/                # Brand SVGs and design assets
|   |-- package.json               # Node dependencies
|   `-- vite.config.ts             # Vite build & proxy configuration
|-- docs/                          # Architecture, modules, and API specifications
|   |-- COURIER-MODULE.md
|   |-- CUSTOMER-MODULE.md
|   |-- DISPATCHER-API.md
|   |-- PRICING-AND-ZONES-API.md
|   |-- MODULES.md
|   `-- SwiftDrop_Test_Report_and_Coverage_Summary.docx
|-- docker-compose.yml             # Local RabbitMQ & Mailpit support services
`-- README.md                      # Project setup & run documentation
```

---

## 4. Prerequisites

Before setting up the project locally, ensure the following software is installed:

* **Java Development Kit (JDK)**: Version 21 (Eclipse Temurin or Oracle JDK 21 recommended)
* **Node.js**: Version 20 LTS or higher (with `npm`)
* **Docker & Docker Compose**: For local RabbitMQ and Mailpit services
* **Git**: Version 2.40 or higher

---

## 5. Local Setup and Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/Tharusha-Heshan/SwiftDrop.git
cd SwiftDrop
```

### Step 2: Start Infrastructure Services (Docker)

Start RabbitMQ (message broker) and Mailpit (local SMTP testing server):

```bash
docker compose up -d
```

* **RabbitMQ Management Dashboard**: `http://localhost:15672` (Credentials: `guest` / `guest`)
* **RabbitMQ Broker Port**: `localhost:5672`
* **Mailpit Web UI (Email Viewer)**: `http://localhost:8025`
* **Mailpit SMTP Port**: `localhost:1025`

---

### Step 3: Backend Setup (Spring Boot)

The backend supports multiple execution profiles:
* `default`: Local development using local PostgreSQL or H2 with Mailpit.
* `dev`: Cloud development connected to the team AWS RDS PostgreSQL instance with live Brevo SMTP relay.

#### Option A: Running with Local Configuration

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Run the application using the Maven Wrapper:
   * **Windows (PowerShell / Command Prompt)**:
     ```powershell
     .\mvnw.cmd spring-boot:run
     ```
   * **macOS / Linux**:
     ```bash
     ./mvnw spring-boot:run
     ```

#### Option B: Running with Shared Cloud Development Database (Dev Profile)

When connecting to an external or cloud database instance, supply the connection details via environment variables:

* **Windows (PowerShell)**:
  ```powershell
  $env:DB_URL="jdbc:postgresql://<DB_HOST>:5432/<DB_NAME>?sslmode=require"
  $env:DB_USERNAME="<DB_USER>"
  $env:DB_PASSWORD="<DB_PASSWORD>"
  $env:GOOGLE_MAPS_API_KEY="<GOOGLE_MAPS_API_KEY>"
  cd backend
  .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
  ```

* **macOS / Linux (Bash)**:
  ```bash
  export DB_URL="jdbc:postgresql://<DB_HOST>:5432/<DB_NAME>?sslmode=require"
  export DB_USERNAME="<DB_USER>"
  export DB_PASSWORD="<DB_PASSWORD>"
  export GOOGLE_MAPS_API_KEY="<GOOGLE_MAPS_API_KEY>"
  cd backend
  ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
  ```

> Note: For local development secrets (database passwords, Google Maps API key, Gemini API key), place them in `backend/src/main/resources/application-local.properties`, which is excluded from source control via `.gitignore`.

The backend server will start and listen at: **`http://localhost:8080`**  
Actuator health check endpoint: **`http://localhost:8080/actuator/health`**

---

### Step 4: Frontend Setup (React + Vite)

1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

The frontend application will start and listen at: **`http://localhost:5173`**

---

## 6. Environment Configurations

Configuration files are located in `backend/src/main/resources/`:

* **`application.properties`**: Default application configuration with fallback values.
* **`application-dev.properties`**: Cloud development overrides (AWS RDS, Brevo SMTP relay).
* **`application-local.properties`**: Git-ignored local file for individual developer credentials and API keys.

### Essential Configuration Keys

| Property Key | Default Value | Description |
|---|---|---|
| `spring.datasource.url` | `jdbc:postgresql://localhost:5432/swiftdrop` | PostgreSQL JDBC connection URL. |
| `spring.rabbitmq.host` | `localhost` | RabbitMQ broker host. |
| `spring.rabbitmq.port` | `5672` | RabbitMQ broker port. |
| `spring.mail.host` | `localhost` (Mailpit) / `smtp-relay.brevo.com` | SMTP host for delivery notifications. |
| `swiftdrop.maps.google.api-key` | `""` | Google Maps Routes API key for driving km quotes. |
| `swiftdrop.ai.gemini.api-key` | `""` | Google Gemini API key for conversational assistant. |
| `swiftdrop.ai.gemini.model` | `gemini-3.5-flash-lite` | Gemini model name for function calling. |
| `swiftdrop.frontend-url` | `http://localhost:5173` | Base URL used to generate public tracking links. |

---

## 7. Database Migrations (Flyway)

Database schema evolution is managed via Flyway. Migrations are executed automatically upon Spring Boot startup.

* **Migration Path**: `backend/src/main/resources/db/migration/`
* **Version Range**: `V1__init_schema.sql` through `V21__create_courier_profile_tables.sql`
* **Core Tables**: `delivery`, `delivery_address`, `tracking_event`, `courier`, `courier_assignment`, `delivery_proof`, `delivery_failure`, `notification_template`, `notification_log`, `merchant_webhook_config`, `webhook_delivery_log`.

---

## 8. Role-Based Test Access

The system enforces role-based URL guards and menu navigations through Auth0 claims:

| Role | Access URL | Permissions & Capabilities |
|---|---|---|
| **ADMIN** | `/admin` | Tariff maintenance, pricing zone administration, platform audit reports. |
| **DISPATCHER** | `/dispatcher` | Workload queues, manual/automated courier assignment, reassignment reason audits. |
| **COURIER** | `/courier` | Assigned package list, pickup / transit / delivery confirmations with proof receipts. |
| **MERCHANT** | `/merchant` | B2B bulk delivery bookings, CSV upload, API credential management, webhook status logs. |
| **CUSTOMER** | `/track`, `/book` | Package booking, live tracking token viewer, estimated quotes, AI assistant chat. |

---

## 9. Automated Testing & Verification

The project includes an automated test suite comprising 56 test classes and 385 verification cases.

### Running Backend Tests

Navigate to `backend` and execute:

```bash
# Run all unit, integration, and architecture tests
./mvnw test

# Run Spring Modulith architectural verification only
./mvnw test -Dtest="ModularityTest"

# Run Courier and Dispatcher integration workflow tests
./mvnw test -Dtest="CourierDispatcherIntegrationTest,CourierWorkflowIntegrationTest"

# Run Notification and RabbitMQ messaging tests
./mvnw test -Dtest="NotificationSystemTest"

# Run AI assistant function calling and rate-limiting tests
./mvnw test -Dtest="AiAssistantApiTest,DeliveryAiToolsTest"
```

### Running Frontend Tests

Navigate to `frontend` and execute:

```bash
# Run auth helper unit tests using native Node test runner
npx tsx --test src/features/auth/lib/__tests__/authHelpers.test.ts
```

### Generating Code Coverage Report (JaCoCo)

To run tests with JaCoCo code coverage analysis:

```bash
cd backend
./mvnw clean org.jacoco:jacoco-maven-plugin:0.8.13:prepare-agent test org.jacoco:jacoco-maven-plugin:0.8.13:report
```

* **HTML Report Path**: `backend/target/site/jacoco/index.html`
* **Verification Scope**: Overall system line coverage exceeds **90%**, with core domain branches exceeding **84%**.

---

## 10. Building for Production

### Backend Build

Inside `backend/`:
```bash
./mvnw clean package -DskipTests=false
```
The production-ready executable JAR is output to: `backend/target/backend-0.0.1-SNAPSHOT.jar`

### Frontend Build

Inside `frontend/`:
```bash
npm run build
```
Optimized static production assets are compiled to: `frontend/dist/`

---

## 11. Additional Documentation

For detailed technical specifications, consult the documents in the `docs/` directory:

* [`docs/MODULES.md`](docs/MODULES.md) - Spring Modulith architectural rules, boundaries, and domain diagrams.
* [`docs/CUSTOMER-MODULE.md`](docs/CUSTOMER-MODULE.md) - Customer booking API endpoints, DTO contracts, and pricing integration.
* [`docs/COURIER-MODULE.md`](docs/COURIER-MODULE.md) - Courier lifecycle state machines, proofs, and horizontal privilege controls.
* [`docs/DISPATCHER-API.md`](docs/DISPATCHER-API.md) - Dispatcher assignment workflows and concurrency locking semantics.
* [`docs/PRICING-AND-ZONES-API.md`](docs/PRICING-AND-ZONES-API.md) - Google Maps Routes integration and regional tariff models.
* [`docs/AUTH.md`](docs/AUTH.md) - Auth0 authentication, JWT token claim structures, and security filter chains.
* [`docs/DEPLOY.md`](docs/DEPLOY.md) - AWS deployment topology (EC2, k3s, ECR, CloudFront, S3, RDS).
* [`docs/SwiftDrop Test Report and Coverage Summary.docx`](docs/SwiftDrop%20Test%20Report%20and%20Coverage%20Summary.docx) - Full academic quality assurance, test report, and coverage audit.
