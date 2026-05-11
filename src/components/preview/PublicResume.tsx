import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ResumeData } from '@/types';
import TechTemplate from './templates/TechTemplate';
import ExecutiveTemplate from './templates/ExecutiveTemplate';
import CreativeTemplate from './templates/CreativeTemplate';
import MinimalistTemplate from './templates/MinimalistTemplate';
import { ResumeProvider } from '@/ResumeContext';
import { Loader2 } from 'lucide-react';

export default function PublicResume() {
  const { resumeId } = useParams();
  const [data, setData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResume() {
      if (!resumeId) return;
      try {
        const docRef = doc(db, 'resumes', resumeId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const resumeData = docSnap.data() as ResumeData;
          if (resumeData.settings?.isPublic) {
            setData(resumeData);
          } else {
            setError("This resume is private.");
          }
        } else {
          setError("Resume not found.");
        }
      } catch (err) {
        setError("Failed to load resume.");
      } finally {
        setLoading(false);
      }
    }
    fetchResume();
  }, [resumeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white text-center p-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">404</h1>
          <p className="text-zinc-500">{error || "Something went wrong."}</p>
        </div>
      </div>
    );
  }

  const renderTemplate = () => {
    const templateId = data.settings.templateId;
    switch (templateId) {
      case 'tech': return <TechTemplate />;
      case 'executive': return <ExecutiveTemplate />;
      case 'creative': return <CreativeTemplate />;
      case 'minimalist': return <MinimalistTemplate />;
      default: return <TechTemplate />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4 flex justify-center">
      <div 
         className="bg-white text-black shadow-2xl"
         style={{ width: '210mm', minHeight: '297mm' }}
      >
        <ResumeProvider initialData={data}>
           {renderTemplate()}
        </ResumeProvider>
      </div>
    </div>
  );
}
