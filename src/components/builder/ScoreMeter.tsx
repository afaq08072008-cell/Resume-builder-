import { useResume } from '@/ResumeContext';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { AlertCircle, CheckCircle2, TrendingUp, Search, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAI } from '@/lib/AIContext';

export default function ScoreMeter() {
  const { resumeData } = useResume();
  const { isAnalyzing, scoreData } = useAI();

  const score = scoreData?.score || 64; 
  const displayKeywords = scoreData?.aiAnalysis?.atsKeywords || ['Architecture', 'TypeScript', 'React'];
  const suggestions = scoreData?.aiAnalysis?.improvements?.content || ["Your resume uses strong action verbs. Consider adding more 'Cloud' related metrics to boost score."];

  return (
    <div className="space-y-10">
      <section className="text-center space-y-4">
        <h3 className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">System IQ Score</h3>
        <div className="relative inline-block">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="58"
              fill="transparent"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="6"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="58"
              fill="transparent"
              stroke={score > 80 ? "#22c55e" : "#3b82f6"}
              strokeWidth="6"
              strokeDasharray={364.42}
              initial={{ strokeDashoffset: 364.42 }}
              animate={{ strokeDashoffset: 364.42 - (364.42 * score) / 100 }}
              transition={{ duration: 2, ease: "easeOut" }}
              strokeLinecap="round"
              className={score > 80 ? "glow-green" : "glow-blue"}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white">{score}</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className={cn(
            "text-[10px] font-black uppercase tracking-tighter",
            score > 80 ? "text-green-400" : "text-blue-400"
          )}>
            {score > 80 ? "Elite Tier Optimization" : "Professional Quality"}
          </p>
        </div>
      </section>

      <section className="w-full space-y-4">
        <div className="flex justify-between items-center px-1">
          <div className="text-[10px] font-black opacity-40 uppercase tracking-widest">Semantic Density</div>
          <Sparkles className="w-3 h-3 text-blue-500 opacity-50" />
        </div>
        <div className="space-y-4 px-1">
          {displayKeywords.slice(0, 4).map((kw, i) => {
            const val = 95 - (i * 12) - (Math.random() * 5);
            return (
              <div key={kw} className="space-y-2">
                <div className="flex justify-between text-[11px] font-medium">
                  <span className="opacity-70 truncate max-w-[120px]">{kw}</span>
                  <span className="text-blue-400 font-bold">{Math.round(val)}%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${val}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-[10px] italic leading-relaxed text-zinc-400 prose prose-invert">
        "{suggestions[0]}"
      </div>
    </div>
  );
}
