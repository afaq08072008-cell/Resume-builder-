import { useResume } from '@/ResumeContext';

export default function MinimalistTemplate() {
  const { resumeData } = useResume();
  const { personalInfo, sections, settings } = resumeData;
  const primaryColor = settings.primaryColor;

  const experience = sections.find(s => s.type === 'experience')?.content || [];
  const education = sections.find(s => s.type === 'education')?.content || [];
  const skills = sections.find(s => s.type === 'skills')?.content || [];

  return (
    <div className="p-12 h-full bg-white text-zinc-900 font-sans text-[11px]">
      <header className="mb-10 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-[0.3em] mb-2">{personalInfo.fullName}</h1>
        <div className="flex justify-center gap-4 text-zinc-500 uppercase font-medium tracking-widest text-[9px]">
          <span>{personalInfo.email}</span>
          <span>|</span>
          <span>{personalInfo.phone}</span>
          <span>|</span>
          <span>{personalInfo.location}</span>
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-zinc-100 mb-3 pb-1" style={{ color: primaryColor }}>Core Professional Summary</h2>
        <p className="text-zinc-600 leading-relaxed text-justify px-2">
          {personalInfo.summary}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-zinc-100 mb-4 pb-1" style={{ color: primaryColor }}>Professional Background</h2>
        <div className="space-y-6">
          {experience.map((exp: any) => (
            <div key={exp.id} className="grid grid-cols-4 gap-4">
               <div className="col-span-1 text-zinc-400 font-bold uppercase tracking-tight">
                 {exp.startDate} - {exp.endDate}
               </div>
               <div className="col-span-3">
                 <h3 className="font-bold text-zinc-800 uppercase">{exp.position}</h3>
                 <p className="font-bold text-zinc-400 text-[10px] mb-2">{exp.company}</p>
                 <p className="text-zinc-600 leading-relaxed text-justify">
                   {exp.description}
                 </p>
               </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-zinc-100 mb-3 pb-1" style={{ color: primaryColor }}>Technical Inventory</h2>
        <div className="flex flex-wrap gap-x-6 gap-y-2 px-2">
           {skills.map((s: any) => (
             <div key={s.id} className="flex gap-2 items-baseline">
               <span className="font-bold uppercase text-zinc-800">{s.name}</span>
               <span className="text-zinc-300 font-medium">{s.level}%</span>
             </div>
           ))}
        </div>
      </section>

      <section>
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-zinc-100 mb-3 pb-1" style={{ color: primaryColor }}>Education</h2>
        <div className="space-y-2 px-2">
           {education.map((edu: any) => (
             <div key={edu.id} className="flex justify-between">
               <span className="font-bold">{edu.school} — <span className="font-normal text-zinc-500 italic">{edu.degree}</span></span>
               <span className="text-zinc-400 font-bold uppercase">{edu.endDate}</span>
             </div>
           ))}
        </div>
      </section>
    </div>
  );
}
