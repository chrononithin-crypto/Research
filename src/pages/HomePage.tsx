import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  FilePlus,
  Search,
  BellRing,
  ArrowRight,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { ComplaintStatus } from '@/lib/types';

export function HomePage() {
  const [stats, setStats] = useState<{ total: number; active: number; closed: number } | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadStats() {
    setLoading(true);
    try {
      const { count: total } = await supabase.from('complaints').select('*', { count: 'exact', head: true });
      const { count: closed } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'Closed');
      setStats({
        total: total ?? 0,
        active: (total ?? 0) - (closed ?? 0),
        closed: closed ?? 0,
      });
    } catch {
      setStats({ total: 0, active: 0, closed: 0 });
    }
    setLoading(false);
  }

  // Load stats on mount
  if (!stats && !loading) loadStats();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 px-6 py-12 sm:px-10 sm:py-16 shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24" />
        </div>
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm mb-5">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Complaint Tracking & Follow-Up System</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            Track Every Complaint,<br />Ensure Every Voice is Heard
          </h1>
          <p className="text-blue-100 text-base sm:text-lg mb-8 max-w-xl leading-relaxed">
            A transparent complaint management portal that ensures serious complaints
            are never forgotten. Submit, track, and follow up — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-blue-700 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
            >
              <FilePlus className="w-5 h-5" />
              Submit Complaint
            </Link>
            <Link
              to="/track"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-500/30 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/30 hover:bg-blue-500/40 transition-all duration-200"
            >
              <Search className="w-5 h-5" />
              Track Complaint
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Complaints', value: stats.total, icon: TrendingUp, color: 'from-blue-500 to-blue-600' },
            { label: 'Active Cases', value: stats.active, icon: Clock, color: 'from-amber-500 to-orange-500' },
            { label: 'Closed Cases', value: stats.closed, icon: CheckCircle2, color: 'from-teal-500 to-green-500' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Feature cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Submit a Complaint', desc: 'File a new complaint with details and supporting documents.', icon: FilePlus, link: '/submit', color: 'bg-blue-50 text-blue-600' },
          { title: 'Track by Case ID', desc: 'Look up any complaint using its unique Case ID.', icon: Search, link: '/track', color: 'bg-amber-50 text-amber-600' },
          { title: 'Follow-Up Reminders', desc: 'View complaints with no updates for 7+ days.', icon: BellRing, link: '/follow-up', color: 'bg-orange-50 text-orange-600' },
          { title: 'Admin Dashboard', desc: 'Overview of all complaints with charts and statistics.', icon: Users, link: '/admin', color: 'bg-teal-50 text-teal-600' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.link}
              className="group bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
            >
              <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{card.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Open <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </section>

      {/* How it works */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-6">How SafeTrack Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Submit', desc: 'File your complaint with a description and optional documents.' },
            { step: '2', title: 'Receive Case ID', desc: 'Get a unique Case ID to track your complaint.' },
            { step: '3', title: 'Track Progress', desc: 'Monitor status from Received to Closed.' },
            { step: '4', title: 'Follow-Up', desc: 'Automatic reminders ensure no complaint is forgotten.' },
          ].map((item) => (
            <div key={item.step} className="relative">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mb-3 shadow-md">
                {item.step}
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              {item.step !== '4' && (
                <div className="hidden sm:block absolute top-5 -right-3 text-slate-300">
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
