import React, { useState } from 'react';
import { useATMStore } from '../store/useATMStore';
import { Database, FileText, HardDrive, ArrowRight, CornerDownRight, CheckCircle2 } from 'lucide-react';
import { generateDiskBlocks } from '../algorithms/indexedFile';

export const FileSystemView: React.FC = () => {
  const {
    transactionLogs,
    indexedAllocations,
    setActiveSection,
  } = useATMStore();

  const [selectedAccount, setSelectedAccount] = useState<string>('****4821');

  const diskBlocks = generateDiskBlocks(indexedAllocations);
  const accountAlloc = indexedAllocations[selectedAccount] || { indexBlock: 'I-07', dataBlocks: [] };
  const accountTxns = transactionLogs.filter((t) => t.account_no === selectedAccount);

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="border-b border-[#E2E0D8] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-[#6F6D67]">
            COURSE OUTCOME 5 (CO5)
          </div>
          <h2 className="text-xl font-bold font-mono tracking-tight text-[#141413] mt-0.5">
            TRANSACTION FILE SYSTEM &amp; INDEXED ALLOCATION
          </h2>
          <p className="text-xs text-[#6F6D67] mt-1">
            Simulated non-contiguous indexed file allocation storing audit trails and transaction logs across disk sectors.
          </p>
        </div>

        <button
          onClick={() => setActiveSection('Mini Statement')}
          className="ctrl-btn ctrl-btn-primary"
        >
          <FileText className="w-3.5 h-3.5" />
          TEST MINI STATEMENT LOOKUP →
        </button>
      </div>

      {/* Account Selector for Index Inspection */}
      <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-4 rounded-[4px] flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[#6F6D67] uppercase font-bold">SELECT ACCOUNT INODE:</span>
          {Object.keys(indexedAllocations).map((acc) => (
            <button
              key={acc}
              onClick={() => setSelectedAccount(acc)}
              className={`px-3 py-1.5 border rounded-[4px] font-mono text-xs transition-colors ${
                selectedAccount === acc
                  ? 'border-[#141413] bg-[#141413] text-[#F9F8F6] font-bold'
                  : 'border-[#E2E0D8] bg-[#FFFFFF] text-[#6F6D67] hover:text-[#141413]'
              }`}
            >
              {acc}
            </button>
          ))}
        </div>

        <div className="text-[11px] font-mono text-[#6F6D67]">
          Index Block: <strong className="text-[#141413]">{accountAlloc.indexBlock}</strong> | Data Blocks:{' '}
          <strong className="text-[#141413]">{accountAlloc.dataBlocks.length} allocated</strong>
        </div>
      </div>

      {/* Indexed Allocation Hierarchy (Section 24) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Tree */}
        <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-5 rounded-[4px] space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E0D8] pb-2">
            <span className="font-mono text-xs font-bold text-[#141413] uppercase tracking-wide flex items-center gap-2">
              <Database className="w-4 h-4 text-[#141413]" />
              INDEX BLOCK DIRECT POINTER RESOLUTION
            </span>
            <span className="text-[11px] font-mono text-[#15803D] font-bold">
              NO EXTERNAL FRAGMENTATION
            </span>
          </div>

          <div className="font-mono text-xs space-y-3">
            {/* Root Inode entry */}
            <div className="p-3 border border-[#141413] bg-[#141413] text-[#F9F8F6] rounded-[4px] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#A8A29E] block">ACCOUNT INODE ENTRY</span>
                <span className="font-bold text-sm">{selectedAccount}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#A8A29E] block">PRIMARY INDEX POINTER</span>
                <span className="font-bold text-sm text-[#FBBF24]">{accountAlloc.indexBlock}</span>
              </div>
            </div>

            {/* Direct Data Block Pointers */}
            <div className="pl-4 space-y-2 border-l-2 border-[#141413] ml-4">
              {accountAlloc.dataBlocks.map((blockName, idx) => {
                const linkedTxn = accountTxns[idx];
                return (
                  <div
                    key={blockName}
                    className="p-2.5 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <CornerDownRight className="w-3.5 h-3.5 text-[#6F6D67]" />
                      <span className="font-bold text-[#141413]">{blockName}</span>
                      <span className="text-[#6F6D67] text-[11px]">Direct Pointer [{idx}]</span>
                    </div>

                    <div className="text-right text-[11px]">
                      {linkedTxn ? (
                        <span className="text-[#141413]">
                          {linkedTxn.txn_id} ({linkedTxn.type} {linkedTxn.amount > 0 ? `₹${linkedTxn.amount.toLocaleString()}` : ''})
                        </span>
                      ) : (
                        <span className="text-[#6F6D67]">Data Block Allocated</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 64-Block Simulated Disk Layout Grid */}
        <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-5 rounded-[4px] space-y-3">
          <div className="flex items-center justify-between border-b border-[#E2E0D8] pb-2">
            <span className="font-mono text-xs font-bold text-[#141413] uppercase tracking-wide flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#141413]" />
              PHYSICAL DISK BLOCKS (64 SECTORS)
            </span>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-[#141413] inline-block rounded-[1px]" /> Index
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-[#4ADE80] inline-block rounded-[1px]" /> Data
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-[#E2E0D8] inline-block rounded-[1px]" /> Free
              </span>
            </div>
          </div>

          <div className="grid grid-cols-8 gap-1.5 pt-2">
            {diskBlocks.map((b) => {
              const isSelectedAccountIndex = b.associatedIndex === accountAlloc.indexBlock && b.type === 'INDEX';
              const isSelectedAccountData = b.accountNo === selectedAccount && b.type === 'DATA';

              let bgClass = 'bg-[#FFFFFF] border-[#E2E0D8] text-[#8C8A82]';
              if (b.type === 'SYSTEM') {
                bgClass = 'bg-[#F4F2EB] border-[#D2D0C6] text-[#6F6D67]';
              } else if (isSelectedAccountIndex) {
                bgClass = 'bg-[#141413] border-[#141413] text-[#F9F8F6] font-bold shadow-sm';
              } else if (isSelectedAccountData) {
                bgClass = 'bg-[#DCFCE7] border-[#15803D] text-[#15803D] font-bold';
              } else if (b.type === 'INDEX') {
                bgClass = 'bg-[#3D3C38] border-[#3D3C38] text-[#F9F8F6]';
              } else if (b.type === 'DATA') {
                bgClass = 'bg-[#F0FDF4] border-[#86EFAC] text-[#166534]';
              }

              return (
                <div
                  key={b.id}
                  title={`Block ${b.blockName}: ${b.type} ${b.accountNo ? `(${b.accountNo})` : ''}`}
                  className={`h-9 border rounded-[2px] flex flex-col items-center justify-center font-mono text-[9px] transition-transform hover:scale-105 cursor-default ${bgClass}`}
                >
                  <span>{b.blockName}</span>
                </div>
              );
            })}
          </div>
          <div className="text-[10px] font-mono text-[#6F6D67] pt-1">
            Green sectors = Transaction data blocks allocated to <strong className="text-[#141413]">{selectedAccount}</strong>.
          </div>
        </div>
      </div>

      {/* Transaction Log Table (Section 23) */}
      <div className="border border-[#E2E0D8] bg-[#FFFFFF] rounded-[4px] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E2E0D8] bg-[#F4F2EB] flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-[#141413] uppercase tracking-wide">
            ATM TRANSACTION LOG TABLE (IMMUTABLE AUDIT TRAIL)
          </span>
          <span className="text-[11px] font-mono text-[#6F6D67]">
            {transactionLogs.length} Records Persisted
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse tech-table">
            <thead>
              <tr>
                <th>TXN ID</th>
                <th>PID</th>
                <th>Account</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Timestamp</th>
                <th>Index Block</th>
                <th>Data Block</th>
              </tr>
            </thead>
            <tbody>
              {transactionLogs.map((t) => (
                <tr key={t.txn_id} className="hover:bg-[#F9F8F6]">
                  <td className="font-mono font-bold text-xs text-[#141413]">{t.txn_id}</td>
                  <td className="font-mono text-xs text-[#6F6D67]">{t.pid}</td>
                  <td className="font-mono text-xs text-[#141413]">{t.account_no}</td>
                  <td className="font-mono text-xs text-[#141413]">{t.type}</td>
                  <td className="font-mono text-xs text-[#141413]">
                    {t.amount > 0 ? `₹${t.amount.toLocaleString()}` : '—'}
                  </td>
                  <td>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded font-semibold bg-[#F0FDF4] text-[#15803D]">
                      {t.status}
                    </span>
                  </td>
                  <td className="font-mono text-xs text-[#6F6D67]">{t.timestamp}</td>
                  <td className="font-mono text-xs font-bold text-[#141413]">{t.index_block || 'I-07'}</td>
                  <td className="font-mono text-xs font-bold text-[#15803D]">{t.data_block || 'B12'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
