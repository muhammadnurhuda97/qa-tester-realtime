import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, ArrowRight } from 'lucide-react';

interface TesterNamePageProps {
  onNameSubmit: (name: string) => void;
}

export default function TesterNamePage({ onNameSubmit }: TesterNamePageProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSubmit(name.trim());
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 rounded-[32px] w-full max-w-md shadow-2xl shadow-indigo-100"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 mb-6">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold font-display text-slate-900 mb-2">Identify Yourself</h2>
          <p className="text-slate-500 text-sm">Please enter your name to start the QA session.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="tester-name" className="text-[10px] uppercase tracking-widest font-black text-slate-400 block mb-2 px-1">
              Tester Full Name
            </label>
            <input
              id="tester-name"
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 placeholder:text-slate-300"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-30 group"
          >
            Enter Dashboard
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
