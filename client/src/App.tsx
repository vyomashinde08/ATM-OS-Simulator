import React from 'react';
import { useATMStore } from './store/useATMStore';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SimulationControlsBar } from './components/SimulationControlsBar';

// Views
import { OSOverviewView } from './views/OSOverviewView';
import { ControlRoomView } from './views/ControlRoomView';
import { TransactionsView } from './views/TransactionsView';
import { ProcessManagerView } from './views/ProcessManagerView';
import { SchedulerView } from './views/SchedulerView';
import { ResourceManagerView } from './views/ResourceManagerView';
import { MemoryManagerView } from './views/MemoryManagerView';
import { FileSystemView } from './views/FileSystemView';
import { MiniStatementView } from './views/MiniStatementView';
import { KernelOpsView } from './views/KernelOpsView';
import { SimulationLogsView } from './views/SimulationLogsView';

export const App: React.FC = () => {
  const { activeSection } = useATMStore();

  const renderActiveView = () => {
    switch (activeSection) {
      case 'OS Overview':
        return <OSOverviewView />;
      case 'ATM Control Room':
        return <ControlRoomView />;
      case 'Transactions':
        return <TransactionsView />;
      case 'Process Manager':
        return <ProcessManagerView />;
      case 'CPU Scheduler':
        return <SchedulerView />;
      case 'Resource Manager':
        return <ResourceManagerView />;
      case 'Memory Manager':
        return <MemoryManagerView />;
      case 'File System':
        return <FileSystemView />;
      case 'Mini Statement':
        return <MiniStatementView />;
      case 'Kernel Ops':
        return <KernelOpsView />;
      case 'Simulation Logs':
        return <SimulationLogsView />;
      default:
        return <ControlRoomView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#141413] flex flex-col font-sans antialiased">
      {/* 1. Global Utilitarian Header */}
      <Header />

      {/* 2. Global Persistent Simulation Engine Controls Bar */}
      <SimulationControlsBar />

      {/* 3. Main Operational Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Navigation */}
        <Sidebar />

        {/* Content View Area */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>

      {/* 4. Subdued Academic Engineering Footer */}
      <footer className="border-t border-[#E2E0D8] bg-[#FFFFFF] px-6 py-2.5 text-[11px] font-mono text-[#6F6D67] flex flex-col sm:flex-row items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#141413]">ATM-OS v2.4-RT</span>
          <span>— Embedded Operating System MicroProject (CO1 to CO5)</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Vidyalankar Polytechnic</span>
          <span>•</span>
          <span className="text-[#15803D]">Real-Time Embedded Kernel Active</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
