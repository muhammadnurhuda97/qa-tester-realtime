import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Code2, Play, AlertCircle, Copy, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface InputPageProps {
  importJson: (json: string) => void;
}

const EXAMPLE_JSON = `{
  "module": "User Profile Settings",
  "items": [
    "Verify avatar upload works with 2MB limits",
    "Check email validation on update",
    "Ensure 'Delete Account' requires confirmation",
    "Test language toggle persistence",
    "Verify dark mode switch"
  ]
}`;

export default function InputPage({ importJson }: InputPageProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleImport = () => {
    try {
      importJson(jsonInput);
      setError(null);
      navigate('/');
    } catch (e) {
      setError('Invalid JSON format. Please check your data.');
    }
  };

  const loadExample = () => {
    setJsonInput(EXAMPLE_JSON);
    setError(null);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card rounded-[32px] overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/50 flex items-center justify-between bg-white/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-display text-slate-900">Configure Test Data</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">JSON Input Panel</p>
            </div>
          </div>
          <button 
            onClick={loadExample}
            className="text-sm font-bold text-indigo-500 hover:text-indigo-700 transition-colors underline underline-offset-4"
          >
            Load Example
          </button>
        </div>

        {/* Editor Area */}
        <div className="p-8">
          <div className="relative group">
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{ "module": "My Feature", "items": ["Task 1", "Task 2"] }'
              className={cn(
                "w-full h-80 p-6 bg-white/50 rounded-2xl font-mono text-sm resize-none focus:outline-none focus:ring-4 transition-all border",
                error ? "border-rose-300 focus:ring-rose-500/5 shadow-inner" : "border-white focus:ring-indigo-500/5 shadow-inner"
              )}
            />
            
            <div className="absolute top-4 right-4 flex gap-2">
              <button 
                onClick={copyToClipboard}
                className="p-2 rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                title="Copy JSON"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-3 uppercase tracking-wider"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400 max-w-[280px]">
              Paste your standard module JSON to automatically generate your QA testing environment.
            </p>
            <button 
              onClick={handleImport}
              disabled={!jsonInput.trim()}
              className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-30 disabled:shadow-none"
            >
              <Play className="w-4 h-4 fill-current" />
              Generate Checklist
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
