import React, { useState } from 'react';
import { useATMStore } from '../store/useATMStore';
import { HardDrive, ArrowRight, RotateCcw, AlertTriangle, CheckCircle2, Play } from 'lucide-react';
import { calculateFIFORatios } from '../algorithms/fifo';

export const MemoryManagerView: React.FC = () => {
  const {
    memoryPartitions,
    fifoState,
    referencePage,
    resetFIFO,
  } = useATMStore();

  const [inputPid, setInputPid] = useState<string>('P004');
  const [lastStepExplanation, setLastStepExplanation] = useState<string | null>(null);

  const totalKb = 256;
  const occupiedCount = memoryPartitions.filter((m) => m.occupiedByPid !== null).length;
  const usedKb = occupiedCount * 64;
  const freeKb = totalKb - usedKb;

  const ratios = calculateFIFORatios(fifoState.pageHits, fifoState.pageFaults);

  const handleReference = (pidToRef: string) => {
    const result = referencePage(pidToRef);
    setLastStepExplanation(result.explanation);
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="border-b border-[#E2E0D8] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-[#6F6D67]">
            COURSE OUTCOME 4 (CO4)
          </div>
          <h2 className="text-xl font-bold font-mono tracking-tight text-[#141413] mt-0.5">
            MEMORY MANAGEMENT &amp; FIFO PAGE REPLACEMENT
          </h2>
          <p className="text-xs text-[#6F6D67] mt-1">
            Transaction buffer partition allocation and deterministic FIFO buffer recycling under capacity pressure.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetFIFO}
            className="ctrl-btn bg-[#FFFFFF] hover:bg-[#F4F2EB] text-[#6F6D67]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET BUFFER
          </button>
        </div>
      </div>

      {/* Memory Summary Cards (Section 21) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-4 rounded-[4px]">
          <div className="text-[10px] font-mono text-[#6F6D67] uppercase">TOTAL TRANSACTION MEMORY</div>
          <div className="text-2xl font-mono font-bold text-[#141413] mt-1">{totalKb} KB</div>
          <div className="text-[11px] font-mono text-[#6F6D67] mt-0.5">4 Fixed Partitions × 64 KB</div>
        </div>

        <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-4 rounded-[4px]">
          <div className="text-[10px] font-mono text-[#6F6D67] uppercase">USED BUFFER MEMORY</div>
          <div className="text-2xl font-mono font-bold text-[#141413] mt-1">{usedKb} KB</div>
          <div className="text-[11px] font-mono text-[#15803D] mt-0.5">
            {Math.round((usedKb / totalKb) * 100)}% Occupancy
          </div>
        </div>

        <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-4 rounded-[4px]">
          <div className="text-[10px] font-mono text-[#6F6D67] uppercase">FREE BUFFER MEMORY</div>
          <div className="text-2xl font-mono font-bold text-[#6F6D67] mt-1">{freeKb} KB</div>
          <div className="text-[11px] font-mono text-[#6F6D67] mt-0.5">Available for new swipes</div>
        </div>
      </div>

      {/* Partition Map (Section 21 diagram) */}
      <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-5 rounded-[4px]">
        <div className="flex items-center justify-between border-b border-[#E2E0D8] pb-2 mb-4">
          <span className="font-mono text-xs font-bold text-[#141413] uppercase tracking-wide flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#141413]" />
            ATM TRANSACTION MEMORY PARTITION SCHEME
          </span>
          <span className="text-[11px] font-mono text-[#6F6D67]">FIXED CONTIGUOUS ALLOCATION</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
          {memoryPartitions.map((m) => (
            <div
              key={m.id}
              className={`p-4 border rounded-[4px] flex flex-col justify-between h-28 ${
                m.occupiedByPid
                  ? 'border-[#141413] bg-[#F4F2EB]'
                  : 'border-dashed border-[#E2E0D8] bg-[#FFFFFF]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#141413]">{m.id}</span>
                <span className="text-[10px] text-[#6F6D67]">{m.sizeKb} KB</span>
              </div>
              <div className="my-auto text-center">
                {m.occupiedByPid ? (
                  <div>
                    <span className="px-2 py-1 bg-[#141413] text-[#F9F8F6] rounded text-xs font-bold">
                      {m.occupiedByPid}
                    </span>
                    <span className="text-[10px] text-[#6F6D67] block mt-1">Transaction Active</span>
                  </div>
                ) : (
                  <span className="text-xs text-[#8C8A82] uppercase">EMPTY</span>
                )}
              </div>
              <div className="text-[10px] text-[#6F6D67] text-right">
                {m.occupiedByPid ? 'LOCKED' : 'AVAILABLE'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FIFO Page Replacement Engine (Section 22) */}
      <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-5 rounded-[4px] space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E0D8] pb-2">
          <span className="font-mono text-xs font-bold text-[#141413] uppercase tracking-wide">
            FIFO PAGE REPLACEMENT SIMULATOR (BUFFER CACHE)
          </span>
          <span className="text-[11px] font-mono text-[#6F6D67]">3 PHYSICAL MEMORY FRAMES</span>
        </div>

        {/* Reference String */}
        <div>
          <div className="text-[11px] font-mono uppercase text-[#6F6D67] mb-1.5">
            PAGE REFERENCE STRING:
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto py-2 font-mono text-xs">
            {fifoState.referenceString.length === 0 ? (
              <span className="text-[#6F6D67]">No memory references recorded yet.</span>
            ) : (
              fifoState.referenceString.map((ref, idx) => (
                <React.Fragment key={idx}>
                  <span
                    className={`px-2 py-1 border rounded-[3px] ${
                      idx === fifoState.referenceString.length - 1
                        ? 'border-[#141413] bg-[#141413] text-[#F9F8F6] font-bold'
                        : 'border-[#E2E0D8] bg-[#F4F2EB] text-[#141413]'
                    }`}
                  >
                    {ref}
                  </span>
                  {idx < fifoState.referenceString.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-[#8C8A82] flex-shrink-0" />
                  )}
                </React.Fragment>
              ))
            )}
          </div>
        </div>

        {/* 3 Physical Frames */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs pt-2">
          {fifoState.frames.map((framePid, idx) => {
            const isVictim = fifoState.victimQueue.length > 0 && fifoState.victimQueue[0] === framePid;
            return (
              <div
                key={idx}
                className={`p-3.5 border rounded-[4px] relative ${
                  isVictim
                    ? 'border-[#B45309] bg-[#FFFBEB]'
                    : framePid
                    ? 'border-[#E2E0D8] bg-[#F9F8F6]'
                    : 'border-dashed border-[#E2E0D8] bg-[#FFFFFF]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-[#6F6D67]">
                  <span>FRAME {idx + 1}</span>
                  {isVictim && (
                    <span className="text-[#B45309] font-bold text-[10px] uppercase">
                      NEXT VICTIM
                    </span>
                  )}
                </div>
                <div className="text-xl font-bold text-[#141413] my-2 text-center">
                  {framePid || '—'}
                </div>
                <div className="text-[10px] text-[#6F6D67] text-center">
                  {framePid ? 'Resident Page' : 'Unallocated Slot'}
                </div>
              </div>
            );
          })}
        </div>

        {/* FIFO Queue Order: Oldest -> Next Victim -> Newest */}
        <div className="p-3 bg-[#F4F2EB] border border-[#E2E0D8] rounded-[4px] font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] text-[#6F6D67] mb-2">
            <span>FIFO EVICTION ORDER (OLDEST AT FRONT)</span>
            <span>NEWEST AT TAIL</span>
          </div>
          <div className="flex items-center gap-2">
            {fifoState.victimQueue.length === 0 ? (
              <span className="text-[#6F6D67]">Queue empty</span>
            ) : (
              fifoState.victimQueue.map((pid, idx) => (
                <div key={pid} className="flex items-center gap-2">
                  <div className="px-2.5 py-1.5 border border-[#141413] bg-[#FFFFFF] rounded text-center">
                    <span className="font-bold text-[#141413]">{pid}</span>
                    {idx === 0 && (
                      <span className="block text-[9px] text-[#B45309] font-bold">NEXT VICTIM</span>
                    )}
                  </div>
                  {idx < fifoState.victimQueue.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-[#8C8A82]" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Performance Metrics: Hits, Faults, Ratios */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs pt-2">
          <div className="p-3 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px]">
            <span className="text-[10px] text-[#6F6D67] uppercase block">PAGE HITS</span>
            <span className="text-xl font-bold text-[#15803D]">{fifoState.pageHits}</span>
          </div>

          <div className="p-3 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px]">
            <span className="text-[10px] text-[#6F6D67] uppercase block">PAGE FAULTS</span>
            <span className="text-xl font-bold text-[#B45309]">{fifoState.pageFaults}</span>
          </div>

          <div className="p-3 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px]">
            <span className="text-[10px] text-[#6F6D67] uppercase block">REPLACEMENTS</span>
            <span className="text-xl font-bold text-[#141413]">{fifoState.replacements}</span>
          </div>

          <div className="p-3 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px]">
            <span className="text-[10px] text-[#6F6D67] uppercase block">HIT RATIO</span>
            <span className="text-xl font-bold text-[#141413]">{ratios.hitRatio}%</span>
          </div>

          <div className="p-3 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px]">
            <span className="text-[10px] text-[#6F6D67] uppercase block">FAULT RATIO</span>
            <span className="text-xl font-bold text-[#141413]">{ratios.faultRatio}%</span>
          </div>
        </div>

        {/* Interactive Reference Trigger */}
        <div className="pt-3 border-t border-[#E2E0D8] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-[#6F6D67]">TEST PAGE REFERENCE:</span>
            {['P001', 'P002', 'P003', 'P004', 'P005', 'P006'].map((pid) => (
              <button
                key={pid}
                onClick={() => handleReference(pid)}
                className="px-2.5 py-1 border border-[#E2E0D8] bg-[#FFFFFF] hover:border-[#141413] rounded font-bold text-[#141413]"
              >
                {pid}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <input
              type="text"
              placeholder="Custom PID"
              value={inputPid}
              onChange={(e) => setInputPid(e.target.value.toUpperCase())}
              className="w-24 border border-[#E2E0D8] px-2 py-1 rounded text-center font-bold text-[#141413]"
            />
            <button
              onClick={() => handleReference(inputPid)}
              className="ctrl-btn ctrl-btn-primary"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              REFERENCE PAGE
            </button>
          </div>
        </div>

        {/* Live Step Explanation */}
        {lastStepExplanation && (
          <div className="p-3 bg-[#F9F8F6] border border-[#141413] rounded-[4px] font-mono text-xs text-[#141413]">
            {lastStepExplanation}
          </div>
        )}
      </div>

      {/* Educational Explanation (Section 29) */}
      <div className="p-4 bg-[#F9F8F6] border border-[#E2E0D8] rounded-[4px] text-xs font-mono text-[#141413] leading-relaxed">
        <span className="font-bold">WHAT IS HAPPENING? </span>
        Why was the victim page removed? When all transaction buffer partitions are occupied and a new transaction process arrives, 
        the OS cannot pause hardware execution. The FIFO algorithm identifies the page that has resided in memory the longest 
        and replaces it with the newly referenced transaction buffer page.
      </div>
    </div>
  );
};
