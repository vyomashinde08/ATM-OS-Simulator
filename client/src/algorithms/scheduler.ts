import { PCB, GanttSegment, SchedulerMetrics } from '../types';

/**
 * Priority Scheduling (Non-preemptive with VIP priority = 1, Regular = 2)
 * In this embedded ATM OS, VIP transactions (Executive/Corporate) preempt or schedule ahead of Regular transactions.
 */
export function runPriorityScheduling(processes: PCB[]): SchedulerMetrics {
  if (processes.length === 0) {
    return {
      ganttChart: [],
      contextSwitches: 0,
      avgWaitingTime: 0,
      avgTurnaroundTime: 0,
      processMetrics: {},
    };
  }

  // Clone processes to avoid mutating original
  const queue = [...processes].sort((a, b) => {
    // VIP has higher priority (VIP < REGULAR)
    if (a.priority === 'VIP' && b.priority !== 'VIP') return -1;
    if (a.priority !== 'VIP' && b.priority === 'VIP') return 1;
    // Tie-breaker: Arrival time or PID
    return a.pid.localeCompare(b.pid);
  });

  let currentTime = 0;
  let contextSwitches = 0;
  const ganttChart: GanttSegment[] = [];
  const processMetrics: Record<string, { waitingTime: number; turnaroundTime: number; completionTime: number }> = {};

  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;

  for (let i = 0; i < queue.length; i++) {
    const p = queue[i];
    const start = currentTime;
    const end = start + p.burstTime;

    ganttChart.push({
      pid: p.pid,
      start,
      end,
    });

    const completionTime = end;
    const turnaroundTime = completionTime; // Assuming normalized arrival = 0 for the batch
    const waitingTime = start; // Waiting time in ready queue before dispatch

    totalWaitingTime += waitingTime;
    totalTurnaroundTime += turnaroundTime;

    processMetrics[p.pid] = {
      waitingTime,
      turnaroundTime,
      completionTime,
    };

    currentTime = end;
    if (i < queue.length - 1) {
      contextSwitches++;
    }
  }

  const count = queue.length;
  return {
    ganttChart,
    contextSwitches,
    avgWaitingTime: Number((totalWaitingTime / count).toFixed(2)),
    avgTurnaroundTime: Number((totalTurnaroundTime / count).toFixed(2)),
    processMetrics,
  };
}

/**
 * Round Robin Scheduling across ATM Multi-Lanes (LANE 1, LANE 2, LANE 3)
 * Time quantum allows fair CPU slice sharing between concurrent ATM lane transactions.
 */
export function runRoundRobinScheduling(processes: PCB[], timeQuantum: number = 3): SchedulerMetrics {
  if (processes.length === 0 || timeQuantum <= 0) {
    return {
      ganttChart: [],
      contextSwitches: 0,
      avgWaitingTime: 0,
      avgTurnaroundTime: 0,
      processMetrics: {},
    };
  }

  // Create queue with remaining burst times
  const queue = processes.map((p, idx) => ({
    pid: p.pid,
    burstTime: p.burstTime,
    remainingBurst: p.burstTime,
    lane: (idx % 3) + 1, // Distribute across 3 ATM lanes
  }));

  const readyQueue = [...queue];
  let currentTime = 0;
  let contextSwitches = 0;
  const ganttChart: GanttSegment[] = [];
  const completionMap: Record<string, number> = {};

  let lastPid: string | null = null;

  while (readyQueue.length > 0) {
    const current = readyQueue.shift()!;

    if (lastPid && lastPid !== current.pid) {
      contextSwitches++;
    }
    lastPid = current.pid;

    const slice = Math.min(current.remainingBurst, timeQuantum);
    const start = currentTime;
    const end = start + slice;

    ganttChart.push({
      pid: current.pid,
      start,
      end,
      lane: current.lane,
    });

    current.remainingBurst -= slice;
    currentTime = end;

    if (current.remainingBurst > 0) {
      readyQueue.push(current);
    } else {
      completionMap[current.pid] = currentTime;
    }
  }

  // Calculate waiting and turnaround metrics
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;
  const processMetrics: Record<string, { waitingTime: number; turnaroundTime: number; completionTime: number }> = {};

  processes.forEach((p) => {
    const completionTime = completionMap[p.pid] || 0;
    const turnaroundTime = completionTime;
    const waitingTime = turnaroundTime - p.burstTime;

    totalWaitingTime += waitingTime;
    totalTurnaroundTime += turnaroundTime;

    processMetrics[p.pid] = {
      waitingTime,
      turnaroundTime,
      completionTime,
    };
  });

  const count = processes.length;
  return {
    ganttChart,
    contextSwitches,
    avgWaitingTime: Number((totalWaitingTime / count).toFixed(2)),
    avgTurnaroundTime: Number((totalTurnaroundTime / count).toFixed(2)),
    processMetrics,
  };
}
