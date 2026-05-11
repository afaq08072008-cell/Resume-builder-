import { useResume } from '@/ResumeContext';
import { motion, AnimatePresence } from 'motion/react';
import TechTemplate from './templates/TechTemplate';
import ExecutiveTemplate from './templates/ExecutiveTemplate';
import CreativeTemplate from './templates/CreativeTemplate';
import MinimalistTemplate from './templates/MinimalistTemplate';
import { cn } from '@/lib/utils';

export default function A4Canvas() {
  const { resumeData } = useResume();
  const { templateId, fontFamily } = resumeData.settings;

  const fontClasses = {
    inter: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono'
  };

  const renderTemplate = () => {
    switch (templateId) {
      case 'tech': return <TechTemplate />;
      case 'executive': return <ExecutiveTemplate />;
      case 'creative': return <CreativeTemplate />;
      case 'minimalist': return <MinimalistTemplate />;
      default: return <TechTemplate />;
    }
  };

  return (
    <div 
      className={cn(
        "bg-white shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] text-black origin-top print:shadow-none print:m-0",
        fontClasses[fontFamily]
      )}
      style={{
        width: '210mm',
        minHeight: '297mm',
        transform: 'scale(1)', // Scaling can be handled via CSS or state if needed
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={templateId}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="h-full"
        >
          {renderTemplate()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
