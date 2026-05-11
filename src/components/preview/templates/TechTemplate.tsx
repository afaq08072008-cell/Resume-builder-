import { useResume } from '@/ResumeContext';
import { QRCodeSVG } from 'qrcode.react';
import { Mail, Phone, MapPin, Globe, ExternalLink } from 'lucide-react';

export default function TechTemplate() {
  const { resumeData } = useResume();
  const { personalInfo, sections, settings } = resumeData;
  const primaryColor = settings.primaryColor;

  const experience = sections.find(s => s.type === 'experience')?.content || [];
  const education = sections.find(s => s.type === 'education')?.content || [];
  const skills = sections.find(s => s.type === 'skills')?.content || [];

  return (
    <div className="p-10 flex flex-col h-full bg-white">
      {/* Header */}
      <header className="flex justify-between items-start mb-8">
        <div className="flex-1">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-1" style={{ color: primaryColor }}>
            {personalInfo.fullName}
          </h1>
          <p className="text-lg font-bold text-zinc-700 tracking-tight mb-4 uppercase">
            {personalInfo.jobTitle}
          </p>
          <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {personalInfo.email}</span>
            <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {personalInfo.phone}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {personalInfo.location}</span>
            <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> {personalInfo.website}</span>
          </div>
        </div>

        {/* QR Code Business Card */}
        <div className="text-center">
          <div className="p-1 border-2 border-zinc-100 rounded-lg inline-block bg-white">
            <QRCodeSVG value={personalInfo.website || 'https://apexresume.pro'} size={60} />
          </div>
          <p className="text-[7px] font-bold text-zinc-400 mt-1 uppercase">Profile vCard</p>
        </div>
      </header>

      {/* Summary */}
      <section className="mb-8">
        <div className="h-px bg-zinc-200 w-full mb-4" />
        <p className="text-sm leading-relaxed text-zinc-600 font-medium italic">
          "{personalInfo.summary}"
        </p>
      </section>

      <div className="grid grid-cols-3 gap-10 flex-1">
        {/* Left Column: Core Body */}
        <div className="col-span-2 space-y-8">
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
              Professional Experience
            </h2>
            <div className="space-y-6">
              {experience.map((exp: any) => (
                <div key={exp.id} className="relative pl-4 border-l-2 border-zinc-100">
                  <div className="absolute w-2 h-2 rounded-full border-2 border-white -left-[5px] top-1" style={{ backgroundColor: primaryColor }} />
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm">{exp.position}</h3>
                    <span className="text-[10px] font-bold text-zinc-400">{exp.startDate} — {exp.endDate}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wide">{exp.company}</h4>
                  <p className="text-[11px] leading-relaxed text-zinc-600 mb-2">{exp.description}</p>
                  {exp.highlights?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {exp.highlights.map((h: string, idx: number) => (
                        <span key={idx} className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded text-[9px] font-bold">
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
             <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
              Education
            </h2>
            <div className="space-y-4">
              {education.map((edu: any) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-sm">{edu.school}</h3>
                    <span className="text-[10px] font-bold text-zinc-400">{edu.startDate} — {edu.endDate}</span>
                  </div>
                  <p className="text-xs font-medium text-zinc-600">{edu.degree}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-8">
           <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-4">Core Stack</h2>
            <div className="space-y-3">
              {skills.map((skill: any) => (
                <div key={skill.id} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                    <span>{skill.name}</span>
                    <span style={{ color: primaryColor }}>{skill.level}%</span>
                  </div>
                  <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-1000" 
                      style={{ width: `${skill.level}%`, backgroundColor: primaryColor }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-zinc-50 p-4 rounded-lg">
             <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-4">Certificates</h2>
             <div className="space-y-3">
               <div className="text-[10px]">
                 <p className="font-bold text-zinc-800">AWS Certified Solutions Architect</p>
                 <p className="text-zinc-500 italic mt-0.5">Amazon Web Services • 2023</p>
               </div>
               <div className="text-[10px]">
                 <p className="font-bold text-zinc-800">Professional Scrum Master I</p>
                 <p className="text-zinc-500 italic mt-0.5">Scrum.org • 2022</p>
               </div>
             </div>
          </section>

          <footer className="mt-auto">
            <div className="pt-4 border-t border-zinc-100">
               <p className="text-[8px] font-medium text-zinc-400 leading-tight">
                 This resume was generated via APEX-RESUME PRO. Scan QR code for live portfolio and credentials.
               </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
