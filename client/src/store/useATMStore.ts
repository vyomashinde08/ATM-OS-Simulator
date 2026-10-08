import { create } from 'zustand';
import {
  PCB,
  KernelEvent,
  MemoryPartition,
  FIFOState,
  CurrencyNotes,
  BankerState,
  SchedulerMetrics,
  Mission,
  ChallengeDecision,
  Achievement,
  TransactionRecord,
  AccountData,
} from '../types';
import { runPriorityScheduling, runRoundRobinScheduling } from '../algorithms/scheduler';
import { calculateNeed, checkSafety, evaluateResourceRequest } from '../algorithms/bankers';
import { initializeFIFO, processFIFOStep, calculateFIFORatios } from '../algorithms/fifo';

// Initial pre-seeded accounts
export const INITIAL_ACCOUNTS: AccountData[] = [
  { account_no: '****4821', holder_name: 'Rohan Sharma (Executive)', pin: '1234', balance: 45000, card_type: 'VIP' },
  { account_no: '****1934', holder_name: 'Ananya Desai', pin: '4321', balance: 18500, card_type: 'REGULAR' },
  { account_no: '****7712', holder_name: 'Vikram Joshi (Corporate)', pin: '9876', balance: 82000, card_type: 'VIP' },
  { account_no: '****5520', holder_name: 'Pooja Mehta', pin: '2468', balance: 12300, card_type: 'REGULAR' },
  { account_no: '****3389', holder_name: 'Aditya Verma', pin: '1122', balance: 29800, card_type: 'REGULAR' },
];

// Initial seeded processes
const INITIAL_PROCESSES: PCB[] = [
  {
    pid: 'P001',
    accountNo: '****1934',
    holderName: 'Ananya Desai',
    pin: '4321',
    pinStatus: 'VERIFIED',
    state: 'READY',
    priority: 'REGULAR',
    transactionType: 'WITHDRAWAL',
    amount: 1500,
    arrivalTime: '10:41:00',
    burstTime: 5,
    remainingBurst: 5,
    waitingTime: 2,
    turnaroundTime: 7,
    completionTime: null,
    memoryPartition: 'M1',
    resource: 'CASH DISPENSER',
    requestedNotes: { c500: 2, c200: 2, c100: 1 },
    allocatedNotes: { c500: 2, c200: 2, c100: 1 },
    maxNotes: { c500: 4, c200: 4, c100: 2 },
    dataBlock: 'B19',
  },
  {
    pid: 'P002',
    accountNo: '****7712',
    holderName: 'Vikram Joshi (Corporate)',
    pin: '9876',
    pinStatus: 'VERIFIED',
    state: 'RUNNING',
    priority: 'VIP',
    transactionType: 'DEPOSIT',
    amount: 2000,
    arrivalTime: '10:41:15',
    burstTime: 3,
    remainingBurst: 2,
    waitingTime: 0,
    turnaroundTime: 3,
    completionTime: null,
    memoryPartition: 'M3',
    resource: 'VAULT SENSOR',
    requestedNotes: { c500: 0, c200: 0, c100: 0 },
    allocatedNotes: { c500: 0, c200: 0, c100: 0 },
    maxNotes: { c500: 0, c200: 0, c100: 0 },
    dataBlock: 'B27',
  },
  {
    pid: 'P003',
    accountNo: '****5520',
    holderName: 'Pooja Mehta',
    pin: '2468',
    pinStatus: 'VERIFIED',
    state: 'WAITING',
    priority: 'REGULAR',
    transactionType: 'BALANCE',
    amount: 0,
    arrivalTime: '10:41:30',
    burstTime: 2,
    remainingBurst: 2,
    waitingTime: 4,
    turnaroundTime: 6,
    completionTime: null,
    memoryPartition: 'UNALLOCATED',
    resource: 'CARD READER',
    requestedNotes: { c500: 0, c200: 0, c100: 0 },
    allocatedNotes: { c500: 0, c200: 0, c100: 0 },
    maxNotes: { c500: 0, c200: 0, c100: 0 },
    dataBlock: 'B12',
  },
  {
    pid: 'P004',
    accountNo: '****4821',
    holderName: 'Rohan Sharma (Executive)',
    pin: '1234',
    pinStatus: 'VERIFIED',
    state: 'READY',
    priority: 'VIP',
    transactionType: 'WITHDRAWAL',
    amount: 5000,
    arrivalTime: '10:42:18',
    burstTime: 4,
    remainingBurst: 4,
    waitingTime: 2,
    turnaroundTime: 6,
    completionTime: '10:42:24',
    memoryPartition: 'M2',
    resource: 'CASH DISPENSER',
    requestedNotes: { c500: 6, c200: 5, c100: 10 },
    allocatedNotes: { c500: 4, c200: 2, c100: 0 },
    maxNotes: { c500: 8, c200: 6, c100: 12 },
    dataBlock: 'B31',
  },
];

// Initial seeded Memory Partitions
const INITIAL_MEMORY: MemoryPartition[] = [
  { id: 'M1', sizeKb: 64, occupiedByPid: 'P001', lastAccessed: 1 },
  { id: 'M2', sizeKb: 64, occupiedByPid: 'P004', lastAccessed: 4 },
  { id: 'M3', sizeKb: 64, occupiedByPid: 'P002', lastAccessed: 2 },
  { id: 'M4', sizeKb: 64, occupiedByPid: null, lastAccessed: 0 },
];

