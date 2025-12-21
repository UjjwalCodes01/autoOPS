# AutoOps: AI-Powered Incident Response System

**A production-grade incident response automation platform built with Motia**

## 🎯 Overview

AutoOps is a unified backend system that ingests production incidents, performs AI-driven analysis, intelligently routes them, attempts automated remediation, and escalates to humans when necessary. Built on Motia's unified runtime, it demonstrates how to combine APIs, event streams, background jobs, and AI reasoning into a cohesive production system.

**Hackathon Category**: Backend Reloaded - Production-grade backends with a single primitive

## 🏆 Hackathon Criteria Met

### ✅ Real-World Impact
- **Problem Solved**: Automates incident triage and remediation, reducing MTTR (Mean Time To Resolution)
- **Use Case**: Production monitoring systems, SRE automation, on-call management
- **Business Value**: Reduces manual incident handling, enables faster recovery, improves system reliability

### ✅ Creativity & Innovation
- **Unified Architecture**: Single primitive (Steps) for APIs, events, background jobs, and AI reasoning
- **Intelligent Routing**: AI-powered decision making for incident prioritization
- **Dead Letter Queue Pattern**: Enterprise-grade error handling with human escalation
- **Multi-Step Orchestration**: Complex workflows coordinated through event-driven architecture

### ✅ Learning Journey
- Demonstrated problem-solving through:
  - Event-driven workflow patterns
  - Distributed state management across process boundaries
  - Graceful degradation with fallback heuristics
  - Production error handling and observability

### ✅ Technical Excellence
- Clean, modular step architecture
- Comprehensive error handling with retries (BullMQ)
- Observability built-in (tracing, logging, structured events)
- State persistence across process restarts
- Intelligent heuristic AI (no external dependency lock-in)

### ✅ Developer Experience
- Clear API endpoints
- Structured logging with context
- Distributed tracing via traceId
- Self-documenting step configuration
- Easy to test with curl commands

## 📋 System Architecture

```
POST /incident
    ↓
┌─────────────────────────────────────────────────────────────┐
│ INCIDENT INGESTION (API Step)                               │
│ - Receives incident with service, error, severity            │
│ - Generates traceId for distributed tracking                 │
│ - Emits: incident.received                                   │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│ CLASSIFICATION (Event Step)                                  │
│ - Analyzes severity based on error patterns                  │
│ - Detects critical services (auth, payments)                 │
│ - Emits: incident.classified                                 │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│ AI ANALYSIS (Heuristic AI Step)                              │
│ - Intelligent incident analysis                              │
│ - Determines: escalate | attempt_remediation | monitor       │
│ - Calculates confidence score (0-1)                          │
│ - Emits: incident.analyzed                                   │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│ INTELLIGENT ROUTER (Event Step)                              │
│ - Routes based on AI recommendation & severity               │
│ - Emits: incident.ready_for_remediation OR                  │
│          incident.ready_for_escalation                       │
└─────────────────────────────────────────────────────────────┘
    ↓
    ├─────────────────────────────┬──────────────────────────┐
    ↓                             ↓
┌───────────────────┐  ┌──────────────────────────┐
│ REMEDIATION LANE  │  │ ESCALATION LANE (DLQ)    │
│                   │  │                          │
│ Attempt 1         │  │ Human Review Required    │
│ Attempt 2         │  │ - Incident details       │
│ Attempt 3         │  │ - Failed attempts        │
│   ↓ (success)     │  │ - Suggested action       │
│ RESOLVED ✅       │  │ - TraceId for audit      │
│   ↓ (failure)     │  │                          │
│ ESCALATE → DLQ 🚨 │  └──────────────────────────┘
└───────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Redis (for Motia's job queue)

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file (optional):
```bash
GOOGLE_AI_API_KEY=your-key-here  # Optional: for real AI
NODE_ENV=development
```

### Run Development Server

```bash
npm run dev
```

Server listens on `http://localhost:3000`

## 📡 API Endpoints

### Ingest Incident

```bash
curl -X POST http://localhost:3000/incident \
  -H "Content-Type: application/json" \
  -d '{
    "service": "payments",
    "error": "gateway timeout",
    "severity": "high"
  }'
```

**Response:**
```json
{
  "message": "Incident received",
  "incidentId": 451
}
```

## 🧪 Test Scenarios

### Scenario 1: Critical Incident (Immediate Escalation)
```bash
curl -X POST http://localhost:3000/incident \
  -H "Content-Type: application/json" \
  -d '{
    "service": "auth",
    "error": "authentication service down",
    "severity": "critical"
  }'
```

**Expected Flow**: 
- Classify → AI Analysis → Router → **Direct Escalation** (no remediation attempts)
- Logs show: `🚨 CRITICAL: immediate escalation required`

