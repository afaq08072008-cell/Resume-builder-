import { motion } from 'motion/react';
import { Button } from './ui/button';
import { useAuth } from '../lib/AuthContext';
import { Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

const PLANS = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for a single polished resume.",
    features: ["1 Active Resume", "Standard Templates", "Community Support"],
    color: "bg-zinc-800",
    priceId: null
  },
  {
    name: "Pro",
    price: "$19",
    description: "For serious job seekers needing the edge.",
    features: ["Unlimited Resumes", "Premium Templates", "ATS Optimization", "Priority Support"],
    color: "bg-blue-600",
    priceId: "price_standard_monthly"
  },
  {
    name: "Enterprise",
    price: "$49",
    description: "Advanced AI power for elite specialists.",
    features: ["Everything in Pro", "AI Content Enhancer", "Unlimited AI Credits", "Custom Domain Mapping"],
    color: "bg-purple-600",
    priceId: "price_premium_monthly"
  }
];

export default function PricingModal() {
  const { user, userData } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string | null, planName: string) => {
    if (!priceId || !user) return; // Free plan logic
    
    setLoadingPlan(planName);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ priceId, customerEmail: user?.email }),
      });
      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlan(null);
    }
  };

  const currentPlan = userData?.subscriptionPlan || 'free';

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-white mb-2">CHOOSE YOUR WEAPON</h2>
        <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">Select a plan to unlock premium features</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.name.toLowerCase();
          return (
            <motion.div
              key={plan.name}
              whileHover={{ y: -5 }}
              className={cn(
                "p-8 rounded-3xl border flex flex-col transition-all relative overflow-hidden",
                isCurrent ? "bg-white/10 border-blue-500 shadow-2xl shadow-blue-500/20" : "bg-white/5 border-white/10 glass"
              )}
            >
              {isCurrent && (
                <div className="absolute top-4 right-4 px-2 py-1 bg-blue-500 text-[8px] font-black uppercase tracking-widest rounded-md text-white">
                  Current
                </div>
              )}
              <div className="mb-6">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{plan.name}</span>
                <div className="text-4xl font-black text-white mt-1">{plan.price}<span className="text-sm font-medium text-zinc-500">/mo</span></div>
              </div>
              
              <p className="text-sm text-zinc-400 mb-8 leading-relaxed h-10">{plan.description}</p>
              
              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-3 text-xs font-medium text-zinc-300">
                    <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Check className="w-3 h-3" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>

              <Button
                className={cn(
                  "w-full h-12 rounded-2xl font-bold uppercase tracking-widest transition-all",
                  isCurrent ? "bg-zinc-800 text-zinc-500 cursor-default" : plan.color
                )}
                disabled={loadingPlan === plan.name || isCurrent}
                onClick={() => handleSubscribe(plan.priceId, plan.name)}
              >
                {loadingPlan === plan.name ? <Loader2 className="w-5 h-5 animate-spin" /> : (isCurrent ? "Current Plan" : "Upgrade Now")}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