// Missions
const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'M01',
    title: 'FIRST CARD SWIPE',
    objective: 'Create the first ATM transaction and inspect generated PCB.',
    rewardXp: 50,
    completed: true,
    co: 'CO2',
    hint: 'Use the Transactions tab to insert a card and configure transaction details.',
  },
  {
    id: 'M02',
    title: 'PRIORITY CONTROL',
    objective: 'Four transactions waiting (2 VIP, 2 Regular). Execute Priority Scheduling correctly.',
    rewardXp: 100,
    completed: true,
    co: 'CO3',
    hint: 'VIP transactions must execute ahead of regular transactions.',
  },
  {
    id: 'M03',
    title: 'ROUND ROBIN LANES',
    objective: 'Three ATM lanes active. Run Round Robin with a 3 ms quantum and inspect context switches.',
    rewardXp: 100,
    completed: true,
    co: 'CO3',
    hint: 'Observe the context switch events when time slice expires.',
  },
  {
    id: 'M04',
    title: 'CASH DEADLOCK AVOIDANCE',
    objective: 'Multiple transactions requesting cash. Run Banker Algorithm to verify state safety.',
    rewardXp: 150,
    completed: false,
    co: 'CO3',
    hint: 'Check Need <= Available Work vector to produce safe sequence.',
  },
  {
    id: 'M05',
    title: 'FULL MEMORY BUFFER',
    objective: 'Transaction buffer is full. Perform FIFO page replacement to evict the oldest resident page.',
    rewardXp: 100,
    completed: false,
    co: 'CO4',
    hint: 'FIFO evicts the page that entered the partition buffer earliest.',
  },
  {
    id: 'M06',
    title: 'LOST TRANSACTION AUDIT',
    objective: 'Retrieve account mini-statement through indexed file allocation pointers.',
    rewardXp: 100,
    completed: false,
    co: 'CO5',
    hint: 'Inspect how Index Block I-07 resolves direct pointers to B12, B19, B27, and B31.',
  },
  {
    id: 'M07',
    title: 'ATM KERNEL MASTER TEST',
    objective: 'Complete full end-to-end lifecycle test spanning CO1 through CO5 with zero deadlocks.',
    rewardXp: 500,
    completed: false,
    co: 'CO1',
    hint: 'Run Complete Transaction button or complete all sub-missions.',
  },
];

// Achievements
const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'FIRST_PROCESS', title: 'FIRST PROCESS', description: 'Created the first ATM card process.', xp: 50, unlocked: true, icon: 'CreditCard' },
  { id: 'PCB_INITIALIZED', title: 'PCB INITIALIZED', description: 'Created a Process Control Block.', xp: 50, unlocked: true, icon: 'Cpu' },
  { id: 'PRIORITY_CONTROLLER', title: 'PRIORITY CONTROLLER', description: 'Completed Priority Scheduling.', xp: 100, unlocked: true, icon: 'Activity' },
  { id: 'FAIR_CPU', title: 'FAIR CPU', description: 'Completed Round Robin across ATM lanes.', xp: 100, unlocked: true, icon: 'Clock' },
  { id: 'SAFE_STATE', title: 'SAFE STATE', description: 'Successfully handled Banker resource allocation.', xp: 100, unlocked: false, icon: 'Shield' },
  { id: 'MEMORY_GUARDIAN', title: 'MEMORY GUARDIAN', description: 'Completed FIFO page replacement.', xp: 100, unlocked: false, icon: 'HardDrive' },
  { id: 'INDEX_MASTER', title: 'INDEX MASTER', description: 'Retrieved transactions using indexed allocation.', xp: 100, unlocked: false, icon: 'Database' },
  { id: 'ZERO_DEADLOCK', title: 'ZERO DEADLOCK', description: 'Completed resource challenges without entering unsafe state.', xp: 150, unlocked: false, icon: 'Lock' },
  { id: 'KERNEL_ENGINEER', title: 'KERNEL ENGINEER', description: 'Completed the entire ATM OS lifecycle.', xp: 200, unlocked: false, icon: 'Server' },
];

export interface ATMStore {
  // Navigation
  activeSection: string;
  setActiveSection: (section: string) => void;

  // System Metrics
  cpuUtilization: number;
  memoryUtilization: number;
  activeProcessCount: number;
  waitingCount: number;
  completedCount: number;
  pageFaultCount: number;

  // Process Manager
  processes: PCB[];
  selectedPid: string;
  setSelectedPid: (pid: string) => void;
  nextPidCounter: number;
  createProcessFromSwipe: (data: {
    accountNo: string;
    pin: string;
    transactionType: 'WITHDRAWAL' | 'DEPOSIT' | 'BALANCE' | 'MINI_STATEMENT';
    amount: number;
    priority: 'VIP' | 'REGULAR';
  }) => PCB;

  // CPU Scheduler
  schedulerAlgorithm: 'PRIORITY' | 'ROUND_ROBIN';
  timeQuantum: number;
  setSchedulerAlgorithm: (algo: 'PRIORITY' | 'ROUND_ROBIN') => void;
  setTimeQuantum: (q: number) => void;
  getSchedulerMetrics: () => SchedulerMetrics;

  // Resource Manager (Banker's Algorithm)
  cashAvailable: CurrencyNotes;
  bankerState: BankerState;
  recomputeBankerState: () => void;
  requestCashForProcess: (pid: string, request: CurrencyNotes) => { approved: boolean; reason: string };

  // Memory Manager & FIFO
  memoryPartitions: MemoryPartition[];
  fifoState: FIFOState;
  referencePage: (pid: string) => { isHit: boolean; victim: string | null; explanation: string };
  resetFIFO: () => void;

  // File System & Indexed Allocation
  indexedAllocations: Record<string, { indexBlock: string; dataBlocks: string[] }>;
  transactionLogs: TransactionRecord[];
  recordCompletedTransaction: (pid: string) => Promise<TransactionRecord | null>;
  lookupMiniStatement: (accountNo: string) => Promise<any>;

  // Kernel Event Stream
  events: KernelEvent[];
  addKernelEvent: (
    type: KernelEvent['type'],
    pid: string,
    details: string,
    status?: KernelEvent['status']
  ) => void;
  clearEvents: () => void;

