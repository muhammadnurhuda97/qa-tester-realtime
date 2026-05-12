/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ClipboardList, PenLine, Settings, Info, Search, LayoutGrid, ChevronRight, Menu, X, Plus, ShieldCheck } from 'lucide-react';
import { cn } from './lib/utils';
import InputPage from './pages/InputPage';
import QAEditorPage from './pages/QAEditorPage';
import TesterNamePage from './pages/TesterNamePage';
import { useChecklist } from './hooks/useChecklist';

import { setCookie, getCookie, eraseCookie } from './lib/cookies';

function Sidebar({ testerName, onLogout }: { testerName: string | null, onLogout: () => void }) {
  const location = useLocation();
  const configurator = getCookie('aksara-qa-last-configurator');

  const navItems = [
    { name: 'QA Dashboard', path: '/', icon: ClipboardList },
  ];

  const isAdminView = location.pathname.startsWith('/internal') || !!configurator;

  return (
    <aside className="w-64 glass border-r hidden md:flex flex-col p-6 z-20 h-screen fixed left-0 top-0">
      <div className="flex items-center gap-3 mb-10 px-2">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg shadow-slate-200 transition-transform hover:scale-105">
            <span className="text-white font-bold text-xs italic">A</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 font-display">Aksara Go <span className="text-indigo-600">QA</span></h1>
        </Link>
      </div>
      
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-all",
              location.pathname === item.path 
                ? "bg-white shadow-sm border border-slate-100 text-indigo-600 font-bold" 
                : "text-slate-600 hover:bg-white/60"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </Link>
        ))}
        
        {isAdminView && (
          <>
            <div className="pt-4 pb-2 px-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Tools</p>
            </div>
            <Link 
              to="/internal/input"
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-all",
                location.pathname === '/internal/input' ? "bg-white shadow-sm border border-slate-100 text-indigo-600 font-bold" : "text-slate-600 hover:bg-white/60"
              )}
            >
              <PenLine className="w-4 h-4" />
              Configure Data
            </Link>
          </>
        )}
      </nav>

      <div className="mt-auto p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-400">Audit Environment</p>
        </div>
        
        {configurator && (
          <div className="mb-4 p-2 bg-white/40 rounded-lg border border-indigo-100/30">
            <p className="text-[8px] text-slate-400 uppercase tracking-widest font-black mb-1">Configured By</p>
            <p className="text-[10px] font-bold text-indigo-600 truncate">{configurator}</p>
          </div>
        )}

        <div className="mb-4">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Active Tester</p>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-700">{testerName || "Not set"}</p>
            {testerName && (
              <button onClick={onLogout} className="text-[9px] font-bold text-indigo-500 hover:underline">Change</button>
            )}
          </div>
        </div>
        <p className="text-[10px] text-slate-500">Cookie identity active</p>
      </div>
    </aside>
  );
}

function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const configurator = getCookie('aksara-qa-last-configurator');

  return (
    <header className="md:hidden glass fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">A</span>
        </div>
        <span className="font-bold text-slate-900 font-display">Aksara Go QA</span>
      </Link>
      <button onClick={() => setIsOpen(!isOpen)} className="p-2">
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.nav 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 glass border-t p-6 flex flex-col gap-4 shadow-xl"
          >
            <Link to="/" onClick={() => setIsOpen(false)} className="text-sm font-bold">Dashboard</Link>
            {(location.pathname.startsWith('/internal') || !!configurator) && (
              <Link to="/internal/input" onClick={() => setIsOpen(false)} className="text-sm font-bold">Configure Data</Link>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export default function App() {
  const checklist = useChecklist();

  if (!checklist.testerName) {
    return (
      <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center p-6">
        <TesterNamePage onNameSubmit={checklist.setTesterName} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-screen selection:bg-indigo-100 selection:text-indigo-900">
        <Sidebar testerName={checklist.testerName} onLogout={() => checklist.setTesterName(null)} />
        <MobileHeader />
        
        <main className="flex-1 flex flex-col relative md:ml-64 overflow-hidden min-h-screen">
          {/* Decorative background elements */}
          <div className="fixed top-[-100px] right-[-100px] w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          <div className="fixed bottom-[-50px] left-[calc(200px+16rem)] w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

          <div className="flex-1 pt-16 md:pt-0">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<QAEditorPage checklist={checklist} />} />
                <Route path="/internal/input" element={<InputPage importJson={checklist.importJson} />} />
              </Routes>
            </AnimatePresence>
          </div>

          <footer className="mt-auto p-4 flex justify-between items-center text-[10px] font-medium text-slate-400 uppercase tracking-widest bg-white/20 border-t border-white/30">
            <span>Audit Trace: {checklist.testerName} (Cookie ID: {getCookie('aksara-qa-uid')?.substring(0, 8)}...)</span>
            <div className="flex gap-4">
              <span>v1.3.0-audit</span>
              <span className="text-indigo-400 font-bold">Cookie-sync active</span>
            </div>
          </footer>
        </main>
      </div>
    </BrowserRouter>
  );
}