### Scenario 2: High Severity (Auto-Remediation First)
```bash
curl -X POST http://localhost:3000/incident \
  -H "Content-Type: application/json" \
  -d '{
    "service": "api-gateway",
    "error": "connection pool exhausted",
    "severity": "high"
  }'
```

**Expected Flow**:
- Classify → AI Analysis → Router → **Remediation Attempts** (max 3)
- If success: Resolved ✅
- If failure: Escalate to DLQ

### Scenario 3: Medium Severity (Monitor & Log)
```bash
curl -X POST http://localhost:3000/incident \
  -H "Content-Type: application/json" \
  -d '{
    "service": "cache",
    "error": "cache miss rate high",
    "severity": "medium"
  }'
```

## 📁 Project Structure

AutoOps follows Motia's official project structure with automatic step discovery. Motia automatically discovers and registers any file containing `.step.` in the filename from both `steps/` and `src/` directories.

```
autoops/
├── src/
│   ├── steps/                      # All Motia workflow steps (auto-discovered)
│   │   ├── start.api.step.ts       # API endpoint: POST /incident
│   │   ├── classify.event.step.ts  # Severity classification
│   │   ├── ai-analyst.event.step.ts # AI-driven analysis
│   │   ├── router.event.step.ts    # Intelligent routing
│   │   ├── remediate.event.step.ts # Auto-remediation with retries
│   │   ├── escalate.event.step.ts  # Human escalation (DLQ)
│   │   ├── streamer.event.step.ts  # Real-time incident streaming
│   │   ├── websocket-notifier.event.step.ts # WebSocket notifications
│   │   ├── workflow.event.step.ts  # Workflow orchestration
│   │   ├── monitor.event.step.ts   # Incident monitoring
│   │   ├── cleanup.cron.step.ts    # Scheduled cleanup tasks
│   │   └── health.api.step.ts      # Health check endpoint
│   └── types.ts                    # TypeScript type definitions
├── motia.config.ts                 # Core Motia configuration
├── package.json                    # Node.js dependencies
├── tsconfig.json                   # TypeScript configuration
├── motia-workbench.json            # 🤖 Auto-generated: Workbench UI positions
├── types.d.ts                      # 🤖 Auto-generated: Type definitions
├── .env                            # Environment variables
└── README.md                       # This documentation
```

### Step Discovery & Organization

Motia automatically discovers steps using these rules:
- **File Pattern**: Any file with `.step.` in the name (e.g., `start.api.step.ts`)
- **Supported Languages**: TypeScript (`.ts`), JavaScript (`.js`), Python (`.py`)
- **Discovery Directories**: Both `steps/` and `src/` are scanned recursively
- **No Manual Registration**: Just create the file - Motia finds it automatically

### Step Types in AutoOps

| Step Type | File Pattern | Purpose | Example |
|-----------|--------------|---------|---------|
| **API Steps** | `*.api.step.ts` | REST endpoints | `start.api.step.ts` - Incident ingestion |
| **Event Steps** | `*.event.step.ts` | Event handlers | `classify.event.step.ts` - Severity analysis |
| **Cron Steps** | `*.cron.step.ts` | Scheduled tasks | `cleanup.cron.step.ts` - Periodic cleanup |

### Configuration Files

- **`motia.config.ts`**: Core Motia configuration with plugins (endpoint, logs, observability, states, bullmq)
- **`tsconfig.json`**: TypeScript compiler settings for strict type checking
- **`package.json`**: Node.js dependencies and scripts
- **`types.ts`**: Custom TypeScript interfaces for incidents, analysis, etc.

### Auto-Generated Files

- **`types.d.ts`**: Generated by TypeScript for type definitions
- **`motia-workbench.json`**: Managed by Motia for visual node positioning in the Workbench

### Flexible Organization

Motia supports flexible directory structures:
- Use `src/` for main code (as shown above)
- Mix `steps/` and `src/` directories
- Organize by feature, language, or team preference
- Nest steps in subfolders as needed

This structure demonstrates production-ready organization while leveraging Motia's automatic discovery for seamless development.

## 🎯 Key Features

### 1. Event-Driven Architecture
- All components communicate via events
- Decoupled, scalable design
- Easy to add new steps

### 2. Intelligent Analysis
- Heuristic-based AI (no external dependency)
- Recognizes critical error patterns
- Adjusts confidence based on severity

### 3. Automatic Retry Logic
- Up to 3 auto-remediation attempts
- BullMQ-backed job queue
- State persists across process restarts

### 4. DLQ / Human Escalation
- Dead Letter Queue for critical incidents
- Structured escalation data
- Full tracing for audit

### 5. Observability
- Distributed tracing (traceId)
- Structured logging
- Event flow visualization
- Error tracking

## 🔧 How It Works

### Incident Lifecycle