  // Simulation Controls & Stepping Engine
  isRunning: boolean;
  isPaused: boolean;
  simulationSpeed: number; // in ms
  simulationMode: 'FREE' | 'CHALLENGE';
  currentStepIndex: number;
  lifecyclePid: string | null;
  whatIsHappening: { title: string; explanation: string };
  setSimulationSpeed: (speed: number) => void;
  setSimulationMode: (mode: 'FREE' | 'CHALLENGE') => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  stepSimulation: () => void;
  resetSimulation: () => void;
  runCompleteTransactionLifecycle: () => void;

  // Gamification (Kernel Ops)
  operatorScore: number;
  operatorLevel: number;
  operatorLevelTitle: string;
  systemHealth: number;
  accuracy: number;
  efficiency: number;
  errors: number;
  missions: Mission[];
  achievements: Achievement[];
  activeChallenge: ChallengeDecision | null;
  awardXp: (amount: number, reason?: string) => void;
  unlockAchievement: (id: string) => void;
  completeMission: (id: string) => void;
  setActiveChallenge: (challenge: ChallengeDecision | null) => void;
  submitChallengeAnswer: (optionId: string) => { isCorrect: boolean; explanation: string };

  // Predefined Scenarios
  loadScenario: (scenarioIndex: number) => void;
}

