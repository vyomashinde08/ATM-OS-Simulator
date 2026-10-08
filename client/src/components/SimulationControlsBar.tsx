import React from 'react';
import { useATMStore } from '../store/useATMStore';
import { Play, Pause, StepForward, RotateCcw, FastForward, Info } from 'lucide-react';

const STEP_LABELS = [
  'CARD INSERTED',
  'PROCESS CREATED',
  'PCB INITIALIZED',
  'PROCESS READY',
  'CPU DISPATCH',
  'RESOURCE CHECK',
  'MEMORY ALLOCATION',
  'TRANSACTION EXECUTION',
  'LOG CREATION',
  'PROCESS TERMINATED',
];

export const SimulationControlsBar: React.FC = () => {
  const {
    isRunning,
    startSimulation,
    pauseSimulation,
    stepSimulation,
    resetSimulation,
    runCompleteTransactionLifecycle,
    simulationSpeed,
    setSimulationSpeed,
    currentStepIndex,
    lifecyclePid,
    whatIsHappening,
  } = useATMStore();

  return (
    <div className="border-b border-[#E2E0D8] bg-[#FFFFFF] px-6 py-3 select-none">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Controls: Start, Pause, Step, Reset, Complete Run */}
        <div className="flex items-center flex-wrap gap-2">
          {!isRunning ? (
            <button
              onClick={startSimulation}
              className="ctrl-btn ctrl-btn-primary"
              title="Start Continuous Simulation"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              START
            </button>
          ) : (
            <button
              onClick={pauseSimulation}
              className="ctrl-btn bg-[#F4F2EB] text-[#B45309] border-[#B45309]"
              title="Pause Simulation"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              PAUSE
            </button>
          )}

          <button
            onClick={stepSimulation}
            disabled={isRunning}
            className="ctrl-btn border-[#141413] bg-[#F4F2EB] text-[#141413] font-semibold hover:bg-[#EAE8DF]"
            title="Advance exactly one OS logical event"
          >
            <StepForward className="w-3.5 h-3.5" />
            STEP {currentStepIndex > 0 ? `(${currentStepIndex}/10)` : ''}
          </button>

          <button
            onClick={runCompleteTransactionLifecycle}
            disabled={isRunning}
            className="ctrl-btn bg-[#FFFFFF] hover:bg-[#F4F2EB] text-[#141413]"
            title="Execute complete card swipe to process termination flow"
          >
            <FastForward className="w-3.5 h-3.5" />
            RUN COMPLETE TRANSACTION
          </button>

          <button
            onClick={resetSimulation}
            className="ctrl-btn bg-[#FFFFFF] hover:bg-[#F4F2EB] text-[#6F6D67]"
            title="Reset Simulation to Initial Seed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET
          </button>

          {/* Speed slider */}
          <div className="flex items-center gap-2 pl-3 ml-2 border-l border-[#E2E0D8] text-[11px] font-mono text-[#6F6D67]">
            <span>SPEED:</span>
            <span className="text-[10px]">Slow</span>
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={2200 - simulationSpeed} // invert so slider right is faster
              onChange={(e) => setSimulationSpeed(2200 - Number(e.target.value))}
              className="w-20 accent-[#141413] cursor-pointer"
            />
            <span className="text-[10px]">Fast</span>
          </div>
        </div>

        {/* 10-Step Progress Tracker */}
        <div className="flex items-center gap-1 font-mono text-[10px] overflow-x-auto py-1">
          <span className="text-[#6F6D67] mr-1 hidden sm:inline">LIFECYCLE ({lifecyclePid || 'P004'}):</span>
          {STEP_LABELS.map((label, idx) => {
            const stepNum = idx + 1;
            const isCurrent = currentStepIndex === stepNum;
            const isDone = currentStepIndex > stepNum;

            return (
              <span
                key={label}
                title={`Step ${stepNum}: ${label}`}
                className={`px-1.5 py-0.5 rounded-[3px] border transition-colors ${
                  isCurrent
                    ? 'border-[#141413] bg-[#141413] text-[#F9F8F6] font-bold'
                    : isDone
                    ? 'border-[#15803D] bg-[#F0FDF4] text-[#15803D]'
                    : 'border-[#E2E0D8] bg-[#F4F2EB] text-[#8C8A82]'
                }`}
              >
                S{stepNum}
              </span>
            );
          })}
        </div>
      </div>

      {/* "WHAT IS HAPPENING?" Educational Explanation Panel */}
      <div className="mt-2.5 p-2.5 bg-[#F9F8F6] border border-[#E2E0D8] rounded-[4px] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#6F6D67] flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-mono font-bold text-[#141413] tracking-wide uppercase mr-2">
            WHAT IS HAPPENING? — {whatIsHappening.title}
          </span>
          <span className="text-[#141413] leading-relaxed">
            {whatIsHappening.explanation}
          </span>
        </div>
      </div>
    </div>
  );
};
