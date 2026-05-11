import { analyzeResume } from "./ai.ts";

export async function calculateATSScore(resumeData: any, jobDescription: string) {
  // Production ATS Engine combines semantic AI analysis with keyword matching
  
  // 1. Keyword Matching (Simplified NLP)
  const resumeText = JSON.stringify(resumeData).toLowerCase();
  const jdKeywords = extractKeywords(jobDescription);
  const matchCount = jdKeywords.filter(kw => resumeText.includes(kw.toLowerCase())).length;
  const keywordScore = (matchCount / (jdKeywords.length || 1)) * 100;

  // 2. AI Semantic Analysis
  const aiAnalysis = await analyzeResume(resumeText, jobDescription);
  
  // 3. Weighted Score
  // Semantic analysis (AI) is 70% of the weight, direct keyword matching is 30%
  const finalScore = Math.round((aiAnalysis.score * 0.7) + (keywordScore * 0.3));

  return {
    score: finalScore,
    aiAnalysis,
    keywordMatch: {
      found: matchCount,
      total: jdKeywords.length,
      missing: jdKeywords.filter(kw => !resumeText.includes(kw.toLowerCase()))
    }
  };
}

function extractKeywords(text: string): string[] {
  // Enhanced common words list for more accurate technical keyword extraction
  const commonWords = new Set([
    'and', 'the', 'with', 'for', 'was', 'were', 'had', 'has', 'have', 'from', 'this', 'that',
    'which', 'when', 'where', 'while', 'their', 'there', 'some', 'other', 'been', 'being',
    'would', 'could', 'should', 'about', 'above', 'below', 'under', 'these', 'those',
    'using', 'through', 'within', 'across', 'toward', 'various', 'several'
  ]);
  
  // Clean text and split by word boundaries
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/);

  const coreWords = words.filter(w => 
    w.length > 2 && 
    !commonWords.has(w) && 
    !/^\d+$/.test(w) // Exclude pure numbers
  );
  
  // Rank by frequency to pick most significant keywords
  const freq: Record<string, number> = {};
  coreWords.forEach(w => freq[w] = (freq[w] || 0) + 1);
  
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(pair => pair[0]);
}
