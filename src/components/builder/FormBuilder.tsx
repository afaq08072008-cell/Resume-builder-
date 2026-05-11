import { useResume } from '@/ResumeContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Button } from '../ui/button';
import { Plus, Trash2, GripVertical, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AIOptimizer from '../ai/AIOptimizer';

export default function FormBuilder() {
  const { resumeData, updatePersonalInfo, addSectionItem, updateSectionItem, removeSectionItem } = useResume();

  return (
    <div className="p-6 pb-32 space-y-8">
      <header className="mb-6 px-1">
        <h2 className="text-xl font-black tracking-tight text-white uppercase">Content Builder</h2>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Refine your professional data</p>
      </header>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1 mb-8 w-full">
          <TabsTrigger value="personal" className="flex-1 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white/10">Personal</TabsTrigger>
          <TabsTrigger value="content" className="flex-1 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white/10">Roles</TabsTrigger>
          <TabsTrigger value="skills" className="flex-1 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white/10">Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40">Full Name</Label>
              <Input 
                value={resumeData.personalInfo.fullName} 
                onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
                className="bg-white/5 border-white/10 focus:border-blue-600 focus:bg-white/10 transition-all h-10 text-sm font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40">Job Title</Label>
              <Input 
                value={resumeData.personalInfo.jobTitle} 
                onChange={(e) => updatePersonalInfo({ jobTitle: e.target.value })}
                className="bg-white/5 border-white/10 focus:border-blue-600 focus:bg-white/10 transition-all h-10 text-sm font-medium"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40">Email</Label>
              <Input 
                value={resumeData.personalInfo.email} 
                onChange={(e) => updatePersonalInfo({ email: e.target.value })}
                className="bg-white/5 border-white/10 focus:border-blue-600 focus:bg-white/10 transition-all h-10 text-sm font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40">Phone</Label>
              <Input 
                value={resumeData.personalInfo.phone} 
                onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
                className="bg-white/5 border-white/10 focus:border-blue-600 focus:bg-white/10 transition-all h-10 text-sm font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase opacity-40">Location</Label>
            <Input 
              value={resumeData.personalInfo.location} 
              onChange={(e) => updatePersonalInfo({ location: e.target.value })}
              className="bg-white/5 border-white/10 focus:border-blue-600 h-10 text-sm font-medium"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-[10px] font-black uppercase opacity-40">Summary</Label>
              <AIOptimizer 
                content={resumeData.personalInfo.summary}
                onOptimize={(val) => updatePersonalInfo({ summary: val })}
                context="professional summary"
              />
            </div>
            <Textarea 
              value={resumeData.personalInfo.summary} 
              onChange={(e) => updatePersonalInfo({ summary: e.target.value })}
              className="bg-white/5 border-white/10 min-h-[140px] resize-none focus:bg-white/10 transition-all text-sm leading-relaxed"
            />
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-10">
          <SectionEditor sectionType="experience" title="Work Experience" />
          <div className="h-px bg-white/5" />
          <SectionEditor sectionType="education" title="Education" />
        </TabsContent>

        <TabsContent value="skills" className="space-y-8">
          <SectionEditor sectionType="skills" title="Technical Arsenal" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SectionEditor({ sectionType, title }: { sectionType: string; title: string }) {
  const { resumeData, addSectionItem, updateSectionItem, removeSectionItem } = useResume();
  const section = resumeData.sections.find(s => s.type === sectionType);
  
  if (!section) return null;

  const handleAddItem = () => {
    const defaultItems: any = {
      experience: { id: Math.random().toString(36).substr(2, 9), company: '', position: '', startDate: '', endDate: '', description: '', highlights: [] },
      education: { id: Math.random().toString(36).substr(2, 9), school: '', degree: '', startDate: '', endDate: '', description: '' },
      skills: { id: Math.random().toString(36).substr(2, 9), name: '', level: 80 }
    };
    addSectionItem(section.id, defaultItems[sectionType]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-2">
          {title}
        </h3>
        <Button size="sm" variant="ghost" className="text-blue-500 hover:bg-blue-500/10 h-8 text-[10px] font-black uppercase tracking-widest" onClick={handleAddItem}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add
        </Button>
      </div>

      <Accordion type="multiple" className="space-y-3">
        <AnimatePresence initial={false}>
          {section.content.map((item, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={item.id}
            >
              <AccordionItem value={item.id} className="border border-white/5 bg-white/2 rounded-xl overflow-hidden px-0">
                <div className="flex items-center px-4 hover:bg-white/5 transition-colors group">
                  <GripVertical className="w-4 h-4 text-white/20 group-hover:text-white/40 cursor-grab active:cursor-grabbing mr-2" />
                  <AccordionTrigger className="flex-1 py-4 hover:no-underline text-left">
                    <span className="text-xs font-bold text-white/80">
                      {sectionType === 'skills' ? item.name : (item.company || item.school || `New ${title} Entry`)}
                    </span>
                  </AccordionTrigger>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white/20 hover:text-red-500 h-8 w-8 ml-2 hover:bg-red-500/10"
                    onClick={() => removeSectionItem(section.id, item.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <AccordionContent className="p-4 border-t border-white/5 bg-black/20">
                  <div className="space-y-5">
                    {sectionType === 'experience' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                             <Label className="text-[9px] font-black uppercase opacity-30">Company</Label>
                             <Input placeholder="Tech Corp" value={item.company} onChange={(e) => updateSectionItem(section.id, item.id, { company: e.target.value })} className="bg-white/5 border-white/10 h-9 text-xs" />
                           </div>
                           <div className="space-y-1.5">
                             <Label className="text-[9px] font-black uppercase opacity-30">Position</Label>
                             <Input placeholder="Lead dev" value={item.position} onChange={(e) => updateSectionItem(section.id, item.id, { position: e.target.value })} className="bg-white/5 border-white/10 h-9 text-xs" />
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                             <Label className="text-[9px] font-black uppercase opacity-30">Start Date</Label>
                             <Input placeholder="2021" value={item.startDate} onChange={(e) => updateSectionItem(section.id, item.id, { startDate: e.target.value })} className="bg-white/5 border-white/10 h-9 text-xs" />
                          </div>
                          <div className="space-y-1.5">
                             <Label className="text-[9px] font-black uppercase opacity-30">End Date</Label>
                             <Input placeholder="Present" value={item.endDate} onChange={(e) => updateSectionItem(section.id, item.id, { endDate: e.target.value })} className="bg-white/5 border-white/10 h-9 text-xs" />
                          </div>
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between items-center">
                             <Label className="text-[9px] font-black uppercase opacity-30">Description</Label>
                             <AIOptimizer 
                               content={item.description}
                               onOptimize={(val) => updateSectionItem(section.id, item.id, { description: val })}
                               context="job description"
                             />
                           </div>
                           <Textarea placeholder="Managed scaling..." value={item.description} onChange={(e) => updateSectionItem(section.id, item.id, { description: e.target.value })} className="bg-white/5 border-white/10 min-h-[100px] text-xs leading-relaxed" />
                        </div>
                      </>
                    )}
                    {sectionType === 'education' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                             <Label className="text-[9px] font-black uppercase opacity-30">Institution</Label>
                             <Input placeholder="MIT" value={item.school} onChange={(e) => updateSectionItem(section.id, item.id, { school: e.target.value })} className="bg-white/5 border-white/10 h-9 text-xs" />
                           </div>
                           <div className="space-y-1.5">
                             <Label className="text-[9px] font-black uppercase opacity-30">Degree</Label>
                             <Input placeholder="BS CS" value={item.degree} onChange={(e) => updateSectionItem(section.id, item.id, { degree: e.target.value })} className="bg-white/5 border-white/10 h-9 text-xs" />
                           </div>
                        </div>
                        <Textarea placeholder="Notable honors..." value={item.description} onChange={(e) => updateSectionItem(section.id, item.id, { description: e.target.value })} className="bg-white/5 border-white/10 h-20 text-xs" />
                      </>
                    )}
                    {sectionType === 'skills' && (
                      <div className="grid grid-cols-4 gap-4 items-end">
                        <div className="col-span-3 space-y-1.5">
                           <Label className="text-[9px] font-black uppercase opacity-30">Skill Name</Label>
                           <Input placeholder="React" value={item.name} onChange={(e) => updateSectionItem(section.id, item.id, { name: e.target.value })} className="bg-white/5 border-white/10 h-9 text-xs" />
                        </div>
                        <div className="space-y-1.5">
                           <Label className="text-[9px] font-black uppercase opacity-30">Expertise %</Label>
                           <Input type="number" value={item.level} onChange={(e) => updateSectionItem(section.id, item.id, { level: Number(e.target.value) })} className="bg-white/5 border-white/10 h-9 text-xs" />
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </AnimatePresence>
      </Accordion>
    </div>
  );
}