1. **Ingestion** (API Step)
   - Receives POST request with incident data
   - Generates unique incidentId
   - Emits event to subscribers

2. **Classification** (Event Step)
   - Analyzes error message and severity
   - Determines if critical service affected
   - Updates severity if needed

3. **Analysis** (Event Step)
   - Runs heuristic AI logic
   - Evaluates: escalate vs remediate vs monitor
   - Calculates confidence score

4. **Routing** (Event Step)
   - Routes based on AI recommendation
   - Sends to remediation or escalation lane
   - Logs decision with reasoning

5. **Remediation** (Event Step, Retryable)
   - Attempts automatic fix (up to 3 times)
   - Uses file-based attempt tracking
   - Succeeds after 3 attempts (proves pattern)
   - Escalates to DLQ on failure

6. **Escalation** (Event Step)
   - Logs to Dead Letter Queue
   - Sends to human on-call
   - Maintains full incident context

## 🎓 Learning Outcomes

### Motia Primitives Used
- **API Steps**: RESTful endpoint creation
- **Event Steps**: Event-driven subscriptions
- **Background Jobs**: BullMQ retry handling
- **Observability**: Tracing and logging

### Enterprise Patterns Demonstrated
- Event-driven workflow orchestration
- Intelligent routing based on analysis
- Distributed retry with state persistence
- Dead Letter Queue (DLQ) pattern
- Circuit breaker (escalation after N attempts)

### Production Considerations
- Error handling and graceful degradation
- State management across processes
- Observability and debugging
- Performance and scalability

## 📊 Observability

### Logs Include:
```
[TIME] TRACE-ID [LEVEL] STEP-NAME message
├ field1: value1
├ field2: value2
└ field3: value3
```

### Key Fields Logged:
- `incidentId`: Unique incident identifier
- `traceId`: Distributed trace ID
- `severity`: Incident severity level
- `recommendation`: AI's decision
- `confidence`: Decision confidence (0-1)
- `attempts`: Remediation attempt count

## 🚀 Deployment

### Quick Deploy Options

#### 1. **Motia Cloud** (Recommended for Hackathon)
```bash
# Deploy directly to Motia Cloud
npm install -g @motia/cli
motia deploy
```

#### 2. **Local Production**
```bash
# Quick local production deploy
npm run deploy:local
```

#### 3. **Cloud Platforms**

**Railway:**
```bash
npm run deploy:railway
# Then: railway login && railway init && railway up
```

**Render:**
```bash
npm run deploy:render
# Then connect GitHub repo to Render
```

**Fly.io:**
```bash
npm run deploy:fly
# Then: fly launch
```

### Manual Deployment

#### Local Development
```bash
npm run dev
```

#### Production Deployment
```bash
# Build (if needed)
npm run build

# Run in production
NODE_ENV=production npm run start:prod
```

### Environment Variables
- `GOOGLE_AI_API_KEY`: Optional Google Gemini API key for real AI
- `NODE_ENV`: Set to `development` or `production`
- `PORT`: Port number (default: 3000)

### Health Check
Your app includes a health check endpoint:
```bash
curl http://localhost:3000/health
```

## 📝 Configuration

### Environment Variables
- `GOOGLE_AI_API_KEY`: Optional Google Gemini API key for real AI
- `NODE_ENV`: Set to `development` or `production`
- `MOTIA_PORT`: Port number (default: 3000)

### Motia Config (motia.config.ts)
Includes plugins:
- **endpoint**: HTTP API support
- **logs**: Structured logging
- **observability**: Distributed tracing
- **states**: State management
- **bullmq**: Job queue with retries

## 🔮 Future Enhancements

1. **Real AI Integration**: Swap heuristics for Claude/GPT
2. **Slack/PagerDuty Integration**: Send real alerts
3. **Cron Jobs**: Periodic incident reviews
4. **Dashboard**: Incident metrics and visualization
5. **Database**: Store incident history
6. **Multi-language Steps**: Add Python/Go handlers
7. **Advanced Routing**: Machine learning-based routing
8. **Runbooks**: Automated remediation sequences

## 📖 Hackathon Submission

This project demonstrates:
- ✅ Real-world incident management system
- ✅ AI-driven intelligent decision making
- ✅ Event-driven architecture with unified primitives
- ✅ Production-ready error handling
- ✅ Comprehensive observability
- ✅ Enterprise patterns (DLQ, retries, escalation)

**Why This Wins**:
- Solves real SRE/DevOps problem
- Showcases Motia's unified runtime
- Clean, maintainable code
- Runs completely standalone
- No external service dependencies

## 📞 Support

For Motia documentation: https://motia.dev

## 📄 License

ISC

## 🛠️ Using the Motia Workbench

The Motia Workbench provides a powerful visual development environment for testing, debugging, and understanding your AutoOps incident response system.

