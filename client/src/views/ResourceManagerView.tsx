import React, { useState } from 'react';
import { useATMStore } from '../store/useATMStore';
import { Wallet, ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2, Play } from 'lucide-react';
import { checkSafety } from '../algorithms/bankers';

export const ResourceManagerView: React.FC = () => {
  const {
    cashAvailable,
    bankerState,
    recomputeBankerState,
    requestCashForProcess,
    processes,
  } = useATMStore();

  const [testPid, setTestPid] = useState<string>('P004');
  const [req500, setReq500] = useState<number>(4);
  const [req200, setReq200] = useState<number>(2);
  const [req100, setReq100] = useState<number>(0);
  const [requestResult, setRequestResult] = useState<{ approved: boolean; reason: string } | null>(null);

  const activePids = Object.keys(bankerState.need);

  const handleTestRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const result = requestCashForProcess(testPid, { c500: req500, c200: req200, c100: req100 });
    setRequestResult(result);
  };

  const handleRunSafetyCheck = () => {
    recomputeBankerState();
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
            CASH RESOURCE MANAGER — BANKER'S ALGORITHM
          </h2>
          <p className="text-xs text-[#6F6D67] mt-1">
            Deadlock avoidance algorithm treating physical cash denominations as constrained operating system resources.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunSafetyCheck}
            className="ctrl-btn ctrl-btn-primary"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            RE-EVALUATE SAFETY STATE
          </button>
        </div>
      </div>

      {/* Available Resources Vector (Section 20) */}
      <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-4 rounded-[4px]">
        <div className="flex items-center justify-between border-b border-[#E2E0D8] pb-2 mb-3">
          <span className="font-mono text-xs font-bold text-[#141413] uppercase tracking-wide flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#141413]" />
            AVAILABLE CASH RESOURCE VECTOR (VAULT INVENTORY)
          </span>
          <span className="text-[11px] font-mono text-[#6F6D67]">
            TOTAL: ₹{(cashAvailable.c500 * 500 + cashAvailable.c200 * 200 + cashAvailable.c100 * 100).toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px] flex items-center justify-between">
            <div>
              <span className="text-[#6F6D67] text-[11px] uppercase block">RESOURCE R0 (₹500 NOTES)</span>
              <span className="text-xl font-bold text-[#141413]">{cashAvailable.c500} Available</span>
            </div>
            <span className="text-[#6F6D67]">₹{(cashAvailable.c500 * 500).toLocaleString()}</span>
          </div>

          <div className="p-3 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px] flex items-center justify-between">
            <div>
              <span className="text-[#6F6D67] text-[11px] uppercase block">RESOURCE R1 (₹200 NOTES)</span>
              <span className="text-xl font-bold text-[#141413]">{cashAvailable.c200} Available</span>
            </div>
            <span className="text-[#6F6D67]">₹{(cashAvailable.c200 * 200).toLocaleString()}</span>
          </div>

          <div className="p-3 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px] flex items-center justify-between">
            <div>
              <span className="text-[#6F6D67] text-[11px] uppercase block">RESOURCE R2 (₹100 NOTES)</span>
              <span className="text-xl font-bold text-[#141413]">{cashAvailable.c100} Available</span>
            </div>
            <span className="text-[#6F6D67]">₹{(cashAvailable.c100 * 100).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Banker Matrices: Max, Allocation, Need */}
      <div className="border border-[#E2E0D8] bg-[#FFFFFF] rounded-[4px] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E2E0D8] bg-[#F4F2EB] flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-[#141413] uppercase tracking-wide">
            RESOURCE MATRICES: ALLOCATION, MAXIMUM &amp; REMAINING NEED [₹500, ₹200, ₹100]
          </span>
          <span className="text-[11px] font-mono text-[#6F6D67]">
            FORMULA: Need[i] = Max[i] - Allocation[i]
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse tech-table">
            <thead>
              <tr>
                <th>PID</th>
                <th>Priority</th>
                <th>Allocation [R0, R1, R2]</th>
                <th>Maximum [R0, R1, R2]</th>
                <th>Remaining Need [R0, R1, R2]</th>
                <th className="text-right">Condition</th>
              </tr>
            </thead>
            <tbody>
              {activePids.map((pid) => {
                const alloc = bankerState.allocation[pid] || { c500: 0, c200: 0, c100: 0 };
                const max = bankerState.max[pid] || { c500: 0, c200: 0, c100: 0 };
                const need = bankerState.need[pid] || { c500: 0, c200: 0, c100: 0 };
                const canSatisfy =
                  need.c500 <= cashAvailable.c500 &&
                  need.c200 <= cashAvailable.c200 &&
                  need.c100 <= cashAvailable.c100;

                return (
                  <tr key={pid} className="hover:bg-[#F9F8F6]">
                    <td className="font-mono font-bold text-xs text-[#141413]">{pid}</td>
                    <td>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#E2E0D8] text-[#141413]">
                        {processes.find((p) => p.pid === pid)?.priority || 'REGULAR'}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-[#141413]">
                      [{alloc.c500}, {alloc.c200}, {alloc.c100}]
                    </td>
                    <td className="font-mono text-xs text-[#6F6D67]">
                      [{max.c500}, {max.c200}, {max.c100}]
                    </td>
                    <td className="font-mono text-xs font-semibold text-[#141413]">
                      [{need.c500}, {need.c200}, {need.c100}]
                    </td>
                    <td className="text-right">
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold ${
                          canSatisfy
                            ? 'bg-[#F0FDF4] text-[#15803D] border border-[#15803D]'
                            : 'bg-[#FEF2F2] text-[#B91C1C] border border-[#B91C1C]'
                        }`}
                      >
                        {canSatisfy ? 'Need ≤ Work' : 'Need > Work'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety Evaluation & Safe Sequence (Section 20) */}
      <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-5 rounded-[4px] space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E0D8] pb-2">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wide">
            {bankerState.isSafe ? (
              <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-[#B91C1C]" />
            )}
            <span>
              SYSTEM STATE STATUS: {bankerState.isSafe ? 'SAFE STATE' : 'UNSAFE STATE (DEADLOCK RISK)'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#6F6D67]">SAFETY ALGORITHM OUTPUT</span>
        </div>

        {/* Safe Sequence Display */}
        {bankerState.isSafe ? (
          <div>
            <div className="text-[11px] font-mono uppercase text-[#6F6D67] mb-1.5">
              CALCULATED SAFE EXECUTION SEQUENCE:
            </div>
            <div className="flex items-center gap-2 overflow-x-auto py-2">
              {bankerState.safeSequence.map((pid, idx) => (
                <React.Fragment key={pid}>
                  <div className="px-3 py-2 border border-[#141413] bg-[#141413] text-[#F9F8F6] rounded-[4px] font-mono text-xs font-bold">
                    {pid}
                  </div>
                  {idx < bankerState.safeSequence.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-[#6F6D67] flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="text-xs font-mono text-[#15803D] mt-2">
              {bankerState.lastEvaluation}
            </div>
          </div>
        ) : (
          <div className="p-3 border border-[#B91C1C] bg-[#FEF2F2] rounded-[4px] text-xs font-mono text-[#B91C1C]">
            {bankerState.lastEvaluation}
          </div>
        )}
      </div>

      {/* Interactive Resource Request Simulator (Section 20 & 36) */}
      <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-5 rounded-[4px]">
        <div className="flex items-center justify-between border-b border-[#E2E0D8] pb-3 mb-4">
          <span className="font-mono text-xs font-bold text-[#141413] uppercase tracking-wide">
            SIMULATE LIVE CASH RESOURCE REQUEST (sys_request_resource)
          </span>
          <span className="text-[11px] font-mono text-[#6F6D67]">DEADLOCK TESTER</span>
        </div>

        <form onSubmit={handleTestRequest} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#6F6D67] mb-1">
                REQUESTING PROCESS
              </label>
              <select
                value={testPid}
                onChange={(e) => setTestPid(e.target.value)}
                className="w-full border border-[#E2E0D8] bg-[#FFFFFF] px-3 py-2 text-xs font-mono text-[#141413] rounded-[4px] focus:outline-none"
              >
                {activePids.map((pid) => (
                  <option key={pid} value={pid}>
                    {pid} ({processes.find((p) => p.pid === pid)?.priority || 'REGULAR'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#6F6D67] mb-1">
                ₹500 NOTES REQUESTED
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={req500}
                onChange={(e) => setReq500(Number(e.target.value))}
                className="w-full border border-[#E2E0D8] bg-[#FFFFFF] px-3 py-2 text-xs font-mono text-[#141413] rounded-[4px] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#6F6D67] mb-1">
                ₹200 NOTES REQUESTED
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={req200}
                onChange={(e) => setReq200(Number(e.target.value))}
                className="w-full border border-[#E2E0D8] bg-[#FFFFFF] px-3 py-2 text-xs font-mono text-[#141413] rounded-[4px] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#6F6D67] mb-1">
                ₹100 NOTES REQUESTED
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={req100}
                onChange={(e) => setReq100(Number(e.target.value))}
                className="w-full border border-[#E2E0D8] bg-[#FFFFFF] px-3 py-2 text-xs font-mono text-[#141413] rounded-[4px] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="text-[11px] font-mono text-[#6F6D67]">
              Evaluates: 1. Request ≤ Need, 2. Request ≤ Available, 3. Speculative Safety Check
            </div>
            <button
              type="submit"
              className="ctrl-btn ctrl-btn-primary px-4 py-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              EVALUATE RESOURCE REQUEST
            </button>
          </div>
        </form>

        {/* Request Result Display */}
        {requestResult && (
          <div
            className={`mt-4 p-4 border rounded-[4px] font-mono text-xs ${
              requestResult.approved
                ? 'border-[#15803D] bg-[#F0FDF4] text-[#15803D]'
                : 'border-[#B91C1C] bg-[#FEF2F2] text-[#B91C1C]'
            }`}
          >
            <div className="font-bold uppercase tracking-wider mb-1">
              {requestResult.approved ? 'RESOURCE REQUEST APPROVED' : 'RESOURCE REQUEST BLOCKED'}
            </div>
            <div className="text-[11px] leading-relaxed">
              {requestResult.reason}
            </div>
          </div>
        )}
      </div>

      {/* Educational Explanation (Section 29) */}
      <div className="p-4 bg-[#F9F8F6] border border-[#E2E0D8] rounded-[4px] text-xs font-mono text-[#141413] leading-relaxed">
        <span className="font-bold">WHAT IS HAPPENING? </span>
        Why was the request approved or blocked? An ATM cash vault has finite physical paper bills. 
        If multiple customers request cash concurrently, simply dispensing on demand could drain specific bill denominations, 
        leaving another in-progress transaction incapable of completing (deadlock). Banker’s Algorithm prevents this by verifying 
        that even in the worst-case maximum demand scenario, at least one safe completion sequence exists before releasing a single rupee.
      </div>
    </div>
  );
};
