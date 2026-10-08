# ATM-OS — Embedded ATM Transaction & Resource Management Simulator

> **An Interactive Embedded Operating System Laboratory for ATM Transaction Management**
>
> *Operating Systems (OSY) MicroProject — Course Outcomes CO1 to CO5 Demonstrated*

---

## 1. Project Concept & Architecture

**ATM-OS** is an embedded operating system laboratory that simulates how an Automated Teller Machine's real-time embedded kernel coordinates hardware devices, executes concurrent card transactions, avoids cash deadlocks, manages limited memory buffers, and maintains immutable transaction logs on disk.

Unlike traditional banking web applications or generic ATM mockups, **ATM-OS exposes the internal OS kernel operations behind every transaction**:

```
CARD SWIPE (Interrupt)
       ↓
PROCESS CREATION (sys_create_process)
       ↓
PCB CREATION (Process Control Block)
       ↓
PROCESS SCHEDULING (Priority / Round Robin)
       ↓
RESOURCE MANAGEMENT (Banker's Algorithm)
       ↓
MEMORY MANAGEMENT (Fixed Partitions & FIFO Replacement)
       ↓
TRANSACTION EXECUTION (Hardware Dispenser)
       ↓
FILE SYSTEM (Indexed File Allocation)
       ↓
TRANSACTION LOG (Audit Trail)
       ↓
MINI STATEMENT (Direct Pointer Retrieval)
       ↓
PROCESS TERMINATION (sys_terminate & cleanup)
```

The user steps into the role of an **ATM KERNEL OPERATOR** in the **ATM OS CONTROL ROOM**, monitoring live CPU dispatch queues, memory partition maps, vault cash reserves, and a millisecond-accurate kernel event stream.

---

## 2. Academic Course Outcomes (CO1 – CO5) Mapping

| CO | Academic Objective | ATM-OS Implementation |
|:---|:---|:---|
| **CO1** | Embedded OS Information & Classification | Classifies ATM as an **Embedded Real-Time Operating System** with hard motor timing deadlines; provides technical matrix of OS services (Process, Memory, File, I/O, Interrupts, Security). |
| **CO2** | Card Swipe = Process & Dynamic PCB | Every card swipe invokes `sys_create_process()`, instantiating a **Process Control Block (PCB)** with PID, Account, PIN status, State, Priority (VIP vs Regular), Burst time, and Hardware bindings. Visualizes 5-state lifecycle (`NEW` → `READY` → `RUNNING` → `WAITING` → `TERMINATED`). |
| **CO3** | CPU Scheduling & Cash Resource Allocation | Implements **Priority Scheduling** (VIP transactions preempt/order ahead of regular transactions) and **Multi-Lane Round Robin** across 3 ATM terminals with configurable time quantum `q`. Implements **Banker's Algorithm** for ₹500, ₹200, and ₹100 note allocation to prevent cash deadlocks. |
| **CO4** | Memory Buffers & FIFO Page Replacement | Divides 256 KB transaction RAM into **four 64 KB fixed partitions** (M1–M4). Simulates **FIFO Page Replacement** across 3 frames, calculating Page Hits, Page Faults, Replacements, and tracking the oldest resident victim page. |
| **CO5** | Transaction File System & Mini Statement | Maintains an immutable audit log and simulates **Indexed File Allocation**. Maps Account Inodes → Index Block (`I-07`) → Direct Data Blocks (`B12, B19, B27, B31`) across a 64-sector disk. Enables **Mini Statement** retrieval tracing pointers directly to records. |

---

## 3. Technology Stack & Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ 1. PRESENTATION LAYER                                       │
│ React.js 19 + TypeScript + Tailwind CSS v4 + Lucide React   │
│ Restrained Swiss / Editorial OS Console Aesthetic           │
└──────────────────────────────┬──────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. EMBEDDED SIMULATION & APPLICATION LAYER                  │
│ Pure TypeScript Algorithm Engines:                          │
│ • Priority & Round Robin CPU Schedulers (scheduler.ts)      │
│ • Banker's Algorithm Safety & Request Checker (bankers.ts)  │
│ • FIFO Page Replacement Buffer Engine (fifo.ts)             │
│ • Indexed File Allocation & Disk Mapping (indexedFile.ts)   │
│ • 10-Step Deterministic Lifecycle Engine (useATMStore.ts)   │
└──────────────────────────────┬──────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. PERSISTENCE LAYER                                        │
│ Express.js REST API + SQLite (better-sqlite3) WAL Mode      │
│ Persists Accounts, Transactions, Logs, and Operator State   │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Key Laboratory Features

