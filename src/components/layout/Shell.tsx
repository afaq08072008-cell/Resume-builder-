import { motion, AnimatePresence } from 'motion/react';
import FormBuilder from '../builder/FormBuilder';
import A4Canvas from '../preview/A4Canvas';
import ScoreMeter from '../builder/ScoreMeter';
import { useResume } from '@/ResumeContext';
import AdminDashboard from '../admin/AdminDashboard';
import { Download, Sparkles, Layout, User, LogOut, ChevronDown, CreditCard, Settings, ExternalLink, Shield, BarChart2, Zap, Target, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/lib/AuthContext';
import { useAI } from '@/lib/AIContext';
import { hasFeature } from '@/lib/plans';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import PricingModal from '../PricingModal';

export default function Shell() {
  const { resumeData, saveResume, createVersion, updateSettings, currentResumeId } = useResume();
  const { user, userData, isAdmin, logout } = useAuth();
  const { isAnalyzing, scoreData, analyze } = useAI();
  const [activeTab, setActiveTab] = useState<'builder' | 'admin'>('builder');
  const [sidebarTab, setSidebarTab] = useState<'content' | 'design' | 'settings'>('content');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('saved');
  const [isVersionSaving, setIsVersionSaving] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  // Deep Analysis Trigger
  const handleDeepAnalyze = async () => {
    if (!hasFeature(userData?.subscriptionPlan || 'free', 'atsAnalysis')) {
      setIsPricingOpen(true);
      return;
    }
    await analyze(jobDescription);
  };

  // Auto-save logic
  useEffect(() => {
    if (!user) return;
    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      await saveResume();
      setSaveStatus('saved');
    }, 2000);
    return () => clearTimeout(timer);
  }, [resumeData, user]);

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('session_id')) {
      setShowSuccess(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleExportPDF = () => {
    window.print();
  };

  const handleManageSubscription = async () => {
    if (!userData?.stripeCustomerId || !user) return;
    
    setIsPortalLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ customerId: userData.stripeCustomerId }),
      });
      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error('Portal error:', err);
    } finally {
      setIsPortalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e7eb] flex flex-col font-sans overflow-hidden">
      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-blue-600 rounded-2xl shadow-2xl shadow-blue-600/40 flex items-center gap-3 border border-blue-400/30 backdrop-blur-xl"
          >
            <Sparkles className="w-5 h-5 text-white" />
            <div className="flex flex-col">
              <span className="text-white text-sm font-black uppercase tracking-widest">Upgrade Successful</span>
              <span className="text-white/70 text-[10px] font-medium">Your premium features are now unlocked.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-black/40 backdrop-blur-md z-50 fixed top-0 left-0 right-0 print:hidden">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-600/20">
              A
            </div>
            <span className="font-bold tracking-tight text-lg text-white">
              APEX <span className="text-blue-500">PRO</span>
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full text-[10px] font-black tracking-widest text-white/50">
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              saveStatus === 'saved' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-orange-500 animate-pulse"
            )}></span> 
            {saveStatus === 'saved' ? "SYNCED" : "SAVING..."}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white gap-2" onClick={() => setIsPricingOpen(true)}>
            <CreditCard className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Pricing</span>
          </Button>

          <div className="w-px h-4 bg-white/10" />

          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md transition-all flex items-center gap-2 border-0 shadow-lg shadow-blue-600/20"
            onClick={handleExportPDF}
          >
            <span className="text-xs font-bold uppercase tracking-widest">Export</span>
            <Download className="w-3.5 h-3.5" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition-colors group">
                <div className="relative">
                  <img src={user?.photoURL || ''} className="w-7 h-7 rounded-full bg-zinc-800 border border-white/10 shadow-lg" referrerPolicy="no-referrer" />
                  <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#050505]",
                    userData?.subscriptionPlan === 'premium' ? "bg-purple-500" : userData?.subscriptionPlan === 'pro' ? "bg-blue-500" : "bg-zinc-500"
                  )} />
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 bg-zinc-950 border-white/10 border p-2 shadow-2xl" align="end">
              <div className="flex flex-col gap-1">
                <div className="px-2 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-white truncate">{user?.displayName}</p>
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                      userData?.subscriptionPlan === 'premium' ? "bg-purple-500/20 text-purple-400" : 
                      userData?.subscriptionPlan === 'pro' ? "bg-blue-500/20 text-blue-400" : 
                      "bg-zinc-800 text-zinc-500"
                    )}>
                      {userData?.subscriptionPlan || 'free'}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
                </div>
                <div className="h-px bg-white/5 my-1" />
                
                <button 
                  onClick={async () => {
                    setIsVersionSaving(true);
                    await createVersion();
                    setIsVersionSaving(false);
                  }}
                  disabled={isVersionSaving}
                  className="flex items-center w-full gap-2 px-2 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5 rounded transition-colors text-left disabled:opacity-50"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  {isVersionSaving ? "Saving..." : "Create Snapshot"}
                </button>

                {userData?.stripeCustomerId && (
                  <button 
                    onClick={handleManageSubscription}
                    disabled={isPortalLoading}
                    className="flex items-center w-full gap-2 px-2 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5 rounded transition-colors text-left disabled:opacity-50"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    {isPortalLoading ? "Loading..." : "Manage Billing"}
                    <ExternalLink className="w-3 h-3 ml-auto opacity-30" />
                  </button>
                )}

                {isAdmin && (
                  <button 
                    onClick={() => setActiveTab(activeTab === 'builder' ? 'admin' : 'builder')}
                    className="flex items-center w-full gap-2 px-2 py-2 text-xs font-medium text-blue-400 hover:bg-blue-500/10 rounded transition-colors text-left"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    {activeTab === 'builder' ? "Admin Console" : "Back to Builder"}
                  </button>
                )}

                <button 
                  onClick={logout}
                  className="flex items-center w-full gap-2 px-2 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden pt-14 print:pt-0 print:overflow-visible">
        {activeTab === 'admin' ? (
          <div className="flex-1 overflow-y-auto bg-[#080808]">
            <AdminDashboard />
          </div>
        ) : (
          <>
            {/* Left: Form Builder (Sidebar) */}
            <aside className="w-80 border-r border-white/10 flex flex-col glass print:hidden">
          <nav className="flex border-b border-white/10">
            <button 
              onClick={() => setSidebarTab('content')}
              className={cn(
                "flex-1 py-3 text-[10px] font-black tracking-widest uppercase transition-all",
                sidebarTab === 'content' ? "border-b-2 border-blue-500 text-white" : "opacity-40 hover:opacity-60"
              )}
            >
              CONTENT
            </button>
            <button 
              onClick={() => setSidebarTab('design')}
              className={cn(
                "flex-1 py-3 text-[10px] font-black tracking-widest uppercase transition-all",
                sidebarTab === 'design' ? "border-b-2 border-blue-500 text-white" : "opacity-40 hover:opacity-60"
              )}
            >
              DESIGN
            </button>
            <button 
              onClick={() => setSidebarTab('settings')}
              className={cn(
                "flex-1 py-3 text-[10px] font-black tracking-widest uppercase transition-all",
                sidebarTab === 'settings' ? "border-b-2 border-blue-500 text-white" : "opacity-40 hover:opacity-60"
              )}
            >
              SETTINGS
            </button>
          </nav>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              {sidebarTab === 'content' && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <FormBuilder />
                </motion.div>
              )}
              {sidebarTab === 'design' && (
                <motion.div
                  key="design"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="p-6 space-y-6"
                >
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Resume Design</h3>
                    {/* Add design controls here if missing, for now just a note */}
                    <p className="text-xs text-zinc-500">Select template and colors in the top bar or use context menu.</p>
                  </div>
                </motion.div>
              )}
              {sidebarTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="p-6 space-y-6"
                >
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Visibility & Sharing</h3>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-white">Public Access</p>
                        <p className="text-[9px] text-zinc-500">Allow others to view via QR/Link</p>
                      </div>
                      <button 
                        onClick={() => updateSettings({ isPublic: !resumeData.settings.isPublic })}
                        className={cn(
                          "w-10 h-5 rounded-full transition-colors relative",
                          resumeData.settings.isPublic ? "bg-blue-600" : "bg-zinc-800"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                          resumeData.settings.isPublic ? "left-6" : "left-1"
                        )} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* Middle: Canvas Area */}
        <section className="flex-1 bg-[#111] flex items-center justify-center relative p-8 print:p-0 print:bg-white overflow-y-auto no-scrollbar">
          <div className="print:m-0 print:p-0 min-h-max">
            <A4Canvas />
          </div>
        </section>

        {/* Right: Score/ATS Sidebar */}
        <aside className="w-72 glass border-l border-white/10 flex flex-col items-center print:hidden">
           <div className="w-full flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
              <ScoreMeter />
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50">ATS Targeting</span>
                </div>
                
                <div className="relative group">
                  <textarea 
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste target job description here..."
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] text-zinc-300 resize-none focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-700"
                  />
                  {!hasFeature(userData?.subscriptionPlan || 'free', 'atsAnalysis') && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-4 text-center rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setIsPricingOpen(true)}>
                       <span className="text-[9px] font-bold text-white uppercase tracking-wider">Upgrade for Deep AI Analysis</span>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleDeepAnalyze}
                  disabled={!jobDescription || isAnalyzing}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-10 rounded-xl"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Run Deep Analysis</span>
                    </div>
                  )}
                </Button>

                {scoreData && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-blue-400 uppercase">AI Match Score</span>
                      <span className="text-xl font-black text-white">{scoreData.score}%</span>
                    </div>
                    <p className="text-[9px] text-zinc-400 leading-relaxed italic">{scoreData.aiAnalysis.analysis.slice(0, 100)}...</p>
                  </motion.div>
                )}
              </div>
           </div>
           
           <div className="p-4 border-t border-white/10 bg-black/20 w-full shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-md">
                    <QRCodeSVG 
                      value={`${window.location.origin}/share/${currentResumeId}`} 
                      size={40} 
                    />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase opacity-60">Share Link</div>
                    <div className="text-xs text-blue-400 font-mono truncate max-w-[120px]">/share/{currentResumeId?.slice(0, 8)}...</div>
                  </div>
                </div>
          </div>
        </aside>
        </>
      )}
      </main>

      {/* Pricing Modal */}
      <PricingModal open={isPricingOpen} onOpenChange={setIsPricingOpen} />

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          @page { size: auto; margin: 0; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}} />
    </div>
  );
}
