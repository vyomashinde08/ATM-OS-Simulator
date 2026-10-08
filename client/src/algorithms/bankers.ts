import { CurrencyNotes } from '../types';

export interface BankerStepLog {
  step: number;
  pid: string;
  need: CurrencyNotes;
  workBefore: CurrencyNotes;
  canAllocate: boolean;
  workAfter: CurrencyNotes;
  reason: string;
}

export interface SafetyResult {
  isSafe: boolean;
  safeSequence: string[];
  explanation: string;
  stepLogs: BankerStepLog[];
  finalWork: CurrencyNotes;
}

export function isLessOrEqual(need: CurrencyNotes, work: CurrencyNotes): boolean {
  return need.c500 <= work.c500 && need.c200 <= work.c200 && need.c100 <= work.c100;
}

export function addNotes(a: CurrencyNotes, b: CurrencyNotes): CurrencyNotes {
  return {
    c500: a.c500 + b.c500,
    c200: a.c200 + b.c200,
    c100: a.c100 + b.c100,
  };
}

export function subtractNotes(a: CurrencyNotes, b: CurrencyNotes): CurrencyNotes {
  return {
    c500: Math.max(0, a.c500 - b.c500),
    c200: Math.max(0, a.c200 - b.c200),
    c100: Math.max(0, a.c100 - b.c100),
  };
}

/**
 * Calculates Need matrix = Max - Allocation
 */
export function calculateNeed(
  max: Record<string, CurrencyNotes>,
  allocation: Record<string, CurrencyNotes>
): Record<string, CurrencyNotes> {
  const need: Record<string, CurrencyNotes> = {};
  for (const pid of Object.keys(max)) {
    const m = max[pid] || { c500: 0, c200: 0, c100: 0 };
    const a = allocation[pid] || { c500: 0, c200: 0, c100: 0 };
    need[pid] = subtractNotes(m, a);
  }
  return need;
}

/**
 * Banker's Safety Algorithm
 */
export function checkSafety(
  available: CurrencyNotes,
  allocation: Record<string, CurrencyNotes>,
  need: Record<string, CurrencyNotes>
): SafetyResult {
  const pids = Object.keys(need);
  if (pids.length === 0) {
    return {
      isSafe: true,
      safeSequence: [],
      explanation: 'No active processes requesting cash resources. System state is quiescent and safe.',
      stepLogs: [],
      finalWork: { ...available },
    };
  }

  let work: CurrencyNotes = { ...available };
  const finish: Record<string, boolean> = {};
  pids.forEach((pid) => (finish[pid] = false));

  const safeSequence: string[] = [];
  const stepLogs: BankerStepLog[] = [];
  let step = 1;

  let progressMade = true;
  while (progressMade) {
    progressMade = false;

    for (const pid of pids) {
      if (!finish[pid]) {
        const processNeed = need[pid];
        const canAllocate = isLessOrEqual(processNeed, work);

        if (canAllocate) {
          const workBefore = { ...work };
          const processAlloc = allocation[pid] || { c500: 0, c200: 0, c100: 0 };
          work = addNotes(work, processAlloc);
          finish[pid] = true;
          safeSequence.push(pid);
          progressMade = true;

          stepLogs.push({
            step: step++,
            pid,
            need: processNeed,
            workBefore,
            canAllocate: true,
            workAfter: { ...work },
            reason: `${pid} Need [₹500×${processNeed.c500}, ₹200×${processNeed.c200}, ₹100×${processNeed.c100}] ≤ Available Work [₹500×${workBefore.c500}, ₹200×${workBefore.c200}, ₹100×${workBefore.c100}]. Process completes and releases its allocated cash.`,
          });
          break; // restart check with updated Work vector
        }
      }
    }
  }

  const allFinished = pids.every((pid) => finish[pid]);
  const explanation = allFinished
    ? `SAFE STATE: All ${pids.length} processes can satisfy their maximum cash demand without deadlock. Safe Sequence: ${safeSequence.join(' → ')}`
    : `UNSAFE STATE: Cash resources are insufficient to guarantee completion. Processes [${pids.filter((p) => !finish[p]).join(', ')}] could cause a circular deadlock.`;

  return {
    isSafe: allFinished,
    safeSequence,
    explanation,
    stepLogs,
    finalWork: work,
  };
}

/**
 * Banker's Resource Request Algorithm
 */
export function evaluateResourceRequest(
  pid: string,
  request: CurrencyNotes,
  available: CurrencyNotes,
  allocation: Record<string, CurrencyNotes>,
  need: Record<string, CurrencyNotes>
): {
  approved: boolean;
  reason: string;
  simulatedSafety: SafetyResult;
  updatedAvailable: CurrencyNotes;
  updatedAllocation: Record<string, CurrencyNotes>;
  updatedNeed: Record<string, CurrencyNotes>;
} {
  const currentNeed = need[pid] || { c500: 0, c200: 0, c100: 0 };

  // Condition 1: Request <= Need
  if (!isLessOrEqual(request, currentNeed)) {
    return {
      approved: false,
      reason: `ERROR: Process ${pid} requested cash exceeding its declared maximum claim (Need: ₹500×${currentNeed.c500}, ₹200×${currentNeed.c200}, ₹100×${currentNeed.c100}).`,
      simulatedSafety: checkSafety(available, allocation, need),
      updatedAvailable: available,
      updatedAllocation: allocation,
      updatedNeed: need,
    };
  }

  // Condition 2: Request <= Available
  if (!isLessOrEqual(request, available)) {
    return {
      approved: false,
      reason: `BLOCKED: Available ATM cash vault notes are insufficient to satisfy immediate request from ${pid}. Process must wait in queue.`,
      simulatedSafety: checkSafety(available, allocation, need),
      updatedAvailable: available,
      updatedAllocation: allocation,
      updatedNeed: need,
    };
  }

  // Condition 3: Pretend to allocate and test safety
  const tempAvailable = subtractNotes(available, request);
  const tempAllocation = {
    ...allocation,
    [pid]: addNotes(allocation[pid] || { c500: 0, c200: 0, c100: 0 }, request),
  };
  const tempNeed = {
    ...need,
    [pid]: subtractNotes(currentNeed, request),
  };

  const safety = checkSafety(tempAvailable, tempAllocation, tempNeed);

  if (safety.isSafe) {
    return {
      approved: true,
      reason: `APPROVED: Cash request of ₹500×${request.c500}, ₹200×${request.c200}, ₹100×${request.c100} granted to ${pid}. Resulting state is SAFE with sequence: ${safety.safeSequence.join(' → ')}.`,
      simulatedSafety: safety,
      updatedAvailable: tempAvailable,
      updatedAllocation: tempAllocation,
      updatedNeed: tempNeed,
    };
  } else {
    return {
      approved: false,
      reason: `BLOCKED: Granting ₹500×${request.c500}, ₹200×${request.c200}, ₹100×${request.c100} to ${pid} would lead to an UNSAFE state (potential ATM cash deadlock). Request withheld.`,
      simulatedSafety: safety,
      updatedAvailable: available,
      updatedAllocation: allocation,
      updatedNeed: need,
    };
  }
}