### A. The 10-Step Deterministic Simulation Engine (Viva Demonstrator)
Section 27 specifies a dedicated `STEP` controller. Each click advances **exactly one logical OS operation**:
1. `CARD INSERTED`: Card reader interrupt fires.
2. `PROCESS CREATED`: Kernel process table slot allocated with unique PID.
3. `PCB INITIALIZED`: Authentication, priority, and resource bounds populated.
4. `PROCESS READY`: Process enqueued in ready queue.
5. `CPU DISPATCH`: Dispatcher switches context to execute process on CPU.
6. `RESOURCE CHECK`: Banker's algorithm verifies cash availability and safe sequence.
7. `MEMORY ALLOCATION`: 64 KB partition allocated (FIFO evicts oldest page if buffer full).
8. `TRANSACTION EXECUTION`: Note dispenser solenoids triggered; cash presented to shutter.
9. `LOG CREATION`: Immutable record committed; Index block updated with data block pointer.
10. `PROCESS TERMINATED`: Memory and locks released; PCB marked terminated.

### B. Banker's Algorithm Cash Resource Manager
- **Currencies**: ₹500, ₹200, ₹100 notes.
- **Data Structures**:
  - `Available Vector`: Available notes in the ATM vault.
  - `Allocation Matrix`: Currently dispensed or reserved notes.
  - `Maximum Matrix`: Declared maximum claim.
  - `Need Matrix`: $Need[i][j] = Max[i][j] - Allocation[i][j]$.
- **Safety Algorithm**: Evaluates $Need \le Work$ to construct safe sequence ($P004 \to P001 \to P003 \to P002$).
- **Request Evaluator**: Simulates live requests (`APPROVED` if safe, `BLOCKED` if unsafe).

### C. Multi-Lane ATM Round Robin
- Models 3 physical ATM lanes competing for the shared CPU.
- Configurable Time Quantum `q` (e.g. 3 ms).
- Dynamic Gantt chart with millisecond markers, context switch counter, average waiting time (AWT), and average turnaround time (ATAT).

### D. FIFO Buffer Replacement
- 3 physical frame slots.
- Live reference string tracker.
- Queue pointer identifying `NEXT VICTIM` (oldest resident page).
- Calculates real-time Hit Ratio (%) and Fault Ratio (%).

### E. Indexed File Allocation & Mini Statement
- Visualizes 64 physical disk sectors (System, Inode Index, Data, and Free).
- Resolves: `Account Inode → Index Block (I-07) → [B12, B19, B27, B31] → Mini Statement Thermal Receipt`.
- Browser printing and JSON export support.

### F. Kernel Ops (Gamification Layer)
- **7 Operator Levels**: From *Level 1: Transaction Operator* to *Level 7: ATM Kernel Engineer*.
- **Operator Score (XP)**: Earned through verified OS decisions.
- **7 Operations Missions**: CO1 through CO5 aligned challenges.
- **Interactive Decision Points**: Scenario-based questions with instant algorithmic feedback.
- **Subsystem Health Gauges**: Composite % score assessing Process, CPU, Resource, Memory, and File integrity.
- **Final Operator Report**: Printable summary certificate of mastered algorithms and accuracy.

---

## 5. Design System

- **Color Palette**:
  - Primary Background: `#F9F8F6` (Utilitarian warm paper)
  - Panel Backgrounds: `#FFFFFF` and `#F4F2EB`
  - Borders: `#E2E0D8` (1px clean technical dividers)
  - Primary Text: `#141413`
  - Secondary Text: `#6F6D67`
- **Typography**:
  - Primary UI: **IBM Plex Sans**
  - Technical / Logs / Metrics: **JetBrains Mono**
  - Headings / Editorial: **Newsreader**
- **Geometry**: Strict 8px grid, 4px border radius, dense engineering controls, zero neon or emojis.

---

## 6. How to Run

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Execution

1. Clone or navigate to the project directory:
   ```bash
   cd "OSY MicroProject"
   ```

2. Run both the backend server and frontend client concurrently:
   ```bash
   npm run dev
   ```

3. Open your browser:
   - **Frontend UI**: [http://localhost:3000](http://localhost:3000)
   - **Express Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Running Individual Services
- **Backend only**:
  ```bash
  npm run server
  ```
- **Frontend only**:
  ```bash
  npm run client
  ```
- **Build production frontend**:
  ```bash
  npm run build
  ```

---

## 7. Predefined Demonstration Scenarios

Use the **SCENARIO** dropdown in the header to jump to any benchmark:
- **Scenario 1**: Normal Transactions (P001 Withdrawal, P002 Deposit, P003 Balance).
- **Scenario 2**: VIP Priority Scheduling (VIP transactions execute ahead of regular queue).
- **Scenario 3**: Multi-Lane Round Robin (3 ATM lanes sharing CPU with 3 ms slices).
- **Scenario 4**: Cash Contention (Low cash reserves triggering Banker's deadlock prevention).
- **Scenario 5**: Full Buffer Memory (4/4 partitions full; next reference triggers FIFO eviction).
- **Scenario 6**: Mini Statement Retrieval (Traverses Index Block I-07 to build audit receipt).
