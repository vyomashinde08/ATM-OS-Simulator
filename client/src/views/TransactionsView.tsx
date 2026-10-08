import React, { useState } from 'react';
import { useATMStore, INITIAL_ACCOUNTS } from '../store/useATMStore';
import { CreditCard, ArrowRight, CheckCircle2, Shield, Lock, Wallet } from 'lucide-react';
import { TransactionType, ProcessPriority } from '../types';

export const TransactionsView: React.FC = () => {
  const { createProcessFromSwipe, setActiveSection } = useATMStore();

  const [selectedAccount, setSelectedAccount] = useState(INITIAL_ACCOUNTS[0]);
  const [pin, setPin] = useState(INITIAL_ACCOUNTS[0].pin);
  const [transactionType, setTransactionType] = useState<TransactionType>('WITHDRAWAL');
  const [amount, setAmount] = useState<number>(3000);
  const [priority, setPriority] = useState<ProcessPriority>('VIP');
  const [lastCreatedPid, setLastCreatedPid] = useState<string | null>(null);

  const handleAccountSelect = (acc: typeof INITIAL_ACCOUNTS[0]) => {
    setSelectedAccount(acc);
    setPin(acc.pin);
    setPriority(acc.card_type);
  };

  const handleSwipeCard = (e: React.FormEvent) => {
    e.preventDefault();
    const newProcess = createProcessFromSwipe({
      accountNo: selectedAccount.account_no,
      pin,
      transactionType,
      amount: transactionType === 'BALANCE' || transactionType === 'MINI_STATEMENT' ? 0 : amount,
      priority,
    });
    setLastCreatedPid(newProcess.pid);
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="border-b border-[#E2E0D8] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-[#6F6D67]">
            COURSE OUTCOME 2 (CO2)
          </div>
          <h2 className="text-xl font-bold font-mono tracking-tight text-[#141413] mt-0.5">
            CARD SWIPE SIMULATOR — PROCESS INGESTION
          </h2>
          <p className="text-xs text-[#6F6D67] mt-1">
            Simulates physical card read interrupt triggering kernel process generation and PCB allocation.
          </p>
        </div>
        {lastCreatedPid && (
          <div className="flex items-center gap-2 p-2 border border-[#15803D] bg-[#F0FDF4] rounded-[4px] text-xs font-mono text-[#15803D]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Process {lastCreatedPid} Enqueued!</span>
            <button
              onClick={() => setActiveSection('Process Manager')}
              className="underline font-bold ml-1"
            >
              View PCB →
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Preset Card Picker */}
        <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-4 rounded-[4px] space-y-3">
          <div className="flex items-center justify-between border-b border-[#E2E0D8] pb-2">
            <span className="font-mono text-xs font-bold text-[#141413] uppercase">
              SELECT CARDHOLDER PROFILE
            </span>
            <CreditCard className="w-3.5 h-3.5 text-[#6F6D67]" />
          </div>

          <p className="text-[11px] text-[#6F6D67]">
            Select an account to load credentials, card tier, and priority level:
          </p>

          <div className="space-y-2">
            {INITIAL_ACCOUNTS.map((acc) => {
              const isSelected = selectedAccount.account_no === acc.account_no;
              return (
                <div
                  key={acc.account_no}
                  onClick={() => handleAccountSelect(acc)}
                  className={`p-3 border rounded-[4px] cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#141413] bg-[#F4F2EB] shadow-sm'
                      : 'border-[#E2E0D8] bg-[#FFFFFF] hover:border-[#141413]'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-[#141413]">{acc.account_no}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        acc.card_type === 'VIP'
                          ? 'bg-[#141413] text-[#F9F8F6]'
                          : 'bg-[#E2E0D8] text-[#141413]'
                      }`}
                    >
                      {acc.card_type}
                    </span>
                  </div>
                  <div className="text-xs text-[#141413] mt-1 font-medium">{acc.holder_name}</div>
                  <div className="flex items-center justify-between text-[11px] text-[#6F6D67] mt-1 font-mono">
                    <span>Balance: ₹{acc.balance.toLocaleString()}</span>
                    <span>PIN: {acc.pin}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle Column: Card Swipe Form */}
        <div className="lg:col-span-2 border border-[#E2E0D8] bg-[#FFFFFF] p-5 rounded-[4px]">
          <div className="flex items-center justify-between border-b border-[#E2E0D8] pb-3 mb-4">
            <span className="font-mono text-xs font-bold text-[#141413] uppercase">
              TRANSACTION PARAMETERS &amp; PCB CONFIGURATION
            </span>
            <span className="text-[11px] font-mono text-[#6F6D67]">CO2 CARD = PROCESS</span>
          </div>

          <form onSubmit={handleSwipeCard} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Account Number */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#6F6D67] mb-1">
                  ACCOUNT NUMBER
                </label>
                <input
                  type="text"
                  value={selectedAccount.account_no}
                  readOnly
                  className="w-full border border-[#E2E0D8] bg-[#F4F2EB] px-3 py-2 text-xs font-mono text-[#141413] rounded-[4px] focus:outline-none"
                />
              </div>

              {/* PIN Code */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#6F6D67] mb-1 flex items-center justify-between">
                  <span>ENTER PIN (SECURITY VERIFICATION)</span>
                  <Lock className="w-3 h-3 text-[#6F6D67]" />
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="4-digit PIN"
                  className="w-full border border-[#E2E0D8] bg-[#FFFFFF] px-3 py-2 text-xs font-mono text-[#141413] rounded-[4px] focus:border-[#141413] focus:outline-none"
                  required
                />
              </div>

              {/* Transaction Type */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#6F6D67] mb-1">
                  TRANSACTION TYPE
                </label>
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value as TransactionType)}
                  className="w-full border border-[#E2E0D8] bg-[#FFFFFF] px-3 py-2 text-xs font-mono text-[#141413] rounded-[4px] focus:border-[#141413] focus:outline-none cursor-pointer"
                >
                  <option value="WITHDRAWAL">WITHDRAWAL (Cash Dispense)</option>
                  <option value="DEPOSIT">DEPOSIT (Vault Ingest)</option>
                  <option value="BALANCE">BALANCE INQUIRY (Read-only)</option>
                  <option value="MINI_STATEMENT">MINI STATEMENT (Indexed I/O)</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#6F6D67] mb-1 flex items-center justify-between">
                  <span>PROCESS PRIORITY</span>
                  <Shield className="w-3 h-3 text-[#6F6D67]" />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPriority('VIP')}
                    className={`py-2 text-xs font-mono rounded-[4px] border transition-colors ${
                      priority === 'VIP'
                        ? 'border-[#141413] bg-[#141413] text-[#F9F8F6] font-bold'
                        : 'border-[#E2E0D8] bg-[#FFFFFF] text-[#6F6D67] hover:text-[#141413]'
                    }`}
                  >
                    VIP (HIGH PRIORITY)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('REGULAR')}
                    className={`py-2 text-xs font-mono rounded-[4px] border transition-colors ${
                      priority === 'REGULAR'
                        ? 'border-[#141413] bg-[#141413] text-[#F9F8F6] font-bold'
                        : 'border-[#E2E0D8] bg-[#FFFFFF] text-[#6F6D67] hover:text-[#141413]'
                    }`}
                  >
                    REGULAR (NORMAL)
                  </button>
                </div>
              </div>

              {/* Amount (if withdrawal/deposit) */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono uppercase text-[#6F6D67] mb-1 flex items-center justify-between">
                  <span>TRANSACTION AMOUNT (₹)</span>
                  <Wallet className="w-3 h-3 text-[#6F6D67]" />
                </label>
                <input
                  type="number"
                  step="100"
                  min="100"
                  max="50000"
                  disabled={transactionType === 'BALANCE' || transactionType === 'MINI_STATEMENT'}
                  value={transactionType === 'BALANCE' || transactionType === 'MINI_STATEMENT' ? 0 : amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full border border-[#E2E0D8] bg-[#FFFFFF] px-3 py-2 text-xs font-mono text-[#141413] rounded-[4px] focus:border-[#141413] focus:outline-none disabled:bg-[#F4F2EB] disabled:text-[#6F6D67]"
                />
                <div className="flex gap-2 mt-2">
                  {[500, 1000, 2000, 3000, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      disabled={transactionType === 'BALANCE' || transactionType === 'MINI_STATEMENT'}
                      onClick={() => setAmount(amt)}
                      className="px-2 py-1 border border-[#E2E0D8] bg-[#F9F8F6] hover:bg-[#EAE8DF] text-[10px] font-mono rounded-[3px] disabled:opacity-50"
                    >
                      ₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ingest Action Button */}
            <div className="pt-4 border-t border-[#E2E0D8] flex items-center justify-between">
              <div className="text-[11px] font-mono text-[#6F6D67]">
                OS Action: sys_fork_card_process() → Allocates PCB in kernel memory
              </div>

              <button
                type="submit"
                className="ctrl-btn ctrl-btn-primary px-4 py-2.5 text-xs font-mono tracking-wide"
              >
                <CreditCard className="w-4 h-4" />
                SIMULATE CARD SWIPE &amp; CREATE PROCESS
              </button>
            </div>
          </form>

          {/* Educational Note */}
          <div className="mt-4 p-3 bg-[#F9F8F6] border border-[#E2E0D8] rounded-[4px] text-xs text-[#6F6D67] font-mono leading-relaxed">
            <span className="font-bold text-[#141413]">CO2 CONCEPT: </span>
            Every card swipe generates an isolated OS process thread. The kernel allocates a Process Control Block (PCB) 
            containing PID, authentication state, execution priority, and burst time estimates.
          </div>
        </div>
      </div>
    </div>
  );
};
