import React, { useState } from 'react';
import { useATMStore } from '../store/useATMStore';
import { Clock, Search, Download, Trash2, Filter, Terminal } from 'lucide-react';
import { KernelEventType } from '../types';

export const SimulationLogsView: React.FC = () => {
  const { events, clearEvents, stepSimulation } = useATMStore();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.pid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.type.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === 'PROCESS') {
      return ['CARD_INSERTED', 'PROCESS_CREATED', 'PCB_INITIALIZED', 'PROCESS_READY', 'PROCESS_TERMINATED'].includes(ev.type);
    }
    if (selectedCategory === 'CPU') {
      return ['CPU_DISPATCH', 'CONTEXT_SWITCH'].includes(ev.type);
    }
    if (selectedCategory === 'BANKER') {
      return ['RESOURCE_REQUEST', 'BANKER_CHECK'].includes(ev.type);
    }
    if (selectedCategory === 'MEMORY') {
      return ['MEMORY_ALLOCATED', 'PAGE_FAULT', 'PAGE_HIT'].includes(ev.type);
    }
    if (selectedCategory === 'FILE') {
      return ['TRANSACTION_EXECUTED', 'LOG_CREATED'].includes(ev.type);
    }

    return true;
  });

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(events, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atm-os-kernel-log-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="border-b border-[#E2E0D8] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-[#6F6D67]">
            KERNEL AUDIT TRAIL
          </div>
          <h2 className="text-xl font-bold font-mono tracking-tight text-[#141413] mt-0.5">
            CHRONOLOGICAL KERNEL EVENT STREAM
          </h2>
          <p className="text-xs text-[#6F6D67] mt-1">
            Millisecond-accurate timeline recording interrupts, scheduler dispatches, banker checks, memory faults, and file commits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="ctrl-btn bg-[#FFFFFF] hover:bg-[#F4F2EB] text-[#141413]"
          >
            <Download className="w-3.5 h-3.5" />
            EXPORT JSON
          </button>
          <button
            onClick={clearEvents}
            className="ctrl-btn bg-[#FFFFFF] hover:bg-[#F4F2EB] text-[#6F6D67]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            CLEAR LOG
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-4 rounded-[4px] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
          <span className="text-[#6F6D67] uppercase font-bold flex items-center gap-1">
            <Filter className="w-3 h-3" /> CATEGORY:
          </span>
          {['ALL', 'PROCESS', 'CPU', 'BANKER', 'MEMORY', 'FILE'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 border rounded-[3px] font-mono text-[11px] ${
                selectedCategory === cat
                  ? 'border-[#141413] bg-[#141413] text-[#F9F8F6] font-bold'
                  : 'border-[#E2E0D8] bg-[#F9F8F6] text-[#6F6D67] hover:text-[#141413]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#6F6D67] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search PID, Type, Detail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-[#E2E0D8] rounded-[4px] font-mono text-xs text-[#141413] focus:border-[#141413] focus:outline-none w-64"
            />
          </div>
        </div>
      </div>

      {/* Terminal Log Console */}
      <div className="border border-[#141413] bg-[#141413] text-[#F9F8F6] rounded-[4px] overflow-hidden font-mono text-xs">
        <div className="px-4 py-2.5 bg-[#232220] border-b border-[#3D3C38] flex items-center justify-between text-[11px] text-[#A8A29E]">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#F9F8F6]" />
            <span>/dev/klog (KERNEL LOG DISPATCH MONITOR)</span>
          </div>
          <span>{filteredEvents.length} events logged</span>
        </div>

        <div className="p-4 space-y-1.5 max-h-[500px] overflow-y-auto">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-[#8C8A82]">
              No events found matching current criteria.
            </div>
          ) : (
            filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="flex items-start gap-3 py-1 px-1.5 hover:bg-[#232220] rounded leading-relaxed"
              >
                <span className="text-[#8C8A82] select-none flex-shrink-0">{ev.timestamp}</span>
                <span
                  className={`font-bold flex-shrink-0 ${
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
                <span className="text-[#F9F8F6] font-bold flex-shrink-0">[{ev.pid}]</span>
                <span className="text-[#D2D0C6]">{ev.details}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
