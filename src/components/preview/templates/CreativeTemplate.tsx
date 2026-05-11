import { useResume } from '@/ResumeContext';

export default function CreativeTemplate() {
  const { resumeData } = useResume();
  const { personalInfo, sections, settings } = resumeData;
  const primaryColor = settings.primaryColor;

  const experience = sections.find(s => s.type === 'experience')?.content || [];
  const skills = sections.find(s => s.type === 'skills')?.content || [];

  return (
    <div className="flex h-full bg-zinc-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[30%] bg-zinc-900 text-white p-8 flex flex-col">
        <div className="mb-12">
          <h1 className="text-3xl font-black leading-none mb-2">APEX</h1>
          <p className="text-xs font-bold text-zinc-500 tracking-widest uppercase mb-12">Creative ID</p>
          
          <div className="space-y-6 text-[10px] font-medium tracking-tight overflow-hidden">
            <div className="space-y-1">
              <p className="text-zinc-500 uppercase text-[8px] font-bold tracking-[0.2em] mb-1">Contact</p>
              <p>{personalInfo.email}</p>
              <p>{personalInfo.phone}</p>
              <p>{personalInfo.location}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-zinc-500 uppercase text-[8px] font-bold tracking-[0.2em] mb-1">Digital</p>
              <p className="truncate underline">{personalInfo.website}</p>
            </div>
          </div>
        </div>

        <section className="mb-12">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-zinc-400">Toolkit</h2>
          <div className="space-y-4">
            {skills.map((skill: any) => (
              <div key={skill.id} className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest">{skill.name}</p>
                <div className="flex gap-1 justify-between">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 flex-1 rounded-full ${i < Math.round(skill.level / 20) ? 'bg-white' : 'bg-zinc-800'}`} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-auto p-4 border border-zinc-800 rounded-xl text-center">
          <p className="text-[9px] font-black italic tracking-tighter" style={{ color: primaryColor }}>"Design is intelligence made visible."</p>
        </div>
      </aside>

      {/* Main Body */}
      <main className="flex-1 p-12 bg-white flex flex-col">
        <header className="mb-12 relative">
          <div className="absolute -top-12 -left-12 w-32 h-32 opacity-10 rounded-full scale-150" style={{ backgroundColor: primaryColor }} />
          <h1 className="text-6xl font-black tracking-tighter uppercase mb-2 relative z-10">
            {personalInfo.fullName.split(' ')[0]}<br/>
            <span style={{ color: primaryColor }}>{personalInfo.fullName.split(' ')[1]}</span>
          </h1>
          <p className="text-lg font-bold tracking-widest uppercase text-zinc-400">{personalInfo.jobTitle}</p>
        </header>

        <section className="mb-12">
          <p className="text-base font-medium leading-relaxed text-zinc-600">
            {personalInfo.summary}
          </p>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xl font-black uppercase tracking-tighter">Selected Works</h2>
            <div className="flex-1 h-px bg-zinc-100" />
          </div>
          <div className="space-y-10">
             {experience.map((exp: any) => (
               <div key={exp.id} className="group cursor-default">
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="text-lg font-bold group-hover:text-blue-600 transition-colors">{exp.position}</h3>
                    <span className="text-[10px] font-black uppercase px-2 py-1 bg-zinc-50 rounded text-zinc-400">{exp.startDate} — {exp.endDate}</span>
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-3">{exp.company}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed max-w-lg">{exp.description}</p>
               </div>
             ))}
          </div>
        </section>
      </main>
    </div>
  );
}
