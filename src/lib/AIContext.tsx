import { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useResume } from '../ResumeContext';

interface AIService {
  isAnalyzing: boolean;
  scoreData: any | null;
  analyze: (jobDescription: string) => Promise<void>;
  optimizeBullet: (bullet: string, context: string) => Promise<string>;
}

const AIContext = createContext<AIService | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { resumeData } = useResume();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scoreData, setScoreData] = useState<any | null>(null);

  const analyze = async (jobDescription: string) => {
    if (!user) return;
    setIsAnalyzing(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/ats/score', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resumeData, jobDescription }),
      });
      const data = await response.json();
      setScoreData(data);
    } catch (err) {
      console.error("AI Analysis failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const optimizeBullet = async (bullet: string, context: string) => {
    if (!user) return bullet;
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/ai/optimize-bullet', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bullet, context }),
      });
      const { optimized } = await response.json();
      return optimized;
    } catch (err) {
      console.error("Bullet optimization failed", err);
      return bullet;
    }
  };

  return (
    <AIContext.Provider value={{ isAnalyzing, scoreData, analyze, optimizeBullet }}>
      {children}
    </AIContext.Provider>
  );
}

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) throw new Error("useAI must be used within AIProvider");
  return context;
};
