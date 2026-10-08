import React from 'react';
import { Server, ShieldCheck, Clock, Cpu, CheckCircle2 } from 'lucide-react';

const OS_SERVICES = [
  { service: 'Process Management', atmUsage: 'Manage individual card swipe transactions as isolated execution threads', co: 'CO2' },
  { service: 'CPU Scheduling', atmUsage: 'Decide transaction execution order (Priority for VIPs, Round Robin for multi-lane ATM clusters)', co: 'CO3' },
  { service: 'Memory Management', atmUsage: 'Allocate and partition fixed 64 KB buffer memory, execute FIFO page replacement under load', co: 'CO4' },
  { service: 'File Management', atmUsage: 'Maintain immutable audit transaction logs using Indexed File Allocation for instantaneous statement lookup', co: 'CO5' },
  { service: 'I/O Management', atmUsage: 'Hardware device drivers for magnetic card reader, encrypted PIN pad, thermal receipt printer, cash dispenser', co: 'CO1' },
  { service: 'Security Subsystem', atmUsage: 'Tamper-resistant cryptographic PIN verification, triple-DES hardware module interfacing', co: 'CO1' },
  { service: 'Resource Management', atmUsage: 'Deadlock avoidance via Banker’s Algorithm for cash notes (₹500, ₹200, ₹100 denominations)', co: 'CO3' },
  { service: 'Interrupt Handling', atmUsage: 'Asynchronous hardware interrupt dispatching on card insertion, cash jam, or timeout', co: 'CO1' },
];

const CHARACTERISTICS = [
  { title: 'Deterministic Response', desc: 'Transaction deadlines and hardware dispensing timings are strictly bounded to prevent inconsistent financial state.' },
  { title: 'High Reliability & Fault Tolerance', desc: 'Continuous 24/7/365 uptime with zero unhandled memory leaks; automatic kernel state rollback if power fails.' },
  { title: 'Hardware Resource Constraints', desc: 'Compact embedded memory partitions (e.g. 256 KB RAM) requiring disciplined FIFO buffer recycling.' },
  { title: 'Real-Time Event Processing', desc: 'Prioritizes time-critical user inputs, card eject interrupts, and vault sensor feedback over background sync tasks.' },
  { title: 'Dedicated Device Control', desc: 'Direct kernel-level hardware control over high-voltage currency transport motors, optical note counters, and shutter gates.' },
  { title: 'Strict Physical & Logical Security', desc: 'Dedicated encryption processors, segmented memory partitions to prevent cross-transaction data leakage.' },
];

