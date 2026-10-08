import React from 'react';
import { useATMStore } from '../store/useATMStore';
import { Shield, Activity, RefreshCw, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    operatorScore,
    operatorLevel,
    operatorLevelTitle,
    systemHealth,
    simulationMode,
    setSimulationMode,
    loadScenario,
    resetSimulation,
  } = useATMStore();

  return (
    <header className="border-b border-[#E2E0D8] bg-[#FFFFFF] px-6 py-3 select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Project title & subtitle */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-lg font-bold tracking-tight text-[#141413] m-0 p-0">
              ATM-OS
            </h1>
            <span className="text-xs px-2 py-0.5 border border-[#E2E0D8] bg-[#F4F2EB] font-mono text-[#6F6D67] rounded-[4px]">
              EMBEDDED KERNEL 2.4-RT
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#15803D]">
              <span className="w-2 h-2 rounded-full bg-[#15803D] inline-block animate-pulse" />
              SYSTEM ONLINE
            </div>
          </div>
          <p className="text-[12px] text-[#6F6D67] mt-0.5">
            An interactive embedded operating system laboratory for ATM transaction &amp; resource management.
          </p>
        </div>

        {/* Right: Technical status, XP, Level, Scenarios & Mode */}
        <div className="flex items-center flex-wrap gap-4 text-xs font-mono">
          {/* Scenario quick selector */}
          <div className="flex items-center gap-1.5 border border-[#E2E0D8] bg-[#F9F8F6] px-2 py-1 rounded-[4px]">
            <span className="text-[#6F6D67] text-[11px] uppercase">SCENARIO:</span>
            <select
              onChange={(e) => loadScenario(Number(e.target.value))}
              defaultValue="1"
              className="bg-transparent text-[#141413] text-[11px] font-mono focus:outline-none cursor-pointer"
            >
              <option value="1">1. Normal Transactions (P1-P3)</option>
              <option value="2">2. VIP Priority Scheduling</option>
              <option value="3">3. ATM Lanes (Round Robin)</option>
              <option value="4">4. Cash Contention (Banker's)</option>
              <option value="5">5. Full Buffer (FIFO Eviction)</option>
              <option value="6">6. Mini Statement (Indexed FS)</option>
            </select>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center border border-[#E2E0D8] rounded-[4px] overflow-hidden bg-[#F4F2EB]">
            <button
              onClick={() => setSimulationMode('FREE')}
              className={`px-2.5 py-1 text-[11px] transition-colors ${
                simulationMode === 'FREE' ? 'bg-[#141413] text-[#F9F8F6] font-medium' : 'text-[#6F6D67] hover:text-[#141413]'
              }`}
            >
              FREE SIM
            </button>
            <button
              onClick={() => setSimulationMode('CHALLENGE')}
              className={`px-2.5 py-1 text-[11px] transition-colors ${
                simulationMode === 'CHALLENGE' ? 'bg-[#141413] text-[#F9F8F6] font-medium' : 'text-[#6F6D67] hover:text-[#141413]'
              }`}
            >
              CHALLENGE
            </button>
          </div>

          {/* System Health */}
          <div className="flex items-center gap-2 border border-[#E2E0D8] px-2.5 py-1 rounded-[4px] bg-[#FFFFFF]">
            <Activity className="w-3.5 h-3.5 text-[#15803D]" />
            <span className="text-[#6F6D67] text-[11px]">HEALTH</span>
            <span className="font-semibold text-[#141413]">{systemHealth}%</span>
          </div>

          {/* Operator Score / XP */}
          <div className="flex items-center gap-2 border border-[#E2E0D8] px-2.5 py-1 rounded-[4px] bg-[#FFFFFF]">
            <Zap className="w-3.5 h-3.5 text-[#B45309]" />
            <span className="text-[#6F6D67] text-[11px]">SCORE</span>
            <span className="font-semibold text-[#141413]">{operatorScore} XP</span>
          </div>

          {/* Operator Level */}
          <div className="flex items-center gap-2 border border-[#141413] px-2.5 py-1 rounded-[4px] bg-[#141413] text-[#F9F8F6]">
            <Shield className="w-3.5 h-3.5 text-[#F9F8F6]" />
            <span className="text-[11px] font-semibold">LVL {operatorLevel}</span>
            <span className="text-[10px] text-[#D2D0C6] hidden lg:inline">| {operatorLevelTitle}</span>
          </div>

          {/* Reset button */}
          <button
            onClick={resetSimulation}
            title="Reset Simulation State to Baseline"
            className="p-1.5 border border-[#E2E0D8] hover:border-[#141413] rounded-[4px] text-[#6F6D67] hover:text-[#141413] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
