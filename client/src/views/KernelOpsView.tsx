import React, { useState } from 'react';
import { useATMStore } from '../store/useATMStore';
import {
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle,
  Award,
  Activity,
  FileCheck,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { ChallengeDecision } from '../types';

// Predefined interactive OS decision challenges
const CHALLENGES: ChallengeDecision[] = [
  {
    id: 'CH-01',
    missionId: 'M02',
    question: 'Three transactions are ready: P001 (Regular, 5ms), P002 (VIP, 3ms), P003 (Regular, 2ms). Which process must the CPU scheduler dispatch first?',
    context: 'The embedded OS scheduler is configured with Non-Preemptive Priority policy.',
    rewardXp: 40,
    options: [
      { id: 'opt-1', text: 'P001 (Entered queue earliest)', isCorrect: false, explanation: 'Incorrect: Regular queue order does not override VIP priority.' },
      { id: 'opt-2', text: 'P002 (VIP Priority)', isCorrect: true, explanation: 'CORRECT: P002 has VIP priority and executes before all regular transactions.' },
      { id: 'opt-3', text: 'P003 (Shortest burst time 2ms)', isCorrect: false, explanation: 'Incorrect: ATM-OS uses Priority Scheduling, not Shortest Job First.' },
    ],
  },
  {
    id: 'CH-02',
    missionId: 'M04',
    question: 'Available cash vault is [₹500×2, ₹200×1, ₹100×3]. P004 requests [₹500×4]. What must the Resource Manager do?',
    context: 'Evaluating request against Available vector.',
    rewardXp: 50,
    options: [
      { id: 'opt-1', text: 'GRANT REQUEST (Dispense immediately)', isCorrect: false, explanation: 'Incorrect: Available ₹500 notes (2) are less than requested (4). Granting causes dispensing fault.' },
      { id: 'opt-2', text: 'BLOCK REQUEST (Process must wait for replenish)', isCorrect: true, explanation: 'CORRECT: Request exceeds immediate Available resources. Condition Request <= Available fails.' },
      { id: 'opt-3', text: 'FORCE TERMINATION', isCorrect: false, explanation: 'Incorrect: A resource deficit causes wait queue suspension, not forced termination.' },
    ],
  },
  {
    id: 'CH-03',
    missionId: 'M05',
    question: 'Frames are [Frame 1: P001, Frame 2: P002, Frame 3: P003] loaded in that exact chronological order. P004 arrives. Which victim page will FIFO evict?',
    context: 'Transaction memory buffer is full (3/3 frames occupied).',
    rewardXp: 40,
    options: [
      { id: 'opt-1', text: 'P001 (Oldest page in memory)', isCorrect: true, explanation: 'CORRECT: P001 entered memory earliest. FIFO strictly evicts the oldest resident page.' },
      { id: 'opt-2', text: 'P002 (Middle page)', isCorrect: false, explanation: 'Incorrect: P002 entered after P001.' },
      { id: 'opt-3', text: 'P003 (Newest page)', isCorrect: false, explanation: 'Incorrect: Evicting newest page would be LIFO, not FIFO.' },
    ],
  },
];

export const KernelOpsView: React.FC = () => {
  const {
    operatorScore,
    operatorLevel,
    operatorLevelTitle,
    systemHealth,
    accuracy,
    efficiency,
    errors,
    missions,
    achievements,
    activeChallenge,
    setActiveChallenge,
    submitChallengeAnswer,
    awardXp,
    setActiveSection,
    resetSimulation,
  } = useATMStore();

  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeDecision | null>(CHALLENGES[0]);
  const [challengeResult, setChallengeResult] = useState<{ isCorrect: boolean; explanation: string } | null>(null);
  const [showFinalReport, setShowFinalReport] = useState<boolean>(false);

  const completedMissionsCount = missions.filter((m) => m.completed).length;
  const unlockedAchievementsCount = achievements.filter((a) => a.unlocked).length;

  // Level thresholds
  const levelThresholds = [
    { lvl: 1, title: 'TRANSACTION OPERATOR', min: 0, max: 200 },
    { lvl: 2, title: 'PROCESS MANAGER', min: 200, max: 500 },
    { lvl: 3, title: 'SCHEDULING OPERATOR', min: 500, max: 800 },
    { lvl: 4, title: 'RESOURCE CONTROLLER', min: 800, max: 1100 },
    { lvl: 5, title: 'MEMORY MANAGER', min: 1100, max: 1400 },
    { lvl: 6, title: 'FILE SYSTEM OPERATOR', min: 1400, max: 1800 },
    { lvl: 7, title: 'ATM KERNEL ENGINEER', min: 1800, max: 2500 },
  ];

  const currentLevelInfo = levelThresholds.find((l) => l.lvl === operatorLevel) || levelThresholds[3];
  const progressInLevel = Math.min(
    100,
    Math.max(0, Math.round(((operatorScore - currentLevelInfo.min) / (currentLevelInfo.max - currentLevelInfo.min)) * 100))
  );

  const handleSelectOption = (optId: string) => {
    if (!selectedChallenge) return;
    setActiveChallenge(selectedChallenge);
    const res = submitChallengeAnswer(optId);
    setChallengeResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="border-b border-[#E2E0D8] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-[#6F6D67]">
            GAMIFICATION &amp; OPERATOR PROFICIENCY
          </div>
          <h2 className="text-xl font-bold font-mono tracking-tight text-[#141413] mt-0.5">
            ATM KERNEL OPS — CERTIFICATION BENCHMARK
          </h2>
          <p className="text-xs text-[#6F6D67] mt-1">
            Solve real-time embedded operating system decisions to progress from Transaction Operator to ATM Kernel Engineer.
          </p>
        </div>

        <button
          onClick={() => setShowFinalReport(true)}
          className="ctrl-btn ctrl-btn-primary"
        >
          <FileCheck className="w-3.5 h-3.5" />
          VIEW OPERATOR REPORT
        </button>
      </div>

      {/* Operator Level & XP Progress Banner (Section 31 & 32) */}
      <div className="border border-[#141413] bg-[#FFFFFF] p-5 rounded-[4px] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-[#141413] bg-[#141413] text-[#F9F8F6] rounded-[4px] flex items-center justify-center font-mono font-bold text-lg">
              0{operatorLevel}
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#6F6D67] uppercase">
                CURRENT OPERATOR LEVEL
              </div>
              <div className="font-mono text-base font-bold text-[#141413] tracking-wide">
                {operatorLevelTitle}
              </div>
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-xl font-bold text-[#141413]">{operatorScore} XP</div>
            <div className="text-[11px] text-[#6F6D67]">
              Next Rank at {currentLevelInfo.max} XP ({currentLevelInfo.max - operatorScore} XP remaining)
            </div>
          </div>
        </div>

        {/* Level XP Bar */}
        <div>
          <div className="w-full bg-[#F4F2EB] h-2.5 rounded-[2px] overflow-hidden border border-[#E2E0D8]">
            <div
              className="bg-[#141413] h-full transition-all duration-500"
              style={{ width: `${progressInLevel}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-[#6F6D67] mt-1">
            <span>LVL 0{operatorLevel}: {currentLevelInfo.min} XP</span>
            <span>{progressInLevel}% Progress</span>
            <span>LVL 0{Math.min(7, operatorLevel + 1)}: {currentLevelInfo.max} XP</span>
          </div>
        </div>
      </div>

      {/* Subsystem Health Gauges (Section 39) */}
      <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-5 rounded-[4px] space-y-3">
        <div className="flex items-center justify-between border-b border-[#E2E0D8] pb-2">
          <span className="font-mono text-xs font-bold text-[#141413] uppercase tracking-wide flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#141413]" />
            ATM OS SYSTEM HEALTH (DIAGNOSTIC MATRIX)
          </span>
          <span className="text-xs font-mono font-bold text-[#15803D]">
            COMPOSITE HEALTH: {systemHealth}%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 font-mono text-xs pt-1">
          <div className="p-3 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px]">
            <span className="text-[10px] text-[#6F6D67] uppercase block">PROCESS MGMT</span>
            <span className="text-lg font-bold text-[#141413]">100%</span>
            <div className="w-full bg-[#E2E0D8] h-1 mt-1 rounded overflow-hidden">
              <div className="bg-[#141413] h-full w-[100%]" />
            </div>
          </div>

          <div className="p-3 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px]">
            <span className="text-[10px] text-[#6F6D67] uppercase block">CPU DISPATCH</span>
            <span className="text-lg font-bold text-[#141413]">88%</span>
            <div className="w-full bg-[#E2E0D8] h-1 mt-1 rounded overflow-hidden">
              <div className="bg-[#141413] h-full w-[88%]" />
            </div>
          </div>

          <div className="p-3 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px]">
            <span className="text-[10px] text-[#6F6D67] uppercase block">RESOURCE SAFETY</span>
            <span className="text-lg font-bold text-[#15803D]">100%</span>
            <div className="w-full bg-[#E2E0D8] h-1 mt-1 rounded overflow-hidden">
              <div className="bg-[#15803D] h-full w-[100%]" />
            </div>
          </div>

          <div className="p-3 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px]">
            <span className="text-[10px] text-[#6F6D67] uppercase block">MEMORY BUFFER</span>
            <span className="text-lg font-bold text-[#141413]">84%</span>
            <div className="w-full bg-[#E2E0D8] h-1 mt-1 rounded overflow-hidden">
              <div className="bg-[#141413] h-full w-[84%]" />
            </div>
          </div>

          <div className="p-3 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px]">
            <span className="text-[10px] text-[#6F6D67] uppercase block">INDEXED FILE SYSTEM</span>
            <span className="text-lg font-bold text-[#141413]">92%</span>
            <div className="w-full bg-[#E2E0D8] h-1 mt-1 rounded overflow-hidden">
              <div className="bg-[#141413] h-full w-[92%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Operations Challenges & Interactive Decision Point (Sections 33, 35, 36) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Cols: Missions Checklist */}
        <div className="lg:col-span-6 border border-[#E2E0D8] bg-[#FFFFFF] rounded-[4px] overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-4 py-3 border-b border-[#E2E0D8] bg-[#F4F2EB] flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#141413] uppercase tracking-wide">
                OPERATIONS MISSIONS ({completedMissionsCount}/{missions.length} COMPLETE)
              </span>
              <span className="text-[11px] font-mono text-[#6F6D67]">CO-MAPPED TASKS</span>
            </div>

            <div className="divide-y divide-[#E2E0D8]">
              {missions.map((m) => (
                <div key={m.id} className="p-3.5 hover:bg-[#F9F8F6] transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          m.completed ? 'text-[#15803D]' : 'text-[#D2D0C6]'
                        }`}
                      />
                      <div>
                        <div className="font-mono text-xs font-bold text-[#141413] flex items-center gap-2">
                          <span>{m.id} — {m.title}</span>
                          <span className="text-[9px] px-1 py-0.2 border border-[#E2E0D8] bg-[#F4F2EB] rounded text-[#6F6D67]">
                            {m.co}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6F6D67] mt-0.5 leading-relaxed">
                          {m.objective}
                        </p>
                      </div>
                    </div>

                    <span className="font-mono text-xs font-bold text-[#B45309] flex-shrink-0">
                      +{m.rewardXp} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Interactive Decision Point (Challenge Engine) */}
        <div className="lg:col-span-6 border border-[#141413] bg-[#FFFFFF] rounded-[4px] p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-[#141413] pb-2 mb-3">
              <span className="font-mono text-xs font-bold text-[#141413] uppercase tracking-wide flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#141413]" />
                OPERATOR DECISION POINT
              </span>
              <span className="font-mono text-xs font-bold text-[#B45309]">
                +{selectedChallenge?.rewardXp || 40} XP REWARD
              </span>
            </div>

            {/* Question Selector */}
            <div className="flex gap-2 mb-3 font-mono text-[11px]">
              {CHALLENGES.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setSelectedChallenge(ch);
                    setChallengeResult(null);
                  }}
                  className={`px-2 py-1 border rounded-[3px] ${
                    selectedChallenge?.id === ch.id
                      ? 'border-[#141413] bg-[#141413] text-[#F9F8F6] font-bold'
                      : 'border-[#E2E0D8] bg-[#F9F8F6] text-[#6F6D67]'
                  }`}
                >
                  Decision {idx + 1}
                </button>
              ))}
            </div>

            {selectedChallenge && (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px]">
                  <span className="text-[10px] text-[#6F6D67] uppercase block mb-1">
                    SCENARIO CONTEXT
                  </span>
                  <div className="text-[#141413] font-medium leading-relaxed">
                    {selectedChallenge.question}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] text-[#6F6D67] uppercase block">
                    WHICH ACTION SHOULD THE EMBEDDED KERNEL TAKE?
                  </span>
                  {selectedChallenge.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className="w-full text-left p-3 border border-[#E2E0D8] hover:border-[#141413] rounded-[4px] text-xs font-mono transition-all hover:bg-[#F4F2EB] flex items-center justify-between"
                    >
                      <span className="text-[#141413] font-medium">{opt.text}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#6F6D67]" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Decision Outcome */}
          {challengeResult && (
            <div
              className={`p-3.5 border rounded-[4px] font-mono text-xs ${
                challengeResult.isCorrect
                  ? 'border-[#15803D] bg-[#F0FDF4] text-[#15803D]'
                  : 'border-[#B45309] bg-[#FFFBEB] text-[#B45309]'
              }`}
            >
              <div className="font-bold uppercase tracking-wider mb-1">
                {challengeResult.isCorrect ? 'DECISION VERIFIED — CORRECT' : 'DECISION INCORRECT'}
              </div>
              <div className="text-[11px] leading-relaxed">
                {challengeResult.explanation}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Technical Achievements Gallery (Section 38) */}
      <div className="border border-[#E2E0D8] bg-[#FFFFFF] p-5 rounded-[4px] space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E0D8] pb-2">
          <span className="font-mono text-xs font-bold text-[#141413] uppercase tracking-wide flex items-center gap-2">
            <Award className="w-4 h-4 text-[#141413]" />
            TECHNICAL ACHIEVEMENTS ({unlockedAchievementsCount}/{achievements.length} UNLOCKED)
          </span>
          <span className="text-[11px] font-mono text-[#6F6D67]">MONOCHROME EMBEDDED BADGES</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3 border rounded-[4px] font-mono transition-all ${
                ach.unlocked
                  ? 'border-[#141413] bg-[#F4F2EB]'
                  : 'border-dashed border-[#E2E0D8] bg-[#FFFFFF] opacity-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#141413]">{ach.title}</span>
                <span className="text-[10px] text-[#B45309] font-bold">+{ach.xp} XP</span>
              </div>
              <p className="text-[11px] text-[#6F6D67] mt-1 leading-snug">
                {ach.description}
              </p>
              <div className="text-[10px] text-right mt-2">
                {ach.unlocked ? (
                  <span className="text-[#15803D] font-bold">✓ UNLOCKED</span>
                ) : (
                  <span className="text-[#8C8A82]">LOCKED</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Final Operator Report (Section 43) */}
      {showFinalReport && (
        <div className="fixed inset-0 bg-[#141413]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#141413] rounded-[4px] max-w-lg w-full p-6 font-mono text-xs space-y-4 shadow-xl">
            <div className="text-center border-b border-[#141413] pb-3">
              <div className="font-bold text-base tracking-wider text-[#141413]">
                ATM-OS OPERATOR REPORT
              </div>
              <div className="text-[11px] text-[#6F6D67] mt-0.5">
                CERTIFIED EMBEDDED OPERATING SYSTEM LABORATORY
              </div>
            </div>

            <div className="space-y-2 divide-y divide-[#E2E0D8] text-xs">
              <div className="pt-2 first:pt-0 flex justify-between">
                <span className="text-[#6F6D67]">OPERATOR LEVEL:</span>
                <span className="font-bold text-[#141413]">{operatorLevelTitle} (LVL {operatorLevel})</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[#6F6D67]">CHALLENGES COMPLETED:</span>
                <span className="font-bold text-[#141413]">{completedMissionsCount} / {missions.length}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[#6F6D67]">TOTAL XP ACCUMULATED:</span>
                <span className="font-bold text-[#141413]">{operatorScore} XP</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[#6F6D67]">DECISION ACCURACY:</span>
                <span className="font-bold text-[#15803D]">{accuracy}%</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[#6F6D67]">SYSTEM HEALTH:</span>
                <span className="font-bold text-[#15803D]">{systemHealth}%</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[#6F6D67]">ACHIEVEMENTS UNLOCKED:</span>
                <span className="font-bold text-[#141413]">{unlockedAchievementsCount} / {achievements.length}</span>
              </div>
            </div>

            {/* Mastered Algorithms Checklist */}
            <div className="p-3 border border-[#E2E0D8] bg-[#F9F8F6] rounded-[4px] space-y-1">
              <span className="text-[10px] text-[#6F6D67] uppercase font-bold block mb-1">
                ALGORITHMS MASTERED
              </span>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <div className="text-[#15803D]">✓ Priority Scheduling</div>
                <div className="text-[#15803D]">✓ Round Robin (Lanes)</div>
                <div className="text-[#15803D]">✓ Banker&apos;s Algorithm</div>
                <div className="text-[#15803D]">✓ FIFO Page Replacement</div>
                <div className="text-[#15803D]">✓ Indexed File Allocation</div>
              </div>
            </div>

            <div className="text-center font-bold text-[#15803D] text-xs pt-1">
              KERNEL STATUS: STABLE &amp; AUDITED
            </div>

            <div className="pt-3 border-t border-[#E2E0D8] flex gap-2">
              <button
                onClick={() => {
                  setShowFinalReport(false);
                  resetSimulation();
                }}
                className="flex-1 py-2 border border-[#E2E0D8] hover:bg-[#F4F2EB] text-xs font-bold rounded-[3px]"
              >
                RUN AGAIN
              </button>
              <button
                onClick={() => {
                  setShowFinalReport(false);
                  setActiveSection('Simulation Logs');
                }}
                className="flex-1 py-2 bg-[#141413] text-[#F9F8F6] text-xs font-bold rounded-[3px]"
              >
                VIEW EVENT LOG
              </button>
              <button
                onClick={() => setShowFinalReport(false)}
                className="px-3 py-2 border border-[#E2E0D8] text-xs rounded-[3px]"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