### Accessing the Workbench

After running `npm run dev`, open `http://localhost:3000` in your browser to access the Workbench.

### Flow View - Visual Architecture

The **Flow View** displays your entire incident response system as an interactive diagram:

- **API Nodes** (green): `start.api.step.ts` - Incident ingestion endpoint
- **Event Nodes** (blue): All processing steps (classification, AI analysis, routing, etc.)
- **Connections**: Show how incidents flow through the system
- **Hover & Click**: Inspect step details and jump to code

This view perfectly demonstrates your unified event-driven architecture.

### Endpoint View - Test APIs Visually

Use the **Endpoint View** to test incident ingestion without curl:

1. Select the `/incident` endpoint from the sidebar
2. Fill in the request body:
   ```json
   {
     "service": "payments",
     "error": "gateway timeout", 
     "severity": "high"
   }
   ```
3. Click **Send** to see real-time processing
4. Watch the response and execution timeline

### Debug Panel - Observability in Action

The bottom debug panel provides three essential views:

#### Tracing - Execution Timeline
- See the complete incident lifecycle: ingestion → classification → analysis → routing → remediation/escalation
- Track execution time for each step
- Visualize the event-driven flow in real-time

#### Logs - Real-Time Monitoring  
- Watch structured logs stream as incidents are processed
- Filter by trace ID to follow a single incident's journey
- See AI decisions, routing logic, and escalation events

#### States - Persistent Data
- Inspect incident state stored across steps
- View AI analysis results and confidence scores
- Monitor remediation attempt counters

### Testing Scenarios in Workbench

**Critical Incident (Immediate Escalation)**:
- Send: `{"service": "auth", "error": "service down", "severity": "critical"}`
- Watch: Direct routing to escalation lane, DLQ entry created

**High Severity (Auto-Remediation)**:
- Send: `{"service": "api-gateway", "error": "connection pool exhausted", "severity": "high"}`  
- Watch: Multiple remediation attempts, eventual resolution or escalation

**Medium Severity (Monitor Only)**:
- Send: `{"service": "cache", "error": "high miss rate", "severity": "medium"}`
- Watch: Classification and logging without escalation

### Hot Reload & Development

- Edit any step file and save - the Workbench reloads automatically
- Test changes instantly without restarting the server
- Perfect for iterative development and debugging

The Workbench transforms your AutoOps system from code into an interactive, visual experience that judges can explore immediately. This demonstrates exceptional Developer Experience and makes your unified Motia architecture crystal clear.

👉 **Pro Tip**: During your hackathon demo, use the Workbench to show live incident processing - it's far more impressive than terminal logs!

## 🔧 Motia Core Concepts

AutoOps is built on Motia's unified backend framework, which provides a single primitive - the **Step** - for building production-grade backends. Motia unifies APIs, background jobs, workflows, AI agents, streaming, and observability around this core concept.

### The Step Primitive
Every component in AutoOps is a Step - a simple file with two parts:

1. **Config**: Defines when and how the Step runs (API endpoint, event subscriber, cron schedule)
2. **Handler**: Contains the business logic and emits events to trigger other Steps

**Example from AutoOps:**
```typescript
// Config - when it runs
export const config: ApiRouteConfig = {
  type: 'api',
  name: 'start-api',
  path: '/incident',
  method: 'POST',
  emits: ['incident.received']
}

// Handler - what it does  
export const handler: Handlers['start-api'] = async (req, { emit, logger }) => {
  const incident = await emit({
    topic: 'incident.received',
    data: req.body
  })
  return { status: 200, body: { incidentId: incident.id } }
}
```

### Event-Driven Architecture
Steps communicate through events, not direct calls:
- **Decoupled**: Steps run independently and can retry on failure
- **Scalable**: Add new Steps without modifying existing ones
- **Traceable**: Every request has a `traceId` for distributed tracing

**AutoOps Event Flow:**
```
API Step → incident.received → Classification Step → incident.classified → AI Analysis Step → ...
```

### Multi-Language Support
Steps can be written in TypeScript, Python, or JavaScript. AutoOps uses TypeScript for all 12 Steps, but the architecture supports mixing languages seamlessly.

### Auto-Discovery
Motia automatically finds Steps by scanning for `.step.` files - no manual registration required. Just create the file and it works.

### Unified Runtime Features Used in AutoOps:
- **State Management**: Persistent storage across Steps (incident analysis results)
- **Observability**: Distributed tracing and structured logging
- **Background Jobs**: BullMQ for retry logic in remediation
- **Real-Time Streaming**: WebSocket notifications for live incident updates
- **Workbench**: Visual development and testing interface

This unified approach allows AutoOps to combine complex workflows (incident triage, AI analysis, remediation, escalation) into a cohesive system using a single, simple primitive.
