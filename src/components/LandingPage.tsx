import { motion } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { Button } from './ui/button';
import { Sparkles, CheckCircle, ArrowRight, Github } from 'lucide-react';

export default function LandingPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden selection:bg-blue-500/30">
      {/* Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8"
        >
          <Sparkles className="w-3 h-3" />
          The Future of Resume Building
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent"
        >
          LAND THE INTERVIEW.<br />
          WITH <span className="text-blue-500">APEX</span> PRECISION.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          An AI-powered SaaS designed to craft high-performance resumes that bypass ATS filters and catch recruiters' attention. Pixel-perfect, data-driven, and results-oriented.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white h-14 px-8 text-lg font-bold rounded-2xl shadow-2xl shadow-blue-600/30 group"
            onClick={login}
          >
            Build Your Resume
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="h-14 px-8 text-lg font-bold border-white/10 hover:bg-white/5 rounded-2xl"
          >
            View Templates
          </Button>
        </motion.div>
      </div>

      {/* Feature Grid */}
      <div className="relative py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "ATS Optimizer", desc: "Real-time scoring based on keyword density and layout safety.", icon: <CheckCircle className="text-blue-500" /> },
          { title: "AI Enhancer", desc: "Rewrite weak bullets into powerful impact statements automatically.", icon: <Sparkles className="text-purple-500" /> },
          { title: "Cloud Sync", desc: "Your data is always persistent, accessible from any device.", icon: <Github className="text-green-500" /> }
        ].map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
            className="p-8 rounded-3xl bg-white/5 border border-white/10 glass"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6">
              {f.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{f.title}</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
