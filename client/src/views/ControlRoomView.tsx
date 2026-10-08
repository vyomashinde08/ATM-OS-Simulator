import React from 'react';
import { useATMStore } from '../store/useATMStore';
import {
  Cpu,
  HardDrive,
  Wallet,
  Activity,
  ArrowRight,
  Database,
  Terminal,
  ExternalLink,
} from 'lucide-react';

export const ControlRoomView: React.FC = () => {
  const {
    cpuUtilization,
    memoryUtilization,
    cashAvailable,
    activeProcessCount,
    waitingCount,
    completedCount,
    pageFaultCount,
    processes,
    memoryPartitions,
    events,
    setSelectedPid,
    setActiveSection,
    stepSimulation,
  } = useATMStore();

  const totalCash = cashAvailable.c500 * 500 + cashAvailable.c200 * 200 + cashAvailable.c100 * 100;
  const readyQueue = processes.filter((p) => p.state !== 'TERMINATED');

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E0D8] pb-4">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-[#6F6D67]">
            KERNEL MONITOR
          </div>
          <h2 className="text-xl font-bold font-mono tracking-tight text-[#141413] mt-0.5">
            ATM-OS CONTROL ROOM
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2.5 py-1 border border-[#E2E0D8] bg-[#FFFFFF] rounded-[4px] text-[#141413]">
            ATM-01
          </span>
          <span className="text-xs font-mono px-2.5 py-1 border border-[#15803D] bg-[#F0FDF4] rounded-[4px] text-[#15803D] font-medium">
            EMBEDDED OS ONLINE
          </span>
        </div>
      </div>

      {/* Primary System Metrics (Section 10) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* CPU */}
        <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-3 rounded-[4px]">
          <div className="text-[11px] font-mono text-[#6F6D67] uppercase flex items-center justify-between">
            <span>CPU</span>
            <Cpu className="w-3.5 h-3.5 text-[#6F6D67]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#141413] mt-1.5">
            {cpuUtilization}%
          </div>
          <div className="w-full bg-[#F4F2EB] h-1.5 mt-2 rounded-[2px] overflow-hidden">
            <div
              className="bg-[#141413] h-full transition-all duration-300"
              style={{ width: `${cpuUtilization}%` }}
            />
          </div>
        </div>

        {/* MEMORY */}
        <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-3 rounded-[4px]">
          <div className="text-[11px] font-mono text-[#6F6D67] uppercase flex items-center justify-between">
            <span>MEMORY</span>
            <HardDrive className="w-3.5 h-3.5 text-[#6F6D67]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#141413] mt-1.5">
            {memoryUtilization}%
          </div>
          <div className="w-full bg-[#F4F2EB] h-1.5 mt-2 rounded-[2px] overflow-hidden">
            <div
              className="bg-[#141413] h-full transition-all duration-300"
              style={{ width: `${memoryUtilization}%` }}
            />
          </div>
        </div>

        {/* CASH */}
        <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-3 rounded-[4px]">
          <div className="text-[11px] font-mono text-[#6F6D67] uppercase flex items-center justify-between">
            <span>CASH</span>
            <Wallet className="w-3.5 h-3.5 text-[#6F6D67]" />
          </div>
          <div className="text-xl font-mono font-bold text-[#141413] mt-1.5 truncate">
            ₹{totalCash.toLocaleString()}
          </div>
          <div className="text-[10px] font-mono text-[#6F6D67] mt-1">
            Vault Reserves
          </div>
        </div>

        {/* ACTIVE PROCESSES */}
        <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-3 rounded-[4px]">
          <div className="text-[11px] font-mono text-[#6F6D67] uppercase flex items-center justify-between">
            <span>ACTIVE PROCESSES</span>
            <Activity className="w-3.5 h-3.5 text-[#6F6D67]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#141413] mt-1.5">
            {String(activeProcessCount).padStart(2, '0')}
          </div>
          <div className="text-[10px] font-mono text-[#15803D] mt-1">
            In Dispatch Queue
          </div>
        </div>

        {/* WAITING */}
        <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-3 rounded-[4px]">
          <div className="text-[11px] font-mono text-[#6F6D67] uppercase flex items-center justify-between">
            <span>WAITING</span>
          </div>
          <div className="text-2xl font-mono font-bold text-[#141413] mt-1.5">
            {String(waitingCount).padStart(2, '0')}
          </div>
          <div className="text-[10px] font-mono text-[#6F6D67] mt-1">
            I/O &amp; Resource Lock
          </div>
        </div>

        {/* COMPLETED */}
        <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-3 rounded-[4px]">
          <div className="text-[11px] font-mono text-[#6F6D67] uppercase flex items-center justify-between">
            <span>COMPLETED</span>
          </div>
          <div className="text-2xl font-mono font-bold text-[#141413] mt-1.5">
            {String(completedCount).padStart(2, '0')}
          </div>
          <div className="text-[10px] font-mono text-[#15803D] mt-1">
            Committed to Log
          </div>
        </div>

        {/* PAGE FAULTS */}
        <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-3 rounded-[4px]">
          <div className="text-[11px] font-mono text-[#6F6D67] uppercase flex items-center justify-between">
            <span>PAGE FAULTS</span>
          </div>
          <div className="text-2xl font-mono font-bold text-[#B45309] mt-1.5">
            {String(pageFaultCount).padStart(2, '0')}
          </div>
          <div className="text-[10px] font-mono text-[#6F6D67] mt-1">
            FIFO Buffer Shifts
          </div>
        </div>
      </div>

      {/* Row 2: Process Queue & Memory Map & Cash Vault */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Process Queue (Section 11) */}
        <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-4 rounded-[4px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E2E0D8] pb-2 mb-3">
              <span className="font-mono text-xs font-semibold text-[#141413] uppercase">
                PROCESS QUEUE
              </span>
              <button
                onClick={() => setActiveSection('Process Manager')}
                className="text-[11px] font-mono text-[#6F6D67] hover:text-[#141413] flex items-center gap-1"
              >
                Inspect All <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Visual Process Queue P004 -> P001 -> P003 -> P002 */}
            <div className="flex items-center gap-2 overflow-x-auto py-3">
              {readyQueue.length === 0 ? (
                <div className="text-xs text-[#6F6D67] font-mono">Queue empty. No active transactions.</div>
              ) : (
                readyQueue.map((p, idx) => (
                  <React.Fragment key={p.pid}>
                    <button
                      onClick={() => {
                        setSelectedPid(p.pid);
                        setActiveSection('Process Manager');
                      }}
                      className={`px-3 py-2 border rounded-[4px] font-mono text-xs font-semibold transition-all ${
                        p.priority === 'VIP'
                          ? 'border-[#141413] bg-[#141413] text-[#F9F8F6]'
                          : 'border-[#E2E0D8] bg-[#F4F2EB] text-[#141413] hover:border-[#141413]'
                      }`}
                      title={`PID: ${p.pid} | Priority: ${p.priority} | State: ${p.state}`}
                    >
                      <div>{p.pid}</div>
                      <div className="text-[9px] font-normal opacity-80 mt-0.5">
                        {p.priority}
                      </div>
                    </button>
                    {idx < readyQueue.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-[#6F6D67] flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2E0D8] text-[11px] font-mono text-[#6F6D67] flex items-center justify-between">
            <span>Scheduling Policy: Priority (VIP Preempts)</span>
            <button
              onClick={() => setActiveSection('CPU Scheduler')}
              className="text-[#141413] underline font-medium"
            >
              Gantt Chart
            </button>
          </div>
        </div>

        {/* Memory Map (Section 11) */}
        <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-4 rounded-[4px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E2E0D8] pb-2 mb-3">
              <span className="font-mono text-xs font-semibold text-[#141413] uppercase">
                MEMORY MAP (256 KB)
              </span>
              <button
                onClick={() => setActiveSection('Memory Manager')}
                className="text-[11px] font-mono text-[#6F6D67] hover:text-[#141413] flex items-center gap-1"
              >
                FIFO Details <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* M1 P001 | M2 P004 | M3 P002 | M4 EMPTY */}
            <div className="grid grid-cols-2 gap-2 py-1 font-mono text-xs">
              {memoryPartitions.map((m) => (
                <div
                  key={m.id}
                  className={`p-2.5 border rounded-[4px] flex items-center justify-between ${
                    m.occupiedByPid
                      ? 'border-[#E2E0D8] bg-[#F4F2EB] text-[#141413]'
                      : 'border-dashed border-[#E2E0D8] bg-[#FFFFFF] text-[#6F6D67]'
                  }`}
                >
                  <div>
                    <span className="font-bold">{m.id}</span>
                    <span className="text-[10px] text-[#6F6D67] block">64 KB</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                        m.occupiedByPid ? 'bg-[#141413] text-[#F9F8F6]' : 'text-[#6F6D67]'
                      }`}
                    >
                      {m.occupiedByPid || 'EMPTY'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2E0D8] text-[11px] font-mono text-[#6F6D67] flex items-center justify-between">
            <span>Partitions: 4 Fixed (64 KB each)</span>
            <span className="text-[#141413] font-medium">FIFO Replacement</span>
          </div>
        </div>

        {/* Cash Resource Status (Section 11) */}
        <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-4 rounded-[4px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E2E0D8] pb-2 mb-3">
              <span className="font-mono text-xs font-semibold text-[#141413] uppercase">
                CASH RESOURCE STATUS
              </span>
              <button
                onClick={() => setActiveSection('Resource Manager')}
                className="text-[11px] font-mono text-[#6F6D67] hover:text-[#141413] flex items-center gap-1"
              >
                Banker's Check <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* ₹500 × 20 | ₹200 × 15 | ₹100 × 30 */}
            <div className="space-y-2 py-1 font-mono text-xs">
              <div className="flex items-center justify-between p-2 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px]">
                <span className="font-bold text-[#141413]">₹500 NOTES</span>
                <span className="font-semibold text-[#141413]">{cashAvailable.c500} Available</span>
                <span className="text-[#6F6D67] text-[11px]">₹{(cashAvailable.c500 * 500).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-2 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px]">
                <span className="font-bold text-[#141413]">₹200 NOTES</span>
                <span className="font-semibold text-[#141413]">{cashAvailable.c200} Available</span>
                <span className="text-[#6F6D67] text-[11px]">₹{(cashAvailable.c200 * 200).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-2 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px]">
                <span className="font-bold text-[#141413]">₹100 NOTES</span>
                <span className="font-semibold text-[#141413]">{cashAvailable.c100} Available</span>
                <span className="text-[#6F6D67] text-[11px]">₹{(cashAvailable.c100 * 100).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2E0D8] text-[11px] font-mono text-[#6F6D67] flex items-center justify-between">
            <span>Deadlock Prevention</span>
            <span className="text-[#15803D] font-medium">SAFE SEQUENCE VALID</span>
          </div>
        </div>
      </div>

      {/* Row 3: Kernel Event Stream (Section 11 & 26) */}
      <div className="border border-[#E2E0D8] bg-[#FFFFFF] rounded-[4px] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E2E0D8] bg-[#F4F2EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#141413]" />
            <span className="font-mono text-xs font-bold text-[#141413] uppercase tracking-wide">
              KERNEL EVENT STREAM (REAL-TIME OS DISPATCH)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={stepSimulation}
              className="text-[11px] font-mono text-[#141413] hover:underline"
            >
              + Step Next Event
            </button>
            <button
              onClick={() => setActiveSection('Simulation Logs')}
              className="text-[11px] font-mono text-[#6F6D67] hover:text-[#141413]"
            >
              View Full Log
            </button>
          </div>
        </div>

        {/* Terminal event output */}
        <div className="p-4 bg-[#141413] text-[#F9F8F6] font-mono text-xs space-y-1.5 max-h-72 overflow-y-auto">
          {events.slice(0, 10).map((ev) => (
            <div key={ev.id} className="flex items-start gap-3 leading-relaxed hover:bg-[#232220] px-1 py-0.5 rounded">
              <span className="text-[#8C8A82] select-none flex-shrink-0">{ev.timestamp}</span>
              <span
                className={`font-semibold flex-shrink-0 ${
                  ev.status === 'SAFE' || ev.status === 'SUCCESS'
                    ? 'text-[#4ADE80]'
                    : ev.status === 'WARN'
                    ? 'text-[#FBBF24]'
                    : ev.status === 'DANGER'
                    ? 'text-[#F87171]'
                    : 'text-[#93C5FD]'
                }`}
              >
                {ev.type}
              </span>
              <span className="text-[#E2E0D8] font-bold flex-shrink-0">[{ev.pid}]</span>
              <span className="text-[#D2D0C6] truncate">{ev.details}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
