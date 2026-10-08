import React from 'react';
import { useATMStore } from '../store/useATMStore';
import { Cpu, ArrowRight, CheckCircle2, AlertCircle, Clock, Shield } from 'lucide-react';
import { ProcessState } from '../types';

const PROCESS_STATES: ProcessState[] = ['NEW', 'READY', 'RUNNING', 'WAITING', 'TERMINATED'];

export const ProcessManagerView: React.FC = () => {
  const {
    processes,
    selectedPid,
    setSelectedPid,
    stepSimulation,
    addKernelEvent,
    setActiveSection,
  } = useATMStore();

  const selectedProcess = processes.find((p) => p.pid === selectedPid) || processes[0];

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="border-b border-[#E2E0D8] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-[#6F6D67]">
            COURSE OUTCOME 2 (CO2)
          </div>
          <h2 className="text-xl font-bold font-mono tracking-tight text-[#141413] mt-0.5">
            PROCESS MANAGER &amp; PROCESS CONTROL BLOCK (PCB)
          </h2>
          <p className="text-xs text-[#6F6D67] mt-1">
            Dynamic inspection of kernel process table, PCB state parameters, and state lifecycle transitions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSection('Transactions')}
            className="ctrl-btn bg-[#FFFFFF] hover:bg-[#F4F2EB] text-[#141413]"
          >
            + Swipe New Card
          </button>
        </div>
      </div>

      {/* Process State Transitions Diagram (Section 16) */}
      <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-4 rounded-[4px]">
        <div className="flex items-center justify-between border-b border-[#E2E0D8] pb-2 mb-3">
          <span className="font-mono text-xs font-bold text-[#141413] uppercase tracking-wide">
            PROCESS STATE TRANSITIONS — PID: {selectedProcess ? selectedProcess.pid : 'NONE'}
          </span>
          <span className="text-[11px] font-mono text-[#6F6D67]">
            ACTIVE STATE: <strong className="text-[#141413]">{selectedProcess?.state}</strong>
          </span>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2 py-3 px-2 bg-[#F9F8F6] border border-[#E2E0D8] rounded-[4px]">
          {PROCESS_STATES.map((st, idx) => {
            const isCurrent = selectedProcess?.state === st;
            return (
              <React.Fragment key={st}>
                <div
                  className={`px-3 py-2 rounded-[4px] border font-mono text-xs text-center transition-all ${
                    isCurrent
                      ? 'border-[#141413] bg-[#141413] text-[#F9F8F6] shadow-sm font-bold scale-105'
                      : 'border-[#E2E0D8] bg-[#FFFFFF] text-[#6F6D67]'
                  }`}
                >
                  <div className="tracking-wider">{st}</div>
                  <div className="text-[9px] font-normal opacity-75 mt-0.5">
                    {st === 'NEW' && 'Card read'}
                    {st === 'READY' && 'In CPU queue'}
                    {st === 'RUNNING' && 'CPU executing'}
                    {st === 'WAITING' && 'I/O or Cash Dispense'}
                    {st === 'TERMINATED' && 'Cleaned up'}
                  </div>
                </div>
                {idx < PROCESS_STATES.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-[#8C8A82] flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Process Table */}
        <div className="lg:col-span-2 border border-[#E2E0D8] bg-[#FFFFFF] rounded-[4px] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E2E0D8] bg-[#F4F2EB] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#141413]" />
              <span className="font-mono text-xs font-bold text-[#141413] uppercase tracking-wide">
                KERNEL PROCESS TABLE (PCB DESCRIPTORS)
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#6F6D67]">
              {processes.length} Processes Registered
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse tech-table">
              <thead>
                <tr>
                  <th>PID</th>
                  <th>Account</th>
                  <th>Priority</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>State</th>
                  <th>Burst</th>
                  <th>Memory</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {processes.map((p) => {
                  const isSelected = p.pid === selectedPid;
                  return (
                    <tr
                      key={p.pid}
                      onClick={() => setSelectedPid(p.pid)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#F4F2EB]' : 'hover:bg-[#F9F8F6]'
                      }`}
                    >
                      <td className="font-mono font-bold text-xs text-[#141413]">
                        {p.pid}
                      </td>
                      <td className="font-mono text-xs text-[#6F6D67]">{p.accountNo}</td>
                      <td>
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                            p.priority === 'VIP'
                              ? 'bg-[#141413] text-[#F9F8F6]'
                              : 'bg-[#E2E0D8] text-[#141413]'
                          }`}
                        >
                          {p.priority}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-[#141413]">{p.transactionType}</td>
                      <td className="font-mono text-xs text-[#141413]">
                        {p.amount > 0 ? `₹${p.amount.toLocaleString()}` : '—'}
                      </td>
                      <td>
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                            p.state === 'RUNNING'
                              ? 'bg-[#15803D] text-[#FFFFFF]'
                              : p.state === 'READY'
                              ? 'bg-[#F4F2EB] text-[#141413] border border-[#E2E0D8]'
                              : p.state === 'WAITING'
                              ? 'bg-[#B45309] text-[#FFFFFF]'
                              : p.state === 'TERMINATED'
                              ? 'bg-[#E2E0D8] text-[#6F6D67]'
                              : 'bg-[#FFFFFF] text-[#141413] border border-[#141413]'
                          }`}
                        >
                          {p.state}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-[#6F6D67]">{p.burstTime} ms</td>
                      <td className="font-mono text-xs font-semibold text-[#141413]">
                        {p.memoryPartition}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPid(p.pid);
                          }}
                          className={`text-[11px] font-mono underline ${
                            isSelected ? 'font-bold text-[#141413]' : 'text-[#6F6D67]'
                          }`}
                        >
                          Inspect PCB
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Dynamic PCB Inspector (Section 15) */}
        <div className="border border-[#141413] bg-[#FFFFFF] rounded-[4px] overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-4 py-3 bg-[#141413] text-[#F9F8F6] flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider">
                PROCESS CONTROL BLOCK (PCB)
              </span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#FFFFFF] text-[#141413] rounded-[3px]">
                {selectedProcess?.pid || 'P000'}
              </span>
            </div>

            {selectedProcess ? (
              <div className="p-4 font-mono text-xs space-y-2.5 divide-y divide-[#E2E0D8]">
                {/* Identification */}
                <div className="pt-2 first:pt-0 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#6F6D67]">PROCESS ID:</span>
                    <span className="font-bold text-[#141413]">{selectedProcess.pid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6F6D67]">ACCOUNT NO:</span>
                    <span className="font-semibold text-[#141413]">{selectedProcess.accountNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6F6D67]">CARDHOLDER:</span>
                    <span className="text-[#141413] truncate max-w-[150px]">{selectedProcess.holderName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6F6D67]">PIN STATUS:</span>
                    <span
                      className={`font-semibold ${
                        selectedProcess.pinStatus === 'VERIFIED' ? 'text-[#15803D]' : 'text-[#B91C1C]'
                      }`}
                    >
                      {selectedProcess.pinStatus}
                    </span>
                  </div>
                </div>

                {/* Scheduling Parameters */}
                <div className="pt-2.5 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#6F6D67]">CURRENT STATE:</span>
                    <span className="font-bold text-[#141413]">{selectedProcess.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6F6D67]">PRIORITY:</span>
                    <span className="font-bold text-[#141413]">{selectedProcess.priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6F6D67]">TRANSACTION:</span>
                    <span className="text-[#141413]">{selectedProcess.transactionType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6F6D67]">AMOUNT:</span>
                    <span className="font-semibold text-[#141413]">
                      ₹{selectedProcess.amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Timing Metrics */}
                <div className="pt-2.5 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#6F6D67]">ARRIVAL TIME:</span>
                    <span className="text-[#141413]">{selectedProcess.arrivalTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6F6D67]">BURST TIME:</span>
                    <span className="text-[#141413]">{selectedProcess.burstTime} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6F6D67]">WAITING TIME:</span>
                    <span className="text-[#141413]">{selectedProcess.waitingTime} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6F6D67]">COMPLETION TIME:</span>
                    <span className="text-[#141413]">{selectedProcess.completionTime || 'IN PROGRESS'}</span>
                  </div>
                </div>

                {/* Hardware & Memory Binding */}
                <div className="pt-2.5 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#6F6D67]">MEMORY PARTITION:</span>
                    <span className="font-bold text-[#141413]">{selectedProcess.memoryPartition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6F6D67]">HARDWARE RESOURCE:</span>
                    <span className="text-[#141413]">{selectedProcess.resource}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6F6D67]">INDEXED DATA BLOCK:</span>
                    <span className="font-bold text-[#141413]">{selectedProcess.dataBlock}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-xs font-mono text-[#6F6D67]">No process selected.</div>
            )}
          </div>

          <div className="p-3 bg-[#F4F2EB] border-t border-[#E2E0D8] text-[11px] font-mono text-[#6F6D67]">
            Dynamic PCB synchronized with embedded kernel memory tables.
          </div>
        </div>
      </div>
    </div>
  );
};