export const OSOverviewView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="border-b border-[#E2E0D8] pb-4">
        <div className="text-[11px] font-mono tracking-widest uppercase text-[#6F6D67]">
          COURSE OUTCOME 1 (CO1)
        </div>
        <h2 className="text-xl font-bold font-mono tracking-tight text-[#141413] mt-0.5">
          EMBEDDED OPERATING SYSTEM ARCHITECTURE
        </h2>
        <p className="text-xs text-[#6F6D67] mt-1">
          Classification, real-time operating principles, and OS kernel services powering automated teller machines.
        </p>
      </div>

      {/* Embedded OS Specification Grid (Section 12) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-3.5 rounded-[4px]">
          <div className="text-[10px] font-mono text-[#6F6D67] uppercase">SYSTEM TYPE</div>
          <div className="text-sm font-mono font-bold text-[#141413] mt-1">Embedded OS</div>
          <div className="text-[11px] text-[#6F6D67] mt-0.5">Tailored RTOS Kernel</div>
        </div>

        <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-3.5 rounded-[4px]">
          <div className="text-[10px] font-mono text-[#6F6D67] uppercase">DEVICE</div>
          <div className="text-sm font-mono font-bold text-[#141413] mt-1">Automated Teller</div>
          <div className="text-[11px] text-[#6F6D67] mt-0.5">NCR Real-Time Hardware</div>
        </div>

        <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-3.5 rounded-[4px]">
          <div className="text-[10px] font-mono text-[#6F6D67] uppercase">SYSTEM CLASS</div>
          <div className="text-sm font-mono font-bold text-[#15803D] mt-1">Real-Time System</div>
          <div className="text-[11px] text-[#6F6D67] mt-0.5">Deterministic Deadlines</div>
        </div>

        <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-3.5 rounded-[4px]">
          <div className="text-[10px] font-mono text-[#6F6D67] uppercase">RESPONSE REQUIREMENT</div>
          <div className="text-sm font-mono font-bold text-[#B45309] mt-1">Time Critical</div>
          <div className="text-[11px] text-[#6F6D67] mt-0.5">Sub-second I/O cycles</div>
        </div>

        <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-3.5 rounded-[4px]">
          <div className="text-[10px] font-mono text-[#6F6D67] uppercase">PRIMARY OBJECTIVE</div>
          <div className="text-sm font-mono font-bold text-[#141413] mt-1">Reliable Execution</div>
          <div className="text-[11px] text-[#6F6D67] mt-0.5">Zero financial inconsistencies</div>
        </div>
      </div>

      {/* Architectural Narrative: Why ATM is an Embedded Real-Time System */}
      <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-5 rounded-[4px] space-y-3">
        <h3 className="font-mono text-xs font-bold text-[#141413] uppercase tracking-wide flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#141413]" />
          WHY AN ATM IS CLASSIFIED AS AN EMBEDDED REAL-TIME OPERATING SYSTEM
        </h3>
        <p className="text-xs text-[#141413] leading-relaxed">
          An Automated Teller Machine is not merely a client computer running banking software. At its core, an ATM is a dedicated 
          <strong> cyber-physical embedded system</strong> governed by a real-time embedded operating system. Unlike general-purpose 
          desktops that optimize for average-case throughput, the ATM OS is engineered for <strong>predictable, deterministic execution</strong>.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 font-mono text-xs">
          <div className="p-3 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px]">
            <span className="font-bold text-[#141413] block mb-1">1. Hard Deadlines &amp; Motor Timings</span>
            <span className="text-[#6F6D67] text-[11px]">
              Note dispensing rollers must count and transport physical paper currency within tight millisecond windows. An OS scheduling delay causes physical paper jams or double dispensing.
            </span>
          </div>
          <div className="p-3 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px]">
            <span className="font-bold text-[#141413] block mb-1">2. Hardware Interrupt Architecture</span>
            <span className="text-[#6F6D67] text-[11px]">
              External interrupts from card capture solenoids, optical escrow sensors, and intrusion detectors demand preemptive handling without starvation.
            </span>
          </div>
          <div className="p-3 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px]">
            <span className="font-bold text-[#141413] block mb-1">3. Atomic Transaction Integrity</span>
            <span className="text-[#6F6D67] text-[11px]">
              The OS guarantees ACID atomicity between physical cash release and database log updates, ensuring account debits never desynchronize from hardware dispensing.
            </span>
          </div>
        </div>
      </div>

      {/* OS Services Technical Table (Section 13) */}
      <div className="border border-[#E2E0D8] bg-[#FFFFFF] rounded-[4px] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E2E0D8] bg-[#F4F2EB] flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-[#141413] uppercase tracking-wide">
            TECHNICAL MATRIX: EMBEDDED OS SERVICES VS. ATM HARDWARE USAGE
          </span>
          <span className="text-[11px] font-mono text-[#6F6D67]">CO1 - CO5 MAPPING</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse tech-table">
            <thead>
              <tr>
                <th className="w-44">OS Service</th>
                <th>ATM Specific Implementation &amp; Hardware Usage</th>
                <th className="w-24 text-right">Academic CO</th>
              </tr>
            </thead>
            <tbody>
              {OS_SERVICES.map((srv) => (
                <tr key={srv.service} className="hover:bg-[#F9F8F6] transition-colors">
                  <td className="font-mono font-bold text-xs text-[#141413]">{srv.service}</td>
                  <td className="text-xs text-[#141413]">{srv.atmUsage}</td>
                  <td className="text-right">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-[#E2E0D8] bg-[#F4F2EB] text-[#141413] font-semibold">
                      {srv.co}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Embedded OS Characteristics (Section 13) */}
      <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-5 rounded-[4px]">
        <h3 className="font-mono text-xs font-bold text-[#141413] uppercase tracking-wide mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#141413]" />
          KEY EMBEDDED OS CHARACTERISTICS DEMONSTRATED IN ATM-OS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CHARACTERISTICS.map((c) => (
            <div key={c.title} className="p-3 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px]">
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#141413]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
                {c.title}
              </div>
              <p className="text-[11px] text-[#6F6D67] mt-1.5 leading-relaxed">
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
