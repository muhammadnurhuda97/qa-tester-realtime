import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, CheckCircle2, XCircle, MinusCircle, LayoutList, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TestStatus, ChecklistGroup, ChecklistItem } from '../types';
import { cn } from '../lib/utils';

interface QAEditorPageProps {
  checklist: {
    groups: ChecklistGroup[];
    updateStatus: (groupId: string, itemId: string, status: TestStatus) => void;
    submitCycle: () => Promise<void>;
    stats: {
      total: number;
      passed: number;
      failed: number;
      progress: number;
    };
    testerName: string | null;
  };
}

export default function QAEditorPage({ checklist }: QAEditorPageProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<TestStatus | 'ALL'>('ALL');

  const filteredGroups = useMemo(() => {
    return checklist.groups.map(group => ({
      ...group,
      items: group.items.filter(item => {
        const matchesSearch = item.text.toLowerCase().includes(search.toLowerCase()) || 
                             group.module.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
        return matchesSearch && matchesStatus;
      })
    })).filter(group => group.items.length > 0);
  }, [checklist.groups, search, filterStatus]);

  if (checklist.groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-16 h-16 glass rounded-3xl flex items-center justify-center mb-6">
          <LayoutList className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Active Session</h2>
        <p className="text-slate-500 mb-8 max-w-xs text-sm">Hello, <span className="text-slate-900 font-bold">{checklist.testerName}</span>. Please import test data to begin your QA session.</p>
        <Link to="/internal/input" className="px-6 py-3 bg-slate-900 text-white rounded-full font-bold shadow-xl shadow-slate-200">
          Import JSON
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Internal Header */}
      <header className="h-24 glass border-b px-8 flex items-center justify-between z-10 sticky top-0 md:top-0">
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-start pr-6 border-r border-slate-200">
            <span className="text-[9px] uppercase tracking-widest font-black text-indigo-400 mb-1">Active Tester</span>
            <span className="text-sm font-bold text-slate-800">{checklist.testerName}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-widest font-black text-indigo-600">QA Operational Dashboard</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-700 text-[10px] font-bold uppercase tracking-tight">Live Session</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold">
                {checklist.groups[0]?.module.toUpperCase() || "ACTIVE MODULE"}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-none font-display">Testing Cycle Results</h2>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-8">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{checklist.stats.passed} Passed</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">{checklist.stats.failed} Failed</span>
            </div>
            <div className="w-48 h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${checklist.stats.progress}%` }}
                className="h-full bg-indigo-500" 
              />
            </div>
          </div>
          <button 
            onClick={() => checklist.submitCycle()}
            className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
          >
            Submit Cycle
          </button>
        </div>
      </header>

      <div className="p-8 pb-32">
        {/* Editor Controls */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/60 border border-white rounded-xl px-11 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5" 
            />
          </div>
          <div className="flex gap-2">
            {['ALL', TestStatus.PASS, TestStatus.FAIL, TestStatus.NOT_TESTED].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={cn(
                  "px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all",
                  filterStatus === status 
                    ? "bg-slate-900 text-white shadow-sm" 
                    : "bg-white/60 text-slate-500 hover:text-slate-800"
                )}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredGroups.flatMap((group) => 
              group.items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-5 rounded-2xl flex items-start justify-between border-slate-100"
                >
                  <div className="flex gap-4">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2 shrink-0 transition-all",
                      item.status === TestStatus.PASS ? "bg-emerald-500 ring-4 ring-emerald-50" : 
                      item.status === TestStatus.FAIL ? "bg-rose-500 ring-4 ring-rose-50" : 
                      "bg-slate-300"
                    )} />
                    <div>
                      <h3 className={cn("font-bold text-sm mb-1 transition-all", item.status === TestStatus.PASS && "text-slate-400")}>
                        {item.text}
                      </h3>
                      <div className="flex items-center gap-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{group.module}</p>
                        {item.testedBy && (
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-indigo-400" />
                            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-tight">
                              Tested by <span className="underline decoration-indigo-200 underline-offset-2">{item.testedBy}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 items-end shrink-0 ml-4">
                    <div className="flex gap-1">
                      <ActionIconButton 
                        active={item.status === TestStatus.PASS}
                        onClick={() => checklist.updateStatus(group.id, item.id, TestStatus.PASS)}
                        variant="PASS"
                      />
                      <ActionIconButton 
                        active={item.status === TestStatus.FAIL}
                        onClick={() => checklist.updateStatus(group.id, item.id, TestStatus.FAIL)}
                        variant="FAIL"
                      />
                    </div>
                    {item.status !== TestStatus.NOT_TESTED && (
                      <button 
                        onClick={() => checklist.updateStatus(group.id, item.id, TestStatus.NOT_TESTED)}
                        className="text-[9px] font-bold text-slate-400 hover:text-indigo-600 uppercase underline underline-offset-4"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ActionIconButton({ active, onClick, variant }: { active: boolean, onClick: () => void, variant: 'PASS' | 'FAIL' }) {
  const isPass = variant === 'PASS';
  const colorClass = isPass ? "bg-emerald-500" : "bg-rose-500";
  
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-2 rounded-lg transition-all",
        active 
          ? `${colorClass} text-white scale-110 shadow-lg shadow-current/20` 
          : "bg-white border border-slate-100 text-slate-300 hover:text-slate-600"
      )}
    >
      {isPass ? (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </button>
  );
}
