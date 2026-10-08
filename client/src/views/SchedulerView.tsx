import React from 'react';
import { useATMStore } from '../store/useATMStore';
import { Activity, Clock, ArrowRight, Zap, RefreshCw, Layers } from 'lucide-react';

export const SchedulerView: React.FC = () => {
  const {
    schedulerAlgorithm,
    setSchedulerAlgorithm,
    timeQuantum,
    setTimeQuantum,
    getSchedulerMetrics,
    processes,
    awardXp,
    unlockAchievement,
  } = useATMStore();

  const metrics = getSchedulerMetrics();
  const readyProcesses = processes.filter((p) => p.state !== 'TERMINATED');

  const handleRunScheduling = () => {
    if (schedulerAlgorithm === 'PRIORITY') {
      awardXp(30, 'Completed Priority Scheduling');
      unlockAchievement('PRIORITY_CONTROLLER');
    } else {
      awardXp(30, 'Completed Round Robin Lane Simulation');
      unlockAchievement('FAIR_CPU');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="border-b border-[#E2E0D8] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-[#6F6D67]">
            COURSE OUTCOME 3 (CO3)
          </div>
          <h2 className="text-xl font-bold font-mono tracking-tight text-[#141413] mt-0.5">
            CPU DISPATCH SCHEDULER &amp; GANTT ENGINE
          </h2>
          <p className="text-xs text-[#6F6D67] mt-1">
            Real-time scheduling policies comparing VIP Preemptive Priority with Multi-Lane Round Robin time-slicing.
          </p>
        </div>

        {/* Algorithm Tabs */}
        <div className="flex items-center border border-[#E2E0D8] rounded-[4px] p-0.5 bg-[#FFFFFF]">
          <button
            onClick={() => setSchedulerAlgorithm('PRIORITY')}
            className={`px-3 py-1.5 text-xs font-mono rounded-[3px] transition-colors ${
              schedulerAlgorithm === 'PRIORITY'
                ? 'bg-[#141413] text-[#F9F8F6] font-bold'
                : 'text-[#6F6D67] hover:text-[#141413]'
            }`}
          >
            PRIORITY SCHEDULING (VIP)
          </button>
          <button
            onClick={() => setSchedulerAlgorithm('ROUND_ROBIN')}
            className={`px-3 py-1.5 text-xs font-mono rounded-[3px] transition-colors ${
              schedulerAlgorithm === 'ROUND_ROBIN'
                ? 'bg-[#141413] text-[#F9F8F6] font-bold'
                : 'text-[#6F6D67] hover:text-[#141413]'
            }`}
          >
            ROUND ROBIN (ATM LANES)
          </button>
        </div>
      </div>

      {/* Algorithm Config & Context Bar */}
      <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-4 rounded-[4px] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs font-bold text-[#141413] uppercase">
            ACTIVE POLICY: {schedulerAlgorithm === 'PRIORITY' ? 'VIP NON-PREEMPTIVE PRIORITY' : 'MULTI-LANE ROUND ROBIN'}
          </div>
          <div className="text-xs text-[#6F6D67] mt-0.5">
            {schedulerAlgorithm === 'PRIORITY'
              ? 'VIP cardholders (Executive / Corporate) bypass normal queue order to guarantee immediate processing.'
              : 'ATM multi-terminal cluster shares CPU via time quanta. Emulates Lanes 1, 2, and 3.'}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {schedulerAlgorithm === 'ROUND_ROBIN' && (
            <div className="flex items-center gap-2 border border-[#E2E0D8] px-3 py-1.5 rounded-[4px] bg-[#F9F8F6] text-xs font-mono">
              <span className="text-[#6F6D67]">TIME QUANTUM (q):</span>
              <input
                type="number"
                min="1"
                max="10"
                value={timeQuantum}
                onChange={(e) => setTimeQuantum(Number(e.target.value))}
                className="w-12 text-center border border-[#E2E0D8] bg-[#FFFFFF] rounded font-bold text-[#141413]"
              />
              <span className="text-[#6F6D67]">ms</span>
            </div>
          )}

          <button
            onClick={handleRunScheduling}
            className="ctrl-btn ctrl-btn-primary"
          >
            <Zap className="w-3.5 h-3.5" />
            CALCULATE &amp; DISPATCH
          </button>
        </div>
      </div>

      {/* Visual Gantt Chart (Section 18 & 19) */}
      <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-5 rounded-[4px] space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E0D8] pb-2">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#141413] uppercase tracking-wide">
            <Clock className="w-4 h-4 text-[#141413]" />
            GANTT EXECUTION TIMELINE (CPU TIME SLICES)
          </div>
          <div className="text-[11px] font-mono text-[#6F6D67]">
            Context Switches: <strong className="text-[#141413]">{metrics.contextSwitches}</strong>
          </div>
        </div>

        {/* Gantt Bar Visualization */}
        {metrics.ganttChart.length === 0 ? (
          <div className="p-8 text-center font-mono text-xs text-[#6F6D67]">
            No processes in ready queue to schedule.
          </div>
        ) : (
          <div className="pt-2">
            {/* The segments bar */}
            <div className="w-full flex h-14 border border-[#141413] rounded-[4px] overflow-hidden bg-[#F4F2EB]">
              {metrics.ganttChart.map((seg, idx) => {
                const duration = seg.end - seg.start;
                const totalEnd = metrics.ganttChart[metrics.ganttChart.length - 1].end;
                const widthPercent = totalEnd > 0 ? (duration / totalEnd) * 100 : 100 / metrics.ganttChart.length;

                return (
                  <div
                    key={`${seg.pid}-${idx}`}
                    style={{ width: `${Math.max(widthPercent, 8)}%` }}
                    className={`h-full border-r border-[#141413] last:border-r-0 flex flex-col items-center justify-center font-mono transition-all hover:brightness-95 ${
                      idx % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#EAE8DF]'
                    }`}
                    title={`PID: ${seg.pid} | Range: ${seg.start}ms - ${seg.end}ms ${seg.lane ? `(Lane ${seg.lane})` : ''}`}
                  >
                    <span className="font-bold text-xs text-[#141413]">{seg.pid}</span>
                    {seg.lane && (
                      <span className="text-[9px] text-[#6F6D67]">LANE {seg.lane}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Time markers beneath */}
            <div className="w-full flex justify-between font-mono text-[10px] text-[#6F6D67] mt-1.5 px-0.5">
              <span>0 ms</span>
              {metrics.ganttChart.map((seg, idx) => (
                <span key={`time-${idx}`} className="text-right">
                  {seg.end} ms
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ATM Multi-Lane View (Section 19) */}
        {schedulerAlgorithm === 'ROUND_ROBIN' && (
          <div className="mt-4 pt-4 border-t border-[#E2E0D8]">
            <div className="text-[11px] font-mono font-bold text-[#141413] uppercase mb-3 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#6F6D67]" />
              ATM LANES ROUND ROBIN CONCURRENCY
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              {[1, 2, 3].map((laneNum) => {
                const laneSlices = metrics.ganttChart.filter((g) => g.lane === laneNum);
                return (
                  <div key={laneNum} className="border border-[#E2E0D8] bg-[#F9F8F6] p-3 rounded-[4px]">
                    <div className="flex items-center justify-between border-b border-[#E2E0D8] pb-1.5 mb-2">
                      <span className="font-bold text-[#141413]">ATM LANE {laneNum}</span>
                      <span className="text-[10px] text-[#6F6D67]">TERMINAL {laneNum}</span>
                    </div>
                    <div className="space-y-1 text-[11px]">
                      {laneSlices.length === 0 ? (
                        <div className="text-[#8C8A82]">Quiescent</div>
                      ) : (
                        laneSlices.map((s, i) => (
                          <div key={i} className="flex justify-between text-[#141413]">
                            <span>{s.pid} (Burst {s.end - s.start}ms)</span>
                            <span className="text-[#6F6D67]">{s.start}-{s.end}ms</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Metrics & Performance Table (Section 18) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table of Waiting & Turnaround times */}
        <div className="lg:col-span-2 border border-[#E2E0D8] bg-[#FFFFFF] rounded-[4px] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E2E0D8] bg-[#F4F2EB] flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-[#141413] uppercase tracking-wide">
              PER-PROCESS SCHEDULING METRICS
            </span>
            <span className="text-[11px] font-mono text-[#6F6D67]">
              FORMULA: TAT = CT - AT | WT = TAT - BT
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse tech-table">
              <thead>
                <tr>
                  <th>PID</th>
                  <th>Priority</th>
                  <th>Burst Time</th>
                  <th>Waiting Time</th>
                  <th>Turnaround Time</th>
                  <th>Completion Time</th>
                </tr>
              </thead>
              <tbody>
                {readyProcesses.map((p) => {
                  const m = metrics.processMetrics[p.pid] || { waitingTime: 0, turnaroundTime: 0, completionTime: 0 };
                  return (
                    <tr key={p.pid} className="hover:bg-[#F9F8F6]">
                      <td className="font-mono font-bold text-xs text-[#141413]">{p.pid}</td>
                      <td>
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                            p.priority === 'VIP' ? 'bg-[#141413] text-[#F9F8F6]' : 'bg-[#E2E0D8] text-[#141413]'
                          }`}
                        >
                          {p.priority}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-[#141413]">{p.burstTime} ms</td>
                      <td className="font-mono text-xs font-semibold text-[#141413]">{m.waitingTime} ms</td>
                      <td className="font-mono text-xs font-semibold text-[#141413]">{m.turnaroundTime} ms</td>
                      <td className="font-mono text-xs text-[#6F6D67]">{m.completionTime} ms</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Aggregate Averages & Explanation */}
        <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-4 rounded-[4px] flex flex-col justify-between space-y-4">
          <div>
            <div className="font-mono text-xs font-bold text-[#141413] uppercase border-b border-[#E2E0D8] pb-2 mb-3">
              SYSTEM SCHEDULER EFFICIENCY
            </div>

            <div className="space-y-3 font-mono">
              <div className="p-3 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px]">
                <div className="text-[10px] text-[#6F6D67] uppercase">AVERAGE WAITING TIME</div>
                <div className="text-2xl font-bold text-[#141413] mt-1">
                  {metrics.avgWaitingTime} ms
                </div>
                <div className="text-[10px] text-[#6F6D67] mt-0.5">Average queue latency</div>
              </div>

              <div className="p-3 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px]">
                <div className="text-[10px] text-[#6F6D67] uppercase">AVERAGE TURNAROUND TIME</div>
                <div className="text-2xl font-bold text-[#141413] mt-1">
                  {metrics.avgTurnaroundTime} ms
                </div>
                <div className="text-[10px] text-[#6F6D67] mt-0.5">Total arrival to completion</div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#F4F2EB] border border-[#E2E0D8] rounded-[4px] text-xs font-mono text-[#141413] leading-relaxed">
            <span className="font-bold">WHY THIS ORDER? </span>
            {schedulerAlgorithm === 'PRIORITY'
              ? 'VIP processes (e.g. P004) are dispatched before regular processes. Priority scheduling guarantees minimum waiting time for high-value operations.'
              : `Round Robin grants each lane a ${timeQuantum} ms time slice. Preemption occurs when the quantum expires, maintaining fair concurrency.`}
          </div>
        </div>
      </div>
    </div>
  );
};
