import React, { useState } from 'react';
import { useATMStore, INITIAL_ACCOUNTS } from '../store/useATMStore';
import { FileText, ArrowRight, Printer, Search, Database, CheckCircle2 } from 'lucide-react';

export const MiniStatementView: React.FC = () => {
  const { lookupMiniStatement, indexedAllocations } = useATMStore();

  const [inputAccount, setInputAccount] = useState<string>('****4821');
  const [statementData, setStatementData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    const data = await lookupMiniStatement(inputAccount);
    setStatementData(data);
    setIsSearching(false);
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="border-b border-[#E2E0D8] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-[#6F6D67]">
            COURSE OUTCOME 5 (CO5)
          </div>
          <h2 className="text-xl font-bold font-mono tracking-tight text-[#141413] mt-0.5">
            ACCOUNT TRANSACTION LOOKUP — MINI STATEMENT RETRIEVAL
          </h2>
          <p className="text-xs text-[#6F6D67] mt-1">
            Traverses the simulated OS Indexed File system (Index Inode Block → Data Blocks → Transaction Records).
          </p>
        </div>
      </div>

      {/* Input Search Form & Preset Chips */}
      <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-5 rounded-[4px]">
        <form onSubmit={handleLookup} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            <div className="w-full sm:w-80">
              <label className="block text-[11px] font-mono uppercase text-[#6F6D67] mb-1.5">
                ENTER ACCOUNT NUMBER
              </label>
              <input
                type="text"
                value={inputAccount}
                onChange={(e) => setInputAccount(e.target.value)}
                placeholder="e.g. ****4821"
                className="w-full border border-[#E2E0D8] bg-[#FFFFFF] px-3.5 py-2 text-xs font-mono text-[#141413] rounded-[4px] focus:border-[#141413] focus:outline-none font-bold"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="ctrl-btn ctrl-btn-primary px-5 py-2.5 text-xs font-mono tracking-wide"
            >
              <Search className="w-3.5 h-3.5" />
              {isSearching ? 'RETRIEVING FROM DISK...' : 'RETRIEVE MINI STATEMENT'}
            </button>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs pt-1">
            <span className="text-[#6F6D67]">QUICK PRESETS:</span>
            {INITIAL_ACCOUNTS.map((acc) => (
              <button
                key={acc.account_no}
                type="button"
                onClick={() => {
                  setInputAccount(acc.account_no);
                }}
                className={`px-2.5 py-1 border rounded-[3px] font-mono text-[11px] ${
                  inputAccount === acc.account_no
                    ? 'border-[#141413] bg-[#141413] text-[#F9F8F6] font-bold'
                    : 'border-[#E2E0D8] bg-[#F9F8F6] text-[#6F6D67] hover:text-[#141413]'
                }`}
              >
                {acc.account_no}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Visual Retrieval Path & Receipt */}
      {statementData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Index Traversal Flowchart */}
          <div className="lg:col-span-7 border border-[#E2E0D8] bg-[#FFFFFF] p-5 rounded-[4px] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E0D8] pb-2">
              <span className="font-mono text-xs font-bold text-[#141413] uppercase tracking-wide flex items-center gap-2">
                <Database className="w-4 h-4 text-[#141413]" />
                INDEXED FILE SYSTEM TRAVERSAL PATH
              </span>
              <span className="text-[11px] font-mono text-[#15803D] font-bold">
                I/O RETRIEVAL COMPLETE
              </span>
            </div>

            {/* Steps diagram */}
            <div className="space-y-3 font-mono text-xs">
              {/* Step 1: Directory Inode */}
              <div className="p-3 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px]">
                <div className="text-[10px] text-[#6F6D67] uppercase mb-0.5">STEP 1: INODE DIRECTORY LOOKUP</div>
                <div className="font-bold text-[#141413]">
                  Directory Entry: &quot;{statementData.account.account_no}&quot;
                </div>
                <div className="text-[11px] text-[#6F6D67] mt-0.5">
                  OS searches kernel inode table. Resolved pointer to Index Block{' '}
                  <strong className="text-[#141413]">{statementData.index_block}</strong>.
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="w-4 h-4 text-[#6F6D67] rotate-90" />
              </div>

              {/* Step 2: Index Block */}
              <div className="p-3 border border-[#141413] bg-[#141413] text-[#F9F8F6] rounded-[4px]">
                <div className="text-[10px] text-[#A8A29E] uppercase mb-0.5">STEP 2: INDEX BLOCK READ</div>
                <div className="font-bold text-sm text-[#FBBF24]">
                  Index Inode Block: {statementData.index_block}
                </div>
                <div className="text-[11px] text-[#D2D0C6] mt-0.5">
                  Contains direct sector pointers:{' '}
                  <strong className="text-[#F9F8F6]">[{statementData.data_blocks.join(', ')}]</strong>.
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="w-4 h-4 text-[#6F6D67] rotate-90" />
              </div>

              {/* Step 3: Data Blocks */}
              <div className="p-3 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px]">
                <div className="text-[10px] text-[#6F6D67] uppercase mb-0.5">STEP 3: PARALLEL DATA BLOCK ACCESS</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                  {statementData.data_blocks.map((b: string) => (
                    <div key={b} className="p-2 border border-[#15803D] bg-[#F0FDF4] rounded text-center">
                      <span className="font-bold text-[#15803D]">{b}</span>
                      <span className="block text-[9px] text-[#6F6D67]">Data Block</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="w-4 h-4 text-[#6F6D67] rotate-90" />
              </div>

              {/* Step 4: Records Built */}
              <div className="p-3 border border-[#15803D] bg-[#F0FDF4] rounded-[4px] text-[#15803D]">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>STEP 4: AUDIT LOGS CONSTRUCTED</span>
                </div>
                <div className="text-[11px] mt-0.5">
                  Retrieved {statementData.transactions.length} immutable records in direct chronological sequence.
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Formatted Mini Statement Thermal Receipt (Section 25) */}
          <div className="lg:col-span-5 border border-[#141413] bg-[#FFFFFF] p-6 rounded-[4px] font-mono text-xs space-y-4 shadow-sm">
            <div className="text-center border-b border-dashed border-[#141413] pb-3 space-y-1">
              <div className="font-bold text-sm tracking-wider">ATM-OS EMBEDDED KERNEL</div>
              <div className="text-[10px] text-[#6F6D67]">TERMINAL: ATM-01 | AUDIT RETRIEVAL</div>
              <div className="text-xs font-bold pt-1 uppercase">MINI STATEMENT</div>
            </div>

            {/* Account Info */}
            <div className="space-y-1 text-xs border-b border-dashed border-[#141413] pb-3">
              <div className="flex justify-between">
                <span className="text-[#6F6D67]">ACCOUNT:</span>
                <span className="font-bold text-[#141413]">{statementData.account.account_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6F6D67]">HOLDER:</span>
                <span className="text-[#141413] truncate max-w-[170px]">{statementData.account.holder_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6F6D67]">BALANCE:</span>
                <span className="font-bold text-[#141413]">₹{statementData.account.balance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#6F6D67]">INDEX INODE:</span>
                <span className="font-bold text-[#141413]">{statementData.index_block}</span>
              </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-2 border-b border-dashed border-[#141413] pb-3">
              <div className="flex justify-between text-[10px] text-[#6F6D67] uppercase font-bold">
                <span>DATE</span>
                <span>TYPE</span>
                <span className="text-right">AMOUNT</span>
              </div>

              {statementData.transactions.length === 0 ? (
                <div className="text-center text-[#6F6D67] py-2 text-[11px]">No transaction history found.</div>
              ) : (
                statementData.transactions.map((t: any) => (
                  <div key={t.txn_id} className="flex justify-between items-center text-xs">
                    <span className="text-[#6F6D67] text-[11px] truncate max-w-[80px]">
                      {t.timestamp.replace(/202\d\s*/, '')}
                    </span>
                    <span className="font-medium text-[#141413]">{t.type}</span>
                    <span className="text-right font-bold text-[#141413]">
                      {t.amount > 0 ? `₹${t.amount.toLocaleString()}` : '—'}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Receipt Footer */}
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#6F6D67]">TRANSACTIONS: {statementData.transactions.length}</span>
              <span className="font-bold text-[#15803D]">INDEXED OK</span>
            </div>

            {/* Print Action */}
            <div className="pt-2">
              <button
                onClick={() => window.print()}
                className="w-full py-2 border border-[#141413] hover:bg-[#F4F2EB] text-xs font-mono font-bold flex items-center justify-center gap-2 rounded-[3px]"
              >
                <Printer className="w-3.5 h-3.5" />
                PRINT MINI STATEMENT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
