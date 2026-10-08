export type ProcessState = 'NEW' | 'READY' | 'RUNNING' | 'WAITING' | 'TERMINATED';

export type TransactionType = 'WITHDRAWAL' | 'DEPOSIT' | 'BALANCE' | 'MINI_STATEMENT';

export type ProcessPriority = 'VIP' | 'REGULAR';

export interface CurrencyNotes {
  c500: number;
  c200: number;
  c100: number;
}

export interface PCB {
  pid: string;
  accountNo: string;
  holderName: string;
  pin: string;
  pinStatus: 'VERIFIED' | 'PENDING' | 'INVALID';
  state: ProcessState;
  priority: ProcessPriority;
  transactionType: TransactionType;
  amount: number;
  arrivalTime: string;
  burstTime: number; // in ms
  remainingBurst: number;
  waitingTime: number;
  turnaroundTime: number;
  completionTime: string | null;
  memoryPartition: 'M1' | 'M2' | 'M3' | 'M4' | 'UNALLOCATED';
  resource: 'CASH DISPENSER' | 'CARD READER' | 'VAULT SENSOR' | 'RECEIPT PRINTER';
  requestedNotes: CurrencyNotes;
  allocatedNotes: CurrencyNotes;
  maxNotes: CurrencyNotes;
  dataBlock: string;
}

export type KernelEventType =
  | 'CARD_INSERTED'
  | 'PROCESS_CREATED'
  | 'PCB_INITIALIZED'
  | 'PROCESS_READY'
  | 'CPU_DISPATCH'
  | 'RESOURCE_REQUEST'
  | 'BANKER_CHECK'
  | 'MEMORY_ALLOCATED'
  | 'TRANSACTION_EXECUTED'
  | 'LOG_CREATED'
  | 'PROCESS_TERMINATED'
  | 'PAGE_FAULT'
  | 'PAGE_HIT'
  | 'CONTEXT_SWITCH'
  | 'SYSTEM_ALERT';

export interface KernelEvent {
  id: string;
  stepNumber?: number;
  timestamp: string;
  type: KernelEventType;
  pid: string;
  details: string;
  status: 'INFO' | 'SAFE' | 'WARN' | 'DANGER' | 'SUCCESS';
}

export interface MemoryPartition {
  id: 'M1' | 'M2' | 'M3' | 'M4';
  sizeKb: number;
  occupiedByPid: string | null;
  lastAccessed: number;
}

export interface FIFOState {
  frames: (string | null)[]; // Max 3 frames (e.g. Frame 1, Frame 2, Frame 3)
  referenceString: string[];
  pageHits: number;
  pageFaults: number;
  replacements: number;
  victimQueue: string[]; // Order of pages in memory: oldest at index 0
  lastVictim: string | null;
  lastAction: 'HIT' | 'FAULT' | null;
}

export interface BankerState {
  available: CurrencyNotes;
  max: Record<string, CurrencyNotes>;
  allocation: Record<string, CurrencyNotes>;
  need: Record<string, CurrencyNotes>;
  safeSequence: string[];
  isSafe: boolean;
  lastEvaluation: string;
}

export interface GanttSegment {
  pid: string;
  start: number;
  end: number;
  lane?: number;
}

export interface SchedulerMetrics {
  ganttChart: GanttSegment[];
  contextSwitches: number;
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  processMetrics: Record<string, { waitingTime: number; turnaroundTime: number; completionTime: number }>;
}

export interface AccountData {
  account_no: string;
  holder_name: string;
  pin: string;
  balance: number;
  card_type: 'VIP' | 'REGULAR';
}

export interface TransactionRecord {
  id?: number;
  txn_id: string;
  pid: string;
  account_no: string;
  type: string;
  amount: number;
  status: string;
  timestamp: string;
  index_block?: string;
  data_block?: string;
}

export interface Mission {
  id: string;
  title: string;
  objective: string;
  rewardXp: number;
  completed: boolean;
  co: 'CO1' | 'CO2' | 'CO3' | 'CO4' | 'CO5';
  hint: string;
}

export interface ChallengeDecision {
  id: string;
  missionId?: string;
  question: string;
  context: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  rewardXp: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xp: number;
  unlocked: boolean;
  icon: string;
}
