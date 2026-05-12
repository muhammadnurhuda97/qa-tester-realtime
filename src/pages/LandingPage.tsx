import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, BarChart3, Layers } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-7xl px-6 py-20 md:py-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6"
        >
          <Zap className="w-3.2 h-3.2 text-indigo-600" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faster QA Workflows</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 max-w-4xl mb-8 font-display"
        >
          Clean QA Checklists, <span className="text-indigo-600 italic">instantly.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-500 max-w-2xl mb-12 leading-relaxed"
        >
          Transform your JSON module data into professional testing interfaces. 
          Track progress, manage failures, and ship with confidence.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link 
            to="/input" 
            className="group relative px-8 py-4 bg-slate-900 text-white rounded-xl font-bold overflow-hidden transition-all hover:bg-slate-800 shadow-xl shadow-slate-200"
          >
            Create New Checklist
            <ArrowRight className="inline-block ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link 
            to="/checklist" 
            className="px-8 py-4 glass text-slate-800 rounded-xl font-bold hover:bg-white/60 transition-colors"
          >
            View Demo
          </Link>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <ShieldCheck className="w-6 h-6" />,
              title: "Quality Guaranteed",
              desc: "Ensure every edge case is covered with structured testing items."
            },
            {
              icon: <Layers className="w-6 h-6" />,
              title: "Modular Design",
              desc: "Group checklists by modules or features for better organization."
            },
            {
              icon: <BarChart3 className="w-6 h-6" />,
              title: "Visual Progress",
              desc: "Real-time tracking of passes, failures, and overall testing coverage."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl glass-card group transition-all hover:translate-y-[-4px] hover:shadow-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 text-indigo-600">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 font-display">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
