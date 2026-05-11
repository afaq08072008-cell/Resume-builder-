import { useResume } from '@/ResumeContext';

export default function ExecutiveTemplate() {
  const { resumeData } = useResume();
  const { personalInfo, sections, settings } = resumeData;
  const primaryColor = settings.primaryColor;

  const experience = sections.find(s => s.type === 'experience')?.content || [];
  const education = sections.find(s => s.type === 'education')?.content || [];

  return (
    <div className="p-16 flex flex-col h-full bg-white text-zinc-900 font-serif">
      <header className="text-center mb-12 border-b-2 border-zinc-900 pb-8">
        <h1 className="text-5xl uppercase tracking-tighter mb-2" style={{ color: primaryColor }}>
          {personalInfo.fullName}
        </h1>
        <p className="text-xl italic font-light text-zinc-600 mb-6 tracking-wide">
          {personalInfo.jobTitle}
        </p>
        <div className="flex justify-center gap-8 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          <span>{personalInfo.location}</span>
          <span>•</span>
          <span>{personalInfo.email}</span>
          <span>•</span>
          <span>{personalInfo.phone}</span>
        </div>
      </header>

      <section className="mb-12">
        <h2 className="text-lg font-bold border-b border-zinc-200 mb-4 pb-1 uppercase tracking-widest" style={{ color: primaryColor }}>
          Executive Summary
        </h2>
        <p className="text-sm leading-relaxed text-zinc-700 text-justify italic">
          {personalInfo.summary}
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-lg font-bold border-b border-zinc-200 mb-6 pb-1 uppercase tracking-widest" style={{ color: primaryColor }}>
          Professional Experience
        </h2>
        <div className="space-y-10">
          {experience.map((exp: any) => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="font-bold text-base uppercase">{exp.company}</h3>
                <span className="text-xs font-bold text-zinc-500">{exp.startDate} — {exp.endDate}</span>
              </div>
              <div className="flex justify-between items-baseline mb-3">
                <p className="text-sm font-bold text-zinc-700 italic">{exp.position}</p>
                <span className="text-[11px] text-zinc-400">{exp.location}</span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-600 mb-3 ml-4 border-l-2 border-zinc-100 pl-4">
                {exp.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-lg font-bold border-b border-zinc-200 mb-4 pb-1 uppercase tracking-widest" style={{ color: primaryColor }}>
          Academic Foundation
        </h2>
        <div className="space-y-6">
          {education.map((edu: any) => (
            <div key={edu.id} className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-sm uppercase">{edu.school}</h3>
                <p className="text-sm italic text-zinc-600">{edu.degree}</p>
              </div>
              <span className="text-xs font-bold text-zinc-500">{edu.startDate} — {edu.endDate}</span>
            </div>
          ))}
        </div>
      </section>
      
      <footer className="mt-auto text-center pt-8 border-t border-zinc-100">
        <p className="text-[10px] text-zinc-400 tracking-[0.2em] font-bold uppercase">References available upon request</p>
      </footer>
    </div>
  );
}
