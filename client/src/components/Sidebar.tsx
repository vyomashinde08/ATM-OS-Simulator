import React from 'react';
import { useATMStore } from '../store/useATMStore';
import {
  Server,
  Terminal,
  CreditCard,
  Cpu,
  Activity,
  Wallet,
  HardDrive,
  Database,
  FileText,
  Shield,
  Clock,
  Radio,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  co?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'OS Overview', label: 'OS Overview', co: 'CO1', icon: Server },
  { id: 'ATM Control Room', label: 'ATM Control Room', icon: Terminal },
  { id: 'Transactions', label: 'Transactions', co: 'CO2', icon: CreditCard },
  { id: 'Process Manager', label: 'Process Manager', co: 'CO2', icon: Cpu },
  { id: 'CPU Scheduler', label: 'CPU Scheduler', co: 'CO3', icon: Activity },
  { id: 'Resource Manager', label: 'Resource Manager', co: 'CO3', icon: Wallet },
  { id: 'Memory Manager', label: 'Memory Manager', co: 'CO4', icon: HardDrive },
  { id: 'File System', label: 'File System', co: 'CO5', icon: Database },
  { id: 'Mini Statement', label: 'Mini Statement', co: 'CO5', icon: FileText },
  { id: 'Kernel Ops', label: 'Kernel Ops', icon: Shield },
  { id: 'Simulation Logs', label: 'Simulation Logs', icon: Clock },
];

export const Sidebar: React.FC = () => {
  const { activeSection, setActiveSection } = useATMStore();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-[#E2E0D8] bg-[#F4F2EB] flex flex-col justify-between select-none min-h-[calc(100vh-65px)]">
      {/* Top Branding */}
      <div>
        <div className="p-4 border-b border-[#E2E0D8] bg-[#FFFFFF]">
          <div className="font-mono text-xs font-semibold tracking-wider text-[#141413] uppercase">
            ATM-OS
          </div>
          <div className="text-[11px] text-[#6F6D67] font-mono leading-tight mt-0.5">
            Embedded Transaction Simulator
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono rounded-[4px] text-left transition-colors ${
                  isActive
                    ? 'bg-[#141413] text-[#F9F8F6] font-medium'
                    : 'text-[#141413] hover:bg-[#EAE8DF]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#F9F8F6]' : 'text-[#6F6D67]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.co && (
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded border font-mono ${
                      isActive
                        ? 'border-[#3D3C38] text-[#D2D0C6] bg-[#232220]'
                        : 'border-[#E2E0D8] text-[#6F6D67] bg-[#FFFFFF]'
                    }`}
                  >
                    {item.co}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Terminal Unit Status */}
      <div className="p-4 border-t border-[#E2E0D8] bg-[#FFFFFF]">
        <div className="flex items-center gap-2 text-[11px] font-mono font-medium text-[#141413]">
          <Radio className="w-3.5 h-3.5 text-[#15803D] animate-pulse" />
          <span>ATM-01</span>
        </div>
        <div className="text-[10px] font-mono text-[#6F6D67] mt-0.5">
          REAL-TIME MODE
        </div>
        <div className="text-[10px] font-mono text-[#15803D] font-medium mt-0.5">
          SYSTEM ONLINE
        </div>
      </div>
    </aside>
  );
};
