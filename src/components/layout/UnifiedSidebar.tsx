import { useResume } from '@/ResumeContext';
import { TEMPLATES } from '@/constants';
import { Card, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function UnifiedSidebar() {
  const { resumeData, updateSettings } = useResume();

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 px-2">Master Templates</h3>
        <div className="grid gap-4">
          {TEMPLATES.map((template) => (
            <Card 
              key={template.id}
              className={cn(
                "cursor-pointer transition-all duration-300 border-zinc-800 bg-zinc-900/50 hover:border-blue-500 group",
                resumeData.settings.templateId === template.id && "border-blue-600 ring-1 ring-blue-600 bg-blue-600/5"
              )}
              onClick={() => updateSettings({ templateId: template.id })}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold">{template.name}</h4>
                  <p className="text-xs text-zinc-500 line-clamp-1">{template.description}</p>
                </div>
                {resumeData.settings.templateId === template.id && (
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 px-2">Typography & Layout</h3>
        <div className="space-y-6 px-2">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <Label>Font Family</Label>
              <span className="text-zinc-500 capitalize">{resumeData.settings.fontFamily}</span>
            </div>
            <div className="flex gap-2">
              {['inter', 'serif', 'mono'].map((f) => (
                <button
                  key={f}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-bold uppercase border border-zinc-800 rounded hover:border-zinc-600",
                    resumeData.settings.fontFamily === f && "bg-zinc-100 text-black border-white"
                  )}
                  onClick={() => updateSettings({ fontFamily: f as any })}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <Label>Content Spacing</Label>
              <span className="text-zinc-500 capitalize">{resumeData.settings.spacing}</span>
            </div>
            <Slider 
              defaultValue={[50]} 
              max={100} 
              step={50} 
              onValueChange={(val) => {
                const map = { 0: 'compact', 50: 'normal', 100: 'loose' };
                updateSettings({ spacing: map[val[0] as 0 | 50 | 100] as any });
              }}
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 px-2">Accent Color</h3>
        <div className="grid grid-cols-5 gap-3 px-2">
          {['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea'].map((color) => (
            <button
              key={color}
              className={cn(
                "w-full aspect-square rounded-full border-2 border-transparent transition-transform hover:scale-110",
                resumeData.settings.primaryColor === color && "border-white"
              )}
              style={{ backgroundColor: color }}
              onClick={() => updateSettings({ primaryColor: color })}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
