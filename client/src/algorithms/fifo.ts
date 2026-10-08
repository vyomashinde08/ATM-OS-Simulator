import { FIFOState } from '../types';

export interface FIFOStepResult {
  page: string;
  isHit: boolean;
  framesSnapshot: (string | null)[];
  victim: string | null;
  explanation: string;
  nextVictim: string | null;
}

export function initializeFIFO(capacity: number = 3): FIFOState {
  return {
    frames: Array(capacity).fill(null),
    referenceString: [],
    pageHits: 0,
    pageFaults: 0,
    replacements: 0,
    victimQueue: [],
    lastVictim: null,
    lastAction: null,
  };
}

/**
 * Executes a single FIFO step for an incoming transaction page reference
 */
export function processFIFOStep(currentState: FIFOState, incomingPid: string): {
  updatedState: FIFOState;
  stepResult: FIFOStepResult;
} {
  const frames = [...currentState.frames];
  const victimQueue = [...currentState.victimQueue];
  const referenceString = [...currentState.referenceString, incomingPid];

  // Check if page already exists in one of the frames (PAGE HIT)
  const existingIndex = frames.indexOf(incomingPid);
  if (existingIndex !== -1) {
    const hits = currentState.pageHits + 1;
    const nextVictim = victimQueue.length > 0 ? victimQueue[0] : null;

    const updatedState: FIFOState = {
      frames,
      referenceString,
      pageHits: hits,
      pageFaults: currentState.pageFaults,
      replacements: currentState.replacements,
      victimQueue,
      lastVictim: null,
      lastAction: 'HIT',
    };

    return {
      updatedState,
      stepResult: {
        page: incomingPid,
        isHit: true,
        framesSnapshot: [...frames],
        victim: null,
        explanation: `PAGE HIT: ${incomingPid} is already resident in Frame ${existingIndex + 1}. No memory partition replacement required.`,
        nextVictim,
      },
    };
  }

  // PAGE FAULT occurred
  const faults = currentState.pageFaults + 1;
  const emptyIndex = frames.indexOf(null);

  if (emptyIndex !== -1) {
    // There is an empty frame available
    frames[emptyIndex] = incomingPid;
    victimQueue.push(incomingPid);

    const updatedState: FIFOState = {
      frames,
      referenceString,
      pageHits: currentState.pageHits,
      pageFaults: faults,
      replacements: currentState.replacements,
      victimQueue,
      lastVictim: null,
      lastAction: 'FAULT',
    };

    return {
      updatedState,
      stepResult: {
        page: incomingPid,
        isHit: false,
        framesSnapshot: [...frames],
        victim: null,
        explanation: `PAGE FAULT: ${incomingPid} loaded into empty Frame ${emptyIndex + 1}. Added to tail of FIFO eviction queue.`,
        nextVictim: victimQueue[0],
      },
    };
  }

  // All frames are full -> FIFO Replacement
  const victim = victimQueue.shift()!; // Remove oldest
  const victimFrameIndex = frames.indexOf(victim);
  frames[victimFrameIndex] = incomingPid;
  victimQueue.push(incomingPid);

  const replacements = currentState.replacements + 1;

  const updatedState: FIFOState = {
    frames,
    referenceString,
    pageHits: currentState.pageHits,
    pageFaults: faults,
    replacements,
    victimQueue,
    lastVictim: victim,
    lastAction: 'FAULT',
  };

  return {
    updatedState,
    stepResult: {
      page: incomingPid,
      isHit: false,
      framesSnapshot: [...frames],
      victim,
      explanation: `PAGE FAULT & REPLACEMENT: Buffer full. Oldest page ${victim} (resident the longest) evicted from Frame ${victimFrameIndex + 1} to make room for ${incomingPid}.`,
      nextVictim: victimQueue[0],
    },
  };
}

/**
 * Calculates hit and fault ratios
 */
export function calculateFIFORatios(pageHits: number, pageFaults: number): {
  hitRatio: number;
  faultRatio: number;
  totalReferences: number;
} {
  const total = pageHits + pageFaults;
  if (total === 0) return { hitRatio: 0, faultRatio: 0, totalReferences: 0 };
  return {
    hitRatio: Number(((pageHits / total) * 100).toFixed(1)),
    faultRatio: Number(((pageFaults / total) * 100).toFixed(1)),
    totalReferences: total,
  };
}
