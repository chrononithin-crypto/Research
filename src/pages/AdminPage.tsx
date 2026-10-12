import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Clock,
  CheckCircle2,
  BellRing,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Complaint, ComplaintStatus } from '@/lib/types';
import { STATUS_OPTIONS, daysSince, statusDotColor } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';

interface DashboardStats {
  total: number;
  active: number;
  closed: number;
  followUpPending: number;
  byStatus: Record<ComplaintStatus, number>;
  recent: Complaint[];
  stale: Complaint[];
}

export function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data: all, error } = await supabase
          .from('complaints')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const complaints = (all ?? []) as Complaint[];
        const byStatus = STATUS_OPTIONS.reduce((acc, s) => {
          acc[s] = complaints.filter((c) => c.status === s).length;
          return acc;
        }, {} as Record<ComplaintStatus, number>);

        const closed = byStatus['Closed'];
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const stale = complaints.filter(
          (c) => c.status !== 'Closed' && c.last_updated_at < sevenDaysAgo
        );

        setStats({
          total: complaints.length,
          active: complaints.length - closed,
          closed,
          followUpPending: stale.length,
          byStatus,
          recent: complaints.slice(0, 6),
          stale: stale.sort((a, b) => daysSince(b.last_updated_at) - daysSince(a.last_updated_at)).slice(0, 5),
        });
      } catch {
        setStats(null);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20 text-slate-500">
        Failed to load dashboard data. Please refresh the page.
      </div>
    );
  }

  const maxStatusCount = Math.max(...Object.values(stats.byStatus), 1);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="mb-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        </div>
        <p className="text-slate-500 ml-13">Overview of all complaints, statuses, and follow-up needs.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Complaints" value={stats.total} icon={TrendingUp} color="from-blue-500 to-blue-600" />
        <StatCard label="Active Cases" value={stats.active} icon={Clock} color="from-amber-500 to-orange-500" />
        <StatCard label="Closed Cases" value={stats.closed} icon={CheckCircle2} color="from-teal-500 to-green-500" />
        <StatCard label="Follow-Up Pending" value={stats.followUpPending} icon={BellRing} color="from-orange-500 to-red-500" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status distribution bar chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-5">Status Distribution</h3>
          <div className="space-y-4">
            {STATUS_OPTIONS.map((status) => {
              const count = stats.byStatus[status];
              const pct = (count / maxStatusCount) * 100;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${statusDotColor(status)}`} />
                      <span className="text-sm font-medium text-slate-700">{status}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800">{count}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${statusDotColor(status)} transition-all duration-700 ease-out`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Donut / proportion chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-5">Case Proportions</h3>
          <div className="flex items-center justify-center mb-4">
            <DonutChart
              segments={[
                { label: 'Active', value: stats.active, color: '#f59e0b' },
                { label: 'Closed', value: stats.closed, color: '#10b981' },
              ]}
              total={stats.total}
            />
          </div>
          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-sm text-slate-600">Active ({stats.active})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-slate-600">Closed ({stats.closed})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Follow-up alerts + Recent complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Follow-up alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Follow-Up Alerts</h3>
            <Link to="/follow-up" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {stats.stale.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
              No follow-up reminders pending.
            </div>
          ) : (
            <div className="space-y-2">
              {stats.stale.map((c) => {
                const days = daysSince(c.last_updated_at);
                return (
                  <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-orange-50 border border-orange-100">
                    <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center shrink-0">
                      <BellRing className="w-4 h-4 text-orange-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <code className="text-xs font-bold text-slate-700 font-mono">{c.case_id}</code>
                      <p className="text-xs text-slate-500 truncate">{c.description}</p>
                    </div>
                    <span className="text-xs font-bold text-orange-700 shrink-0">{days}d</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent complaints */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Recent Complaints</h3>
          <div className="space-y-2">
            {stats.recent.map((c) => (
              <Link
                key={c.id}
                to={`/track?caseId=${c.case_id}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <code className="text-xs font-bold text-slate-700 font-mono group-hover:text-blue-600 transition-colors">{c.case_id}</code>
                  <p className="text-xs text-slate-500 truncate">{c.description}</p>
                </div>
                <StatusBadge status={c.status} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof TrendingUp; color: string }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-3xl font-bold text-slate-800 mb-0.5">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

function DonutChart({ segments, total }: { segments: { label: string; value: number; color: string }[]; total: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      <circle cx="80" cy="80" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="18" />
      {segments.map((seg) => {
        if (seg.value === 0) return null;
        const dash = (seg.value / total) * circumference;
        const circle = (
          <circle
            key={seg.label}
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="18"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 80 80)"
            style={{ transition: 'stroke-dasharray 0.7s ease-out' }}
          />
        );
        offset += dash;
        return circle;
      })}
      <text x="80" y="75" textAnchor="middle" className="fill-slate-800 text-2xl font-bold">{total}</text>
      <text x="80" y="93" textAnchor="middle" className="fill-slate-400 text-xs">Total</text>
    </svg>
  );
}
