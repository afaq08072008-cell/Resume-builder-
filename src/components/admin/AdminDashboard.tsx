import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { 
  Users, 
  CreditCard, 
  Activity, 
  ShieldCheck, 
  Search, 
  ArrowUpRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface Stats {
  totalUsers: number;
  totalResumes: number;
  pendingJobs: number;
  planStats: {
    free: number;
    pro: number;
    premium: number;
  };
  systemHealth: string;
  uptime: number;
}

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      try {
        const token = await (user as any).getIdToken();
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [statsRes, usersRes] = await Promise.all([
          fetch('/api/admin/stats', { headers }),
          fetch('/api/admin/users', { headers })
        ]);
        const statsData = await statsRes.json();
        const usersData = await usersRes.json();
        setStats(statsData);
        setUsers(usersData);
      } catch (err) {
        console.error("Admin data fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Access Denied</h1>
        <p className="text-zinc-500 max-w-md">This area is restricted to system administrators only. Unauthorized access attempts are logged.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="p-12 text-center text-zinc-500">Loading enterprise metrics...</div>;
  }

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">System Admin</span>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Operating Core</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">System Health</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-white uppercase">{stats?.systemHealth}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'text-blue-500' },
          { label: 'Active Resumes', value: stats?.totalResumes, icon: TrendingUp, color: 'text-purple-500' },
          { label: 'Pending Jobs', value: stats?.pendingJobs, icon: Activity, color: 'text-orange-500' },
          { label: 'Revenue MRR', value: `$${((stats?.planStats.pro || 0) * 19 + (stats?.planStats.premium || 0) * 39).toLocaleString()}`, icon: CreditCard, color: 'text-green-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-3xl bg-white/5 border border-white/10 glass"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-2 rounded-xl bg-white/5", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-zinc-700" />
            </div>
            <div className="text-2xl font-black text-white">{stat.value}</div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Management Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black text-white uppercase tracking-widest">User Registry</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Identity..."
                className="bg-white/5 border border-white/10 rounded-xl px-9 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 w-64 transition-all"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 overflow-hidden bg-white/5 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Plan</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={user.photoURL} alt="" className="w-8 h-8 rounded-xl bg-zinc-800" />
                        <div>
                          <div className="text-xs font-bold text-white">{user.displayName}</div>
                          <div className="text-[10px] text-zinc-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                        user.subscriptionPlan === 'premium' ? "bg-purple-500/20 text-purple-400" : 
                        user.subscriptionPlan === 'pro' ? "bg-blue-500/20 text-blue-400" : 
                        "bg-zinc-800 text-zinc-500"
                      )}>
                        {user.subscriptionPlan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-green-500" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Active</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" className="h-8 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/10">
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Plan Distribution Chart (Mock with CSS) */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Plan Saturation</h2>
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 glass space-y-6">
            <div className="flex flex-col gap-4">
              {[
                { label: 'Free', count: stats?.planStats.free, color: 'bg-zinc-700', total: stats?.totalUsers },
                { label: 'Pro', count: stats?.planStats.pro, color: 'bg-blue-500', total: stats?.totalUsers },
                { label: 'Premium', count: stats?.planStats.premium, color: 'bg-purple-500', total: stats?.totalUsers },
              ].map((p) => {
                const percentage = p.total ? (p.count! / p.total) * 100 : 0;
                return (
                  <div key={p.label} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-zinc-500">{p.label}</span>
                      <span className="text-white">{p.count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className={cn("h-full", p.color)} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 border-t border-white/10 flex flex-col items-center text-center">
              <div className="text-3xl font-black text-white mb-1">
                {Math.round(((stats?.planStats.pro || 0) + (stats?.planStats.premium || 0)) / (stats?.totalUsers || 1) * 100)}%
              </div>
              <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Conversion Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