export const useATMStore = create<ATMStore>((set, get) => {
  // Initial Banker calculation
  const initialAvailable: CurrencyNotes = { c500: 20, c200: 15, c100: 30 }; // ₹18,400 total
  const initialMax: Record<string, CurrencyNotes> = {};
  const initialAlloc: Record<string, CurrencyNotes> = {};

  INITIAL_PROCESSES.forEach((p) => {
    initialMax[p.pid] = { ...p.maxNotes };
    initialAlloc[p.pid] = { ...p.allocatedNotes };
  });

  const initialNeed = calculateNeed(initialMax, initialAlloc);
  const initialSafety = checkSafety(initialAvailable, initialAlloc, initialNeed);

  return {
    // Navigation
    activeSection: 'ATM Control Room',
    setActiveSection: (section) => set({ activeSection: section }),

    // Metrics
    cpuUtilization: 42,
    memoryUtilization: 68,
    activeProcessCount: 4,
    waitingCount: 2,
    completedCount: 17,
    pageFaultCount: 6,

    // Processes
    processes: INITIAL_PROCESSES,
    selectedPid: 'P004',
    setSelectedPid: (pid) => set({ selectedPid: pid }),
    nextPidCounter: 5,

    createProcessFromSwipe: ({ accountNo, pin, transactionType, amount, priority }) => {
      const state = get();
      const nextId = `P${String(state.nextPidCounter).padStart(3, '0')}`;
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      // Notes requirement based on amount
      const req500 = Math.floor(amount / 500);
      const rem = amount % 500;
      const req200 = Math.floor(rem / 200);
      const req100 = Math.floor((rem % 200) / 100);

      const requestedNotes = { c500: req500, c200: req200, c100: req100 };
      const maxNotes = { c500: req500 + 2, c200: req200 + 2, c100: req100 + 2 };

      const matchedAccount = INITIAL_ACCOUNTS.find((a) => a.account_no === accountNo);
      const isPinValid = matchedAccount ? matchedAccount.pin === pin : true;

      const newPCB: PCB = {
        pid: nextId,
        accountNo,
        holderName: matchedAccount ? matchedAccount.holder_name : 'Valued Cardholder',
        pin,
        pinStatus: isPinValid ? 'VERIFIED' : 'INVALID',
        state: 'NEW',
        priority,
        transactionType,
        amount,
        arrivalTime: timeStr,
        burstTime: Math.floor(Math.random() * 3 + 3), // 3 to 5 ms
        remainingBurst: Math.floor(Math.random() * 3 + 3),
        waitingTime: 0,
        turnaroundTime: 0,
        completionTime: null,
        memoryPartition: 'UNALLOCATED',
        resource: transactionType === 'WITHDRAWAL' ? 'CASH DISPENSER' : transactionType === 'DEPOSIT' ? 'VAULT SENSOR' : 'CARD READER',
        requestedNotes,
        allocatedNotes: { c500: 0, c200: 0, c100: 0 },
        maxNotes,
        dataBlock: `B${Math.floor(Math.random() * 40 + 10)}`,
      };

      const updatedProcesses = [newPCB, ...state.processes];

      set({
        processes: updatedProcesses,
        nextPidCounter: state.nextPidCounter + 1,
        selectedPid: nextId,
        activeProcessCount: updatedProcesses.filter((p) => p.state !== 'TERMINATED').length,
      });

      get().addKernelEvent('CARD_INSERTED', nextId, `Card inserted for account ${accountNo}`, 'INFO');
      get().addKernelEvent('PROCESS_CREATED', nextId, `Process created with PID ${nextId}`, 'INFO');
      get().addKernelEvent('PCB_INITIALIZED', nextId, `PCB initialized (Priority: ${priority}, Type: ${transactionType})`, 'INFO');

      get().awardXp(10, 'Created valid ATM transaction');
      get().awardXp(10, 'Initialized Process Control Block');
      get().unlockAchievement('FIRST_PROCESS');
      get().unlockAchievement('PCB_INITIALIZED');

      return newPCB;
    },

    // CPU Scheduler
    schedulerAlgorithm: 'PRIORITY',
    timeQuantum: 3,
    setSchedulerAlgorithm: (algo) => {
      set({ schedulerAlgorithm: algo });
      get().addKernelEvent('SYSTEM_ALERT', 'SCHEDULER', `Active scheduling policy switched to ${algo}`, 'INFO');
    },
    setTimeQuantum: (q) => set({ timeQuantum: Math.max(1, q) }),
    getSchedulerMetrics: () => {
      const state = get();
      const readyProcesses = state.processes.filter((p) => p.state !== 'TERMINATED');
      if (state.schedulerAlgorithm === 'PRIORITY') {
        return runPriorityScheduling(readyProcesses);
      } else {
        return runRoundRobinScheduling(readyProcesses, state.timeQuantum);
      }
    },

    // Resource Manager
    cashAvailable: initialAvailable,
    bankerState: {
      available: initialAvailable,
      max: initialMax,
      allocation: initialAlloc,
      need: initialNeed,
      safeSequence: initialSafety.safeSequence,
      isSafe: initialSafety.isSafe,
      lastEvaluation: initialSafety.explanation,
    },
    recomputeBankerState: () => {
      const state = get();
      const max: Record<string, CurrencyNotes> = {};
      const alloc: Record<string, CurrencyNotes> = {};

      state.processes
        .filter((p) => p.state !== 'TERMINATED')
        .forEach((p) => {
          max[p.pid] = { ...p.maxNotes };
          alloc[p.pid] = { ...p.allocatedNotes };
        });

      const need = calculateNeed(max, alloc);
      const safety = checkSafety(state.cashAvailable, alloc, need);

      set({
        bankerState: {
          available: state.cashAvailable,
          max,
          allocation: alloc,
          need,
          safeSequence: safety.safeSequence,
          isSafe: safety.isSafe,
          lastEvaluation: safety.explanation,
        },
      });
    },

    requestCashForProcess: (pid, request) => {
      const state = get();
      const result = evaluateResourceRequest(
        pid,
        request,
        state.bankerState.available,
        state.bankerState.allocation,
        state.bankerState.need
      );

      if (result.approved) {
        set({
          cashAvailable: result.updatedAvailable,
          bankerState: {
            ...state.bankerState,
            available: result.updatedAvailable,
            allocation: result.updatedAllocation,
            need: result.updatedNeed,
            safeSequence: result.simulatedSafety.safeSequence,
            isSafe: true,
            lastEvaluation: result.reason,
          },
        });
        get().addKernelEvent('BANKER_CHECK', pid, 'BANKER_CHECK SAFE: Request approved', 'SAFE');
        get().awardXp(40, 'Safe Banker allocation handled');
        get().unlockAchievement('SAFE_STATE');
      } else {
        get().addKernelEvent('BANKER_CHECK', pid, `BANKER_CHECK BLOCKED: ${result.reason}`, 'DANGER');
      }

      return { approved: result.approved, reason: result.reason };
    },

    // Memory & FIFO
    memoryPartitions: INITIAL_MEMORY,
    fifoState: {
      ...initializeFIFO(3),
      frames: ['P001', 'P004', 'P002'],
      victimQueue: ['P001', 'P004', 'P002'],
      referenceString: ['P001', 'P002', 'P003', 'P004'],
      pageHits: 2,
      pageFaults: 6,
      replacements: 1,
      lastVictim: 'P001',
      lastAction: 'FAULT',
    },
    referencePage: (pid) => {
      const state = get();
      const { updatedState, stepResult } = processFIFOStep(state.fifoState, pid);

      // Also update memory partitions representation
      const updatedPartitions = [...state.memoryPartitions];
      const emptySlot = updatedPartitions.findIndex((p) => p.occupiedByPid === null);

      if (stepResult.isHit) {
        get().addKernelEvent('PAGE_HIT', pid, `Page hit: ${pid} resident in buffer`, 'SAFE');
      } else {
        get().addKernelEvent('PAGE_FAULT', pid, stepResult.explanation, stepResult.victim ? 'WARN' : 'INFO');
        set({ pageFaultCount: state.pageFaultCount + 1 });

        if (stepResult.victim) {
          // Replace victim partition
          const victimIndex = updatedPartitions.findIndex((p) => p.occupiedByPid === stepResult.victim);
          if (victimIndex !== -1) {
            updatedPartitions[victimIndex].occupiedByPid = pid;
          }
          get().awardXp(30, 'Correct FIFO eviction performed');
          get().unlockAchievement('MEMORY_GUARDIAN');
        } else if (emptySlot !== -1) {
          updatedPartitions[emptySlot].occupiedByPid = pid;
        }
      }

      set({
        fifoState: updatedState,
        memoryPartitions: updatedPartitions,
        memoryUtilization: Math.min(100, Math.round((updatedState.frames.filter(Boolean).length / 4) * 100)),
      });

      return {
        isHit: stepResult.isHit,
        victim: stepResult.victim,
        explanation: stepResult.explanation,
      };
    },
    resetFIFO: () => {
      set({
        fifoState: initializeFIFO(3),
        pageFaultCount: 0,
      });
    },

    // File System & Indexed Allocation
    indexedAllocations: {
      '****4821': { indexBlock: 'I-07', dataBlocks: ['B12', 'B19', 'B27', 'B31'] },
      '****1934': { indexBlock: 'I-03', dataBlocks: ['B14', 'B22'] },
      '****7712': { indexBlock: 'I-09', dataBlocks: ['B08', 'B35', 'B44'] },
    },
    transactionLogs: [
      {
        txn_id: 'TXN-00041',
        pid: 'P004',
        account_no: '****4821',
        type: 'WITHDRAWAL',
        amount: 5000,
        status: 'SUCCESS',
        timestamp: '08 OCT 10:43:12',
        index_block: 'I-07',
        data_block: 'B31',
      },
      {
        txn_id: 'TXN-00040',
        pid: 'P002',
        account_no: '****4821',
        type: 'DEPOSIT',
        amount: 2000,
        status: 'SUCCESS',
        timestamp: '08 OCT 09:10:45',
        index_block: 'I-07',
        data_block: 'B27',
      },
      {
        txn_id: 'TXN-00039',
        pid: 'P001',
        account_no: '****4821',
        type: 'WITHDRAWAL',
        amount: 1500,
        status: 'SUCCESS',
        timestamp: '07 OCT 11:22:04',
        index_block: 'I-07',
        data_block: 'B19',
      },
      {
        txn_id: 'TXN-00038',
        pid: 'P000',
        account_no: '****4821',
        type: 'BALANCE',
        amount: 0,
        status: 'SUCCESS',
        timestamp: '06 OCT 14:15:20',
        index_block: 'I-07',
        data_block: 'B12',
      },
    ],

    recordCompletedTransaction: async (pid) => {
      const state = get();
      const process = state.processes.find((p) => p.pid === pid);
      if (!process) return null;

      const newTxnId = `TXN-${String(state.transactionLogs.length + 42).padStart(5, '0')}`;
      const now = new Date();
      const timeStr = `${String(now.getDate()).padStart(2, '0')} OCT ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      const assignedDataBlock = process.dataBlock || `B${Math.floor(Math.random() * 40 + 10)}`;

      // Update indexed allocations
      const accountAlloc = state.indexedAllocations[process.accountNo] || {
        indexBlock: `I-${Math.floor(Math.random() * 15 + 1).toString().padStart(2, '0')}`,
        dataBlocks: [],
      };

      const updatedDataBlocks = [...accountAlloc.dataBlocks, assignedDataBlock];
      const updatedAllocations = {
        ...state.indexedAllocations,
        [process.accountNo]: {
          indexBlock: accountAlloc.indexBlock,
          dataBlocks: updatedDataBlocks,
        },
      };

      const newRecord: TransactionRecord = {
        txn_id: newTxnId,
        pid,
        account_no: process.accountNo,
        type: process.transactionType,
        amount: process.amount,
        status: 'SUCCESS',
        timestamp: timeStr,
        index_block: accountAlloc.indexBlock,
        data_block: assignedDataBlock,
      };

      set({
        indexedAllocations: updatedAllocations,
        transactionLogs: [newRecord, ...state.transactionLogs],
        completedCount: state.completedCount + 1,
      });

      // Try persisting to Express backend
      try {
        await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pid,
            account_no: process.accountNo,
            type: process.transactionType,
            amount: process.amount,
            status: 'SUCCESS',
            log_details: `Dispensed cash/updated balance. Allocated block ${assignedDataBlock}.`,
          }),
        });
      } catch (e) {
        // Fallback to local state if server offline
      }

      get().addKernelEvent('LOG_CREATED', pid, `LOG_CREATED ${newTxnId} [${assignedDataBlock}]`, 'SUCCESS');
      get().awardXp(30, 'Transaction logged and indexed');
      get().unlockAchievement('INDEX_MASTER');

      return newRecord;
    },

    lookupMiniStatement: async (accountNo) => {
      const state = get();
      // First attempt backend fetch
      try {
        const res = await fetch(`/api/accounts/${encodeURIComponent(accountNo)}/mini-statement`);
        if (res.ok) {
          const data = await res.json();
          get().awardXp(30, 'Mini statement retrieved using indexed allocation');
          return data;
        }
      } catch (err) {
        // Fallback to client state
      }

      const account = INITIAL_ACCOUNTS.find((a) => a.account_no === accountNo) || {
        account_no: accountNo,
        holder_name: 'Customer Account',
        pin: '****',
        balance: 25000,
        card_type: 'REGULAR',
      };

      const alloc = state.indexedAllocations[accountNo] || {
        indexBlock: 'I-07',
        dataBlocks: ['B12', 'B19', 'B27', 'B31'],
      };

      const txns = state.transactionLogs.filter((t) => t.account_no === accountNo);

      get().awardXp(30, 'Mini statement retrieved using indexed allocation');
      return {
        success: true,
        account,
        index_block: alloc.indexBlock,
        data_blocks: alloc.dataBlocks,
        transactions: txns,
        lookup_path: {
          root: 'ACCOUNT_INDEX_DIRECTORY',
          account: accountNo,
          index_pointer: alloc.indexBlock,
          allocated_data_blocks: alloc.dataBlocks,
          retrieved_records: txns.length,
        },
      };
    },

    // Kernel Event Stream
    events: [
      { id: 'ev-1', timestamp: '10:42:01', type: 'CARD_INSERTED', pid: 'P004', details: 'Card inserted for ****4821', status: 'INFO' },
      { id: 'ev-2', timestamp: '10:42:02', type: 'PROCESS_CREATED', pid: 'P004', details: 'Process created (Priority: VIP)', status: 'INFO' },
      { id: 'ev-3', timestamp: '10:42:02', type: 'PCB_INITIALIZED', pid: 'P004', details: 'PCB fields initialized and verified', status: 'INFO' },
      { id: 'ev-4', timestamp: '10:42:03', type: 'PROCESS_READY', pid: 'P004', details: 'P004 moved to READY queue', status: 'INFO' },
      { id: 'ev-5', timestamp: '10:42:04', type: 'CPU_DISPATCH', pid: 'P004', details: 'Priority scheduler dispatched P004 to CPU', status: 'SAFE' },
      { id: 'ev-6', timestamp: '10:42:05', type: 'RESOURCE_REQUEST', pid: 'P004', details: 'Request: ₹500×4, ₹200×2 from cash dispenser', status: 'INFO' },
      { id: 'ev-7', timestamp: '10:42:05', type: 'BANKER_CHECK', pid: 'P004', details: 'BANKER_CHECK SAFE: Safe sequence P004→P001→P003→P002', status: 'SAFE' },
      { id: 'ev-8', timestamp: '10:42:06', type: 'MEMORY_ALLOCATED', pid: 'P004', details: 'Allocated partition M2 (64 KB)', status: 'INFO' },
      { id: 'ev-9', timestamp: '10:42:07', type: 'TRANSACTION_EXECUTED', pid: 'P004', details: 'Cash dispensed: ₹5,000', status: 'SUCCESS' },
      { id: 'ev-10', timestamp: '10:42:08', type: 'LOG_CREATED', pid: 'P004', details: 'Indexed block I-07 pointed to data block B31', status: 'INFO' },
      { id: 'ev-11', timestamp: '10:42:08', type: 'PROCESS_TERMINATED', pid: 'P004', details: 'P004 terminated. Memory M2 released.', status: 'SUCCESS' },
    ],
    addKernelEvent: (type, pid, details, status = 'INFO') => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0')}`;
      const newEvent: KernelEvent = {
        id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: timeStr,
        type,
        pid,
        details,
        status,
      };
      set((state) => ({
        events: [newEvent, ...state.events.slice(0, 99)], // keep last 100
      }));
    },
    clearEvents: () => set({ events: [] }),

    // Simulation Controls & Stepping Engine
    isRunning: false,
    isPaused: false,
    simulationSpeed: 800,
    simulationMode: 'FREE',
    currentStepIndex: 0,
    lifecyclePid: 'P004',
    whatIsHappening: {
      title: 'ATM-OS KERNEL RUNNING',
      explanation: 'System online. Real-time embedded scheduler handling transaction lifecycle.',
    },
    setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
    setSimulationMode: (mode) => set({ simulationMode: mode }),
    startSimulation: () => set({ isRunning: true, isPaused: false }),
    pauseSimulation: () => set({ isRunning: false, isPaused: true }),

    // STEP SIMULATION (Advances exactly one logical OS event)
    stepSimulation: () => {
      const state = get();
      const currentStep = state.currentStepIndex;
      const targetPid = state.lifecyclePid || state.selectedPid || 'P004';
      const targetProcess = state.processes.find((p) => p.pid === targetPid) || state.processes[0];

      if (!targetProcess) return;

      const nextStep = (currentStep % 10) + 1;

      switch (nextStep) {
        case 1: // CARD INSERTED
          set({
            currentStepIndex: 1,
            whatIsHappening: {
              title: `STEP 1 / 10 — CARD INSERTION (${targetPid})`,
              explanation: `Magnetic stripe/EMV chip detected by card reader interrupt handler. The embedded OS validates card presence.`,
            },
          });
          get().addKernelEvent('CARD_INSERTED', targetPid, `CARD_INSERTED: Account ${targetProcess.accountNo}`, 'INFO');
          break;

        case 2: // PROCESS CREATED
          set((s) => ({
            currentStepIndex: 2,
            processes: s.processes.map((p) => (p.pid === targetPid ? { ...p, state: 'NEW' } : p)),
            whatIsHappening: {
              title: `STEP 2 / 10 — PROCESS CREATION (${targetPid})`,
              explanation: `The embedded kernel invokes sys_create_process(). Process structure allocated in the OS table with unique PID ${targetPid}.`,
            },
          }));
          get().addKernelEvent('PROCESS_CREATED', targetPid, `PROCESS_CREATED: PID assigned`, 'INFO');
          break;

        case 3: // PCB INITIALIZED
          set((s) => ({
            currentStepIndex: 3,
            processes: s.processes.map((p) => (p.pid === targetPid ? { ...p, pinStatus: 'VERIFIED' } : p)),
            whatIsHappening: {
              title: `STEP 3 / 10 — PCB INITIALIZATION (${targetPid})`,
              explanation: `Process Control Block (PCB) fields populated: Account: ${targetProcess.accountNo}, Priority: ${targetProcess.priority}, PIN: VERIFIED, Burst: ${targetProcess.burstTime}ms.`,
            },
          }));
          get().addKernelEvent('PCB_INITIALIZED', targetPid, `PCB_INITIALIZED: Priority ${targetProcess.priority}, Type ${targetProcess.transactionType}`, 'INFO');
          break;

        case 4: // PROCESS READY
          set((s) => ({
            currentStepIndex: 4,
            processes: s.processes.map((p) => (p.pid === targetPid ? { ...p, state: 'READY' } : p)),
            whatIsHappening: {
              title: `STEP 4 / 10 — PROCESS READY QUEUE (${targetPid})`,
              explanation: `${targetPid} placed into the READY queue. Waiting for CPU scheduler dispatch according to active policy (${state.schedulerAlgorithm}).`,
            },
          }));
          get().addKernelEvent('PROCESS_READY', targetPid, `PROCESS_READY: Enqueued in ready queue`, 'INFO');
          break;

        case 5: // CPU DISPATCH
          set((s) => ({
            currentStepIndex: 5,
            processes: s.processes.map((p) => (p.pid === targetPid ? { ...p, state: 'RUNNING' } : p)),
            cpuUtilization: Math.min(95, state.cpuUtilization + 15),
            whatIsHappening: {
              title: `STEP 5 / 10 — CPU DISPATCH (${targetPid})`,
              explanation: `Dispatcher switches context. CPU executes ${targetPid}. VIP priority gave precedence over normal transactions.`,
            },
          }));
          get().addKernelEvent('CPU_DISPATCH', targetPid, `CPU_DISPATCH: Scheduled to run on CPU core`, 'SAFE');
          break;

        case 6: // RESOURCE CHECK (Banker's Algorithm)
          get().recomputeBankerState();
          const safety = get().bankerState;
          set({
            currentStepIndex: 6,
            whatIsHappening: {
              title: `STEP 6 / 10 — BANKER'S ALGORITHM RESOURCE CHECK (${targetPid})`,
              explanation: `Cash Vault Manager runs Banker's Algorithm. Evaluates: Need ≤ Available Work. Result: ${safety.isSafe ? 'SAFE STATE' : 'UNSAFE'}. Safe Sequence: ${safety.safeSequence.join(' → ')}.`,
            },
          });
          get().addKernelEvent('BANKER_CHECK', targetPid, `BANKER_CHECK ${safety.isSafe ? 'SAFE' : 'BLOCKED'}: Cash allocation checked`, safety.isSafe ? 'SAFE' : 'DANGER');
          break;

        case 7: // MEMORY ALLOCATION & FIFO
          const fifoResult = get().referencePage(targetPid);
          const allocatedPartition = 'M2';
          set((s) => ({
            currentStepIndex: 7,
            processes: s.processes.map((p) => (p.pid === targetPid ? { ...p, memoryPartition: allocatedPartition } : p)),
            whatIsHappening: {
              title: `STEP 7 / 10 — MEMORY PARTITION & FIFO (${targetPid})`,
              explanation: `Kernel assigns 64 KB partition ${allocatedPartition}. ${fifoResult.explanation}`,
            },
          }));
          get().addKernelEvent('MEMORY_ALLOCATED', targetPid, `MEMORY_ALLOCATED: Buffer partition ${allocatedPartition} assigned`, 'INFO');
          break;

        case 8: // TRANSACTION EXECUTION
          set((s) => ({
            currentStepIndex: 8,
            whatIsHappening: {
              title: `STEP 8 / 10 — HARDWARE DISPENSING / EXECUTION (${targetPid})`,
              explanation: `Dispenser solenoids triggered. ₹${targetProcess.amount.toLocaleString()} counted and presented to customer shutter. Sensor confirms withdrawal.`,
            },
          }));
          get().addKernelEvent('TRANSACTION_EXECUTED', targetPid, `TRANSACTION_EXECUTED: ₹${targetProcess.amount.toLocaleString()} processed`, 'SUCCESS');
          break;

        case 9: // TRANSACTION LOG & INDEXED FILE ALLOCATION
          get().recordCompletedTransaction(targetPid);
          set({
            currentStepIndex: 9,
            whatIsHappening: {
              title: `STEP 9 / 10 — INDEXED FILE SYSTEM LOG (${targetPid})`,
              explanation: `Transaction log written to disk. Inode Index Block I-07 updated with direct block pointer to ${targetProcess.dataBlock}. Record committed.`,
            },
          });
          break;

        case 10: // PROCESS TERMINATED
          const nowStr = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
          set((s) => ({
            currentStepIndex: 10,
            processes: s.processes.map((p) =>
              p.pid === targetPid
                ? {
                    ...p,
                    state: 'TERMINATED',
                    completionTime: nowStr,
                    remainingBurst: 0,
                    memoryPartition: 'UNALLOCATED',
                  }
                : p
            ),
            memoryPartitions: s.memoryPartitions.map((m) => (m.occupiedByPid === targetPid ? { ...m, occupiedByPid: null } : m)),
            activeProcessCount: Math.max(0, s.activeProcessCount - 1),
            cpuUtilization: Math.max(25, s.cpuUtilization - 18),
            whatIsHappening: {
              title: `STEP 10 / 10 — PROCESS TERMINATION (${targetPid})`,
              explanation: `PCB cleaned up. Allocated memory partition and locks freed. Transaction complete. Card returned to customer.`,
            },
          }));
          get().addKernelEvent('PROCESS_TERMINATED', targetPid, `PROCESS_TERMINATED: Resources deallocated`, 'SUCCESS');
          get().awardXp(50, 'Completed complete transaction lifecycle');
          get().unlockAchievement('KERNEL_ENGINEER');
          break;
      }
    },

    resetSimulation: () => {
      set({
        processes: INITIAL_PROCESSES,
        currentStepIndex: 0,
        cpuUtilization: 42,
        memoryUtilization: 68,
        activeProcessCount: 4,
        waitingCount: 2,
        isRunning: false,
        isPaused: false,
        lifecyclePid: 'P004',
        whatIsHappening: {
          title: 'ATM-OS KERNEL INITIALIZED',
          explanation: 'Simulation state restored to baseline benchmark. Ready for operator commands.',
        },
      });
      get().clearEvents();
      get().addKernelEvent('SYSTEM_ALERT', 'KERNEL', 'System reset to clean academic benchmark', 'INFO');
    },

    runCompleteTransactionLifecycle: () => {
      // Create a fresh process or run existing
      const state = get();
      const target = state.processes.find((p) => p.state !== 'TERMINATED') || state.createProcessFromSwipe({
        accountNo: '****4821',
        pin: '1234',
        transactionType: 'WITHDRAWAL',
        amount: 3000,
        priority: 'VIP',
      });

      set({ lifecyclePid: target.pid, currentStepIndex: 0, isRunning: true });

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        get().stepSimulation();
        if (currentStep >= 10) {
          clearInterval(interval);
          set({ isRunning: false });
        }
      }, state.simulationSpeed);
    },

    // Gamification
    operatorScore: 820,
    operatorLevel: 4,
    operatorLevelTitle: 'RESOURCE CONTROLLER',
    systemHealth: 91,
    accuracy: 94,
    efficiency: 92,
    errors: 0,
    missions: INITIAL_MISSIONS,
    achievements: INITIAL_ACHIEVEMENTS,
    activeChallenge: null,

    awardXp: (amount, reason) => {
      set((s) => {
        const newScore = s.operatorScore + amount;
        const levels = [
          { lvl: 1, title: 'TRANSACTION OPERATOR', minXp: 0 },
          { lvl: 2, title: 'PROCESS MANAGER', minXp: 200 },
          { lvl: 3, title: 'SCHEDULING OPERATOR', minXp: 500 },
          { lvl: 4, title: 'RESOURCE CONTROLLER', minXp: 800 },
          { lvl: 5, title: 'MEMORY MANAGER', minXp: 1100 },
          { lvl: 6, title: 'FILE SYSTEM OPERATOR', minXp: 1400 },
          { lvl: 7, title: 'ATM KERNEL ENGINEER', minXp: 1800 },
        ];
        let currentLevel = 1;
        let title = 'TRANSACTION OPERATOR';
        for (const l of levels) {
          if (newScore >= l.minXp) {
            currentLevel = l.lvl;
            title = l.title;
          }
        }
        return {
          operatorScore: newScore,
          operatorLevel: currentLevel,
          operatorLevelTitle: title,
          systemHealth: Math.min(100, s.systemHealth + 1),
        };
      });

      if (reason) {
        get().addKernelEvent('SYSTEM_ALERT', 'OPERATOR', `+${amount} XP: ${reason}`, 'SAFE');
      }
    },

    unlockAchievement: (id) => {
      set((s) => {
        const ach = s.achievements.find((a) => a.id === id);
        if (ach && !ach.unlocked) {
          get().addKernelEvent('SYSTEM_ALERT', 'ACHIEVEMENT', `ACHIEVEMENT UNLOCKED: ${ach.title}`, 'SUCCESS');
          return {
            achievements: s.achievements.map((a) => (a.id === id ? { ...a, unlocked: true } : a)),
            operatorScore: s.operatorScore + ach.xp,
          };
        }
        return {};
      });
    },

    completeMission: (id) => {
      set((s) => {
        const mission = s.missions.find((m) => m.id === id);
        if (mission && !mission.completed) {
          get().addKernelEvent('SYSTEM_ALERT', 'MISSION', `MISSION COMPLETE: ${mission.title} (+${mission.rewardXp} XP)`, 'SUCCESS');
          return {
            missions: s.missions.map((m) => (m.id === id ? { ...m, completed: true } : m)),
            operatorScore: s.operatorScore + mission.rewardXp,
          };
        }
        return {};
      });
    },

    setActiveChallenge: (challenge) => set({ activeChallenge: challenge }),

    submitChallengeAnswer: (optionId) => {
      const state = get();
      if (!state.activeChallenge) {
        return { isCorrect: false, explanation: 'No active challenge' };
      }

      const selected = state.activeChallenge.options.find((o) => o.id === optionId);
      if (!selected) return { isCorrect: false, explanation: 'Invalid option' };

      if (selected.isCorrect) {
        get().awardXp(state.activeChallenge.rewardXp, 'Correct OS Decision');
        set((s) => ({
          accuracy: Math.min(100, s.accuracy + 2),
          systemHealth: Math.min(100, s.systemHealth + 2),
        }));
        if (state.activeChallenge.missionId) {
          get().completeMission(state.activeChallenge.missionId);
        }
      } else {
        set((s) => ({
          errors: s.errors + 1,
          systemHealth: Math.max(50, s.systemHealth - 3),
        }));
      }

      return {
        isCorrect: selected.isCorrect,
        explanation: selected.explanation,
      };
    },

    // Load Scenarios
    loadScenario: (scenarioIndex) => {
      switch (scenarioIndex) {
        case 1: // Normal Transactions
          set({
            processes: [
              { ...INITIAL_PROCESSES[0], pid: 'P001', transactionType: 'WITHDRAWAL', priority: 'REGULAR', burstTime: 4 },
              { ...INITIAL_PROCESSES[1], pid: 'P002', transactionType: 'DEPOSIT', priority: 'REGULAR', burstTime: 3 },
              { ...INITIAL_PROCESSES[2], pid: 'P003', transactionType: 'BALANCE', priority: 'REGULAR', burstTime: 2 },
            ],
            schedulerAlgorithm: 'PRIORITY',
            activeSection: 'Process Manager',
          });
          get().addKernelEvent('SYSTEM_ALERT', 'SCENARIO', 'Scenario 1 Loaded: Normal Transactions (P001, P002, P003)', 'INFO');
          break;

        case 2: // VIP Priority
          set({
            processes: [
              { ...INITIAL_PROCESSES[0], pid: 'P001', priority: 'REGULAR', burstTime: 5 },
              { ...INITIAL_PROCESSES[1], pid: 'P002', priority: 'VIP', burstTime: 3 },
              { ...INITIAL_PROCESSES[2], pid: 'P003', priority: 'REGULAR', burstTime: 4 },
              { ...INITIAL_PROCESSES[3], pid: 'P004', priority: 'VIP', burstTime: 2 },
            ],
            schedulerAlgorithm: 'PRIORITY',
            activeSection: 'CPU Scheduler',
          });
          get().addKernelEvent('SYSTEM_ALERT', 'SCENARIO', 'Scenario 2 Loaded: VIP Priority Competition (P002, P004 VIPs preempt regular)', 'INFO');
          break;

        case 3: // Multiple ATM Lanes (Round Robin)
          set({
            processes: [
              { ...INITIAL_PROCESSES[0], pid: 'P001', burstTime: 7 },
              { ...INITIAL_PROCESSES[1], pid: 'P002', burstTime: 4 },
              { ...INITIAL_PROCESSES[2], pid: 'P003', burstTime: 6 },
              { ...INITIAL_PROCESSES[3], pid: 'P004', burstTime: 5 },
            ],
            schedulerAlgorithm: 'ROUND_ROBIN',
            timeQuantum: 3,
            activeSection: 'CPU Scheduler',
          });
          get().addKernelEvent('SYSTEM_ALERT', 'SCENARIO', 'Scenario 3 Loaded: Multiple ATM Lanes with 3 ms Round Robin', 'INFO');
          break;

        case 4: // Cash Contention (Banker's)
          set({
            cashAvailable: { c500: 4, c200: 2, c100: 5 },
            activeSection: 'Resource Manager',
          });
          get().recomputeBankerState();
          get().addKernelEvent('SYSTEM_ALERT', 'SCENARIO', 'Scenario 4 Loaded: Cash Contention (Vault reserves low, deadlock prevention active)', 'WARN');
          break;

        case 5: // Full Transaction Buffer (FIFO)
          set({
            fifoState: {
              ...initializeFIFO(3),
              frames: ['P001', 'P002', 'P003'],
              victimQueue: ['P001', 'P002', 'P003'],
              referenceString: ['P001', 'P002', 'P003'],
              pageHits: 0,
              pageFaults: 3,
              replacements: 0,
              lastVictim: null,
              lastAction: 'FAULT',
            },
            activeSection: 'Memory Manager',
          });
          get().addKernelEvent('SYSTEM_ALERT', 'SCENARIO', 'Scenario 5 Loaded: Full Transaction Buffer (Next arrival triggers FIFO replacement)', 'WARN');
          break;

        case 6: // Mini Statement Multi-Txn
          set({
            activeSection: 'Mini Statement',
          });
          get().addKernelEvent('SYSTEM_ALERT', 'SCENARIO', 'Scenario 6 Loaded: Mini Statement Lookup for account ****4821', 'INFO');
          break;
      }
    },
  };
});
