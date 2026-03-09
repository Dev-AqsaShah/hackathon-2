# Quickstart: Advanced Todo Platform (Phase V)

**Branch**: `003-advanced-kafka-dapr` | **Date**: 2026-03-02

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Docker Desktop | 4.x+ | Run all services |
| Docker Compose | v2.x | Orchestrate multi-service environment |
| Dapr CLI | 1.13+ | Initialize Dapr self-hosted mode |
| Python | 3.13+ | Backend + new services |
| Node.js | 20+ | Frontend |
| Helm | 3.x | Kubernetes deployment |

---

## 1. Install Dapr CLI

```bash
# Windows (PowerShell)
winget install Dapr.CLI

# Verify
dapr --version
```

---

## 2. Initialize Dapr Self-Hosted

```bash
# Initializes Dapr with Redis (state store) and Zipkin (tracing)
dapr init

# Verify - should show dapr_redis, dapr_zipkin containers running
docker ps
```

---

## 3. Clone & Configure

```bash
# Navigate to phase-v
cd D:/hackathon-2/phase-v

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Edit backend/.env — fill in:
# DATABASE_URL=<your-neon-postgres-url>
# BETTER_AUTH_SECRET=<32-char-secret>
# OPENAI_API_KEY=<your-openai-key>

# Edit frontend/.env.local — fill in:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# BETTER_AUTH_SECRET=<same-secret-as-backend>
# DATABASE_URL=<same-neon-postgres-url>
```

---

## 4. Start Infrastructure (Kafka + Redis)

```bash
# Start Kafka + Zookeeper + Redis (infrastructure only)
docker compose -f docker-compose.infra.yml up -d

# Verify Kafka is ready
docker compose -f docker-compose.infra.yml logs kafka | grep "started"
```

---

## 5. Run Database Migrations

```bash
cd backend

# Create virtual environment (if not exists)
python -m venv venv
source venv/Scripts/activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run all migrations
alembic upgrade head

# Verify new tables exist
python -c "from app.core.database import engine; print('DB OK')"
```

---

## 6. Start Services with Dapr

Each service runs with a Dapr sidecar. Use the provided `start-dev.sh` script or run individually:

### Backend API (Port 8000, Dapr HTTP 3500)
```bash
cd phase-v/backend
dapr run \
  --app-id backend \
  --app-port 8000 \
  --dapr-http-port 3500 \
  --components-path ../dapr/components \
  -- uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Notification Service (Port 8001, Dapr HTTP 3501)
```bash
cd phase-v/notification-service
dapr run \
  --app-id notification-service \
  --app-port 8001 \
  --dapr-http-port 3501 \
  --components-path ../dapr/components \
  -- uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### Scheduler Service (Port 8002, Dapr HTTP 3502)
```bash
cd phase-v/scheduler-service
dapr run \
  --app-id scheduler-service \
  --app-port 8002 \
  --dapr-http-port 3502 \
  --components-path ../dapr/components \
  -- uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

### Frontend (Port 3000)
```bash
cd phase-v/frontend
npm install
npm run dev
```

---

## 7. Full Docker Compose (All Services)

```bash
cd phase-v

# Build and start everything
docker compose up --build

# Services started:
# - frontend:3000
# - backend:8000 (with dapr sidecar:3500)
# - notification-service:8001 (with dapr sidecar:3501)
# - scheduler-service:8002 (with dapr sidecar:3502)
# - kafka:9092
# - zookeeper:2181
# - redis:6379
# - dapr-placement:50006
```

---

## 8. Verify Setup

### Check all services healthy
```bash
# Backend
curl http://localhost:8000/health

# Notification service
curl http://localhost:8001/health

# Scheduler service
curl http://localhost:8002/health

# Dapr sidecar (backend)
curl http://localhost:3500/v1.0/healthz
```

### Test Kafka event flow
```bash
# Create a task and watch for event
curl -X POST http://localhost:8000/api/<user_id>/tasks \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test recurring task", "priority": "high"}'

# Check domain_events table
# Should see a task.created event within 1 second
```

### Test recurring task
```bash
curl -X POST http://localhost:8000/api/<user_id>/tasks \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Daily standup",
    "priority": "high",
    "due_date": "2026-03-03T09:00:00Z",
    "recurrence": {
      "frequency": "daily",
      "interval": 1,
      "end_type": "never"
    },
    "reminders": [{"offset_minutes": 60}]
  }'
```

---

## 9. Dapr Dashboard (Optional)

```bash
# View all running Dapr services and pub/sub activity
dapr dashboard
# Opens at http://localhost:8080
```

---

## 10. Kubernetes Deployment (Production)

```bash
# Install Dapr on cluster
helm repo add dapr https://dapr.github.io/helm-charts/
helm upgrade --install dapr dapr/dapr --namespace dapr-system --create-namespace

# Install Kafka (via Bitnami)
helm repo add bitnami https://charts.bitnami.com/bitnami
helm upgrade --install kafka bitnami/kafka --set replicaCount=1

# Deploy todo-app (extended Phase IV Helm chart)
helm upgrade --install todo-app ./helm/todo-app \
  --set backend.image.tag=phase-v \
  --set frontend.image.tag=phase-v \
  --set notificationService.enabled=true \
  --set schedulerService.enabled=true
```

---

## Directory Structure (Phase V)

```
phase-v/
├── backend/                    # Existing FastAPI (extended)
│   └── app/
│       ├── models/             # + RecurrenceRule, Tag, Reminder, Notification, DomainEvent
│       ├── api/routes/         # + tags.py, reminders.py, notifications.py (search extended)
│       └── services/           # + event_publisher.py
│
├── notification-service/       # NEW — event consumer service
│   └── app/
│       ├── main.py
│       ├── subscribers/        # Dapr topic subscriptions
│       └── services/           # notification writer
│
├── scheduler-service/          # NEW — cron/polling service
│   └── app/
│       ├── main.py
│       ├── jobs/               # overdue checker, reminder dispatcher
│       └── services/           # event publisher
│
├── dapr/
│   └── components/
│       ├── pubsub.yaml         # Kafka via Dapr
│       ├── statestore.yaml     # Redis via Dapr
│       └── subscription.yaml   # Topic subscriptions
│
├── frontend/                   # Existing Next.js (extended)
│   └── app/
│       ├── components/
│       │   ├── todos/          # + priority badge, tag chips, due date display
│       │   └── notifications/  # NEW — notification bell, list
│       └── app/
│           ├── tasks/create/   # Extended with priority, tags, due date, recurrence
│           └── notifications/  # NEW page
│
├── helm/todo-app/              # Extended from Phase IV
│   └── templates/
│       ├── notification-service-deployment.yaml  # NEW
│       └── scheduler-service-deployment.yaml     # NEW
│
└── docker-compose.yml          # Extended with Kafka, Redis, new services + Dapr sidecars
```
