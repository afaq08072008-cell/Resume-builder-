import { useState } from 'react';
import { Sparkles, Loader2, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { useAI } from '@/lib/AIContext';

interface AIOptimizerProps {
  content: string;
  onOptimize: (optimized: string) => void;
  context?: string; // e.g. "Professional Summary" or "Job Description"
}

export default function AIOptimizer({ content, onOptimize, context = "content" }: AIOptimizerProps) {
  const [loading, setLoading] = useState(false);
  const [optimized, setOptimized] = useState<string | null>(null);
  const { optimizeBullet } = useAI();

  const handleOptimize = async () => {
    if (!content || content.length < 10) return;
    
    setLoading(true);
    try {
      const result = await optimizeBullet(content, context);
      setOptimized(result);
    } catch (error) {
      console.error("AI Optimization failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (optimized) {
      onOptimize(optimized);
      setOptimized(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {optimized ? (
        <div className="flex gap-1">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setOptimized(null)}
            className="text-xs h-7 px-2 text-zinc-500"
          >
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={handleApply}
            className="text-xs h-7 px-2 bg-green-600 hover:bg-green-700"
          >
            <Check className="w-3 h-3 mr-1" /> Apply AI Version
          </Button>
        </div>
      ) : (
        <Button 
          variant="ghost" 
          size="sm" 
          disabled={loading || content.length < 10}
          onClick={handleOptimize}
          className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 h-7 text-xs px-2"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3 mr-1" />
          )}
          {loading ? "Optimizing..." : "AI Optimize"}
        </Button>
      )}
    </div>
  );
}
