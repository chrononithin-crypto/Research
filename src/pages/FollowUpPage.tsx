import { useState, useEffect } from 'react';
import {
  BellRing,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Complaint, ComplaintStatus } from '@/lib/types';
import { daysSince, STATUS_OPTIONS, statusDotColor } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';

export function FollowUpPage() {
  const [staleComplaints, setStaleComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  async function loadStale() {
    setLoading(true);
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .neq('status', 'Closed')
        .lt('last_updated_at', sevenDaysAgo)
        .order('last_updated_at', { ascending: true });

      if (error) throw error;
      setStaleComplaints((data ?? []) as Complaint[]);
    } catch {
      setStaleComplaints([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadStale();
  }, []);

  // Show auto-notification banner
  useEffect(() => {
    if (!loading && staleComplaints.length > 0) {
      const timer = setTimeout(() => setShowNotification(true), 500);
      return () => clearTimeout(timer);
    }
  }, [loading, staleComplaints.length]);

  async function updateStatus(complaint: Complaint, newStatus: ComplaintStatus) {
    setUpdatingId(complaint.id);
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ status: newStatus, last_updated_at: new Date().toISOString() })
        .eq('id', complaint.id);

      if (error) throw error;
      await loadStale();
    } catch {
      // silently fail — user can retry
    }
    setUpdatingId(null);
  }

  const sortedByDays = [...staleComplaints].sort(
    (a, b) => daysSince(b.last_updated_at) - daysSince(a.last_updated_at)
  );

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <BellRing className="w-5 h-5 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Follow-Up Reminders</h1>
        </div>
        <p className="text-slate-500 ml-13">
          Complaints with no status updates for 7 or more days. These need attention.
        </p>
      </div>

      {/* Auto notification banner */}
      {showNotification && staleComplaints.length > 0 && (
        <div className="mb-5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-4 shadow-lg shadow-orange-500/20 animate-slideDown">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 text-white animate-bellRing" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">
                {staleComplaints.length} complaint{staleComplaints.length === 1 ? '' : 's'} need follow-up
              </p>
              <p className="text-orange-50 text-xs">
                These complaints have had no updates for 7+ days and may be falling through the cracks.
              </p>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="text-white/70 hover:text-white text-xl shrink-0 px-2"
              aria-label="Dismiss notification"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Refresh button */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          {loading ? 'Loading...' : `${staleComplaints.length} complaint${staleComplaints.length === 1 ? '' : 's'} needing follow-up`}
        </p>
        <button
          onClick={loadStale}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : staleComplaints.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-green-600" />
          </div>
          <h3 className="font-semibold text-slate-700 mb-1">All Caught Up!</h3>
          <p className="text-sm text-slate-500">
            No complaints are overdue for follow-up. Every active complaint has been updated within the last 7 days.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedByDays.map((complaint) => {
            const days = daysSince(complaint.last_updated_at);
            const urgency = days >= 14 ? 'high' : days >= 10 ? 'medium' : 'low';
            return (
              <div
                key={complaint.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <code className="text-sm font-bold text-slate-800 font-mono">{complaint.case_id}</code>
                      <StatusBadge status={complaint.status} />
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{complaint.description}</p>
                  </div>
                  <div className={`shrink-0 flex flex-col items-end ${urgency === 'high' ? 'text-red-600' : urgency === 'medium' ? 'text-orange-600' : 'text-amber-600'}`}>
                    <span className="text-2xl font-bold leading-none">{days}</span>
                    <span className="text-xs">days</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500">
                    Last updated {new Date(complaint.last_updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {urgency === 'high' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      Urgent
                    </span>
                  )}
                </div>

                {/* Update status */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-400 mr-1">Update status:</span>
                  {STATUS_OPTIONS.filter((s) => s !== complaint.status).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(complaint, status)}
                      disabled={updatingId === complaint.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {updatingId === complaint.id && <Loader2 className="w-3 h-3 animate-spin" />}
                      {status}
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
