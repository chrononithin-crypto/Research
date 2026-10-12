import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Loader2,
  FileText,
  Calendar,
  User,
  Phone,
  AlertCircle,
  ArrowRight,
  Download,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Complaint } from '@/lib/types';
import { STATUS_FLOW, statusDotColor, daysSince } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';

export function TrackPage() {
  const [searchParams] = useSearchParams();
  const [caseId, setCaseId] = useState(searchParams.get('caseId') ?? '');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = caseId.trim().toUpperCase();
    if (!trimmed) {
      setError('Please enter a Case ID.');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const { data, error: queryError } = await supabase
        .from('complaints')
        .select('*')
        .eq('case_id', trimmed)
        .maybeSingle();

      if (queryError) throw queryError;
      setComplaint(data as Complaint | null);
    } catch {
      setError('Failed to look up complaint. Please try again.');
      setComplaint(null);
    }

    setLoading(false);
  }

  // Auto-search if caseId in URL
  useEffect(() => {
    const urlCaseId = searchParams.get('caseId');
    if (urlCaseId) {
      setCaseId(urlCaseId);
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentStep = complaint ? STATUS_FLOW.indexOf(complaint.status) : -1;

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Search className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Track a Complaint</h1>
        </div>
        <p className="text-slate-500 ml-13">
          Enter your Case ID to view the current status and details of your complaint.
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            placeholder="e.g. ST-2026-0001"
            className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-800 font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            {loading ? 'Searching...' : 'Track'}
          </button>
        </div>
        {error && (
          <div className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </form>

      {/* Results */}
      {searched && !loading && !complaint && !error && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-700 mb-1">No Complaint Found</h3>
          <p className="text-sm text-slate-500 mb-5">
            We couldn't find a complaint with that Case ID. Please check and try again.
          </p>
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit a New Complaint <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {complaint && (
        <div className="space-y-4 animate-fadeIn">
          {/* Status timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Case ID</p>
                <p className="text-lg font-bold text-slate-800 font-mono">{complaint.case_id}</p>
              </div>
              <StatusBadge status={complaint.status} />
            </div>

            {/* Progress bar */}
            <div className="relative">
              <div className="flex justify-between mb-2">
                {STATUS_FLOW.map((step, i) => (
                  <div key={step} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        i <= currentStep
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute top-3.5 left-0 right-0 h-0.5 bg-slate-200 -z-0">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${(currentStep / (STATUS_FLOW.length - 1)) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between mt-2">
              {STATUS_FLOW.map((step, i) => (
                <span
                  key={step}
                  className={`text-[10px] sm:text-xs text-center flex-1 leading-tight ${
                    i <= currentStep ? 'text-blue-600 font-medium' : 'text-slate-400'
                  }`}
                >
                  {step}
                </span>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 pb-2 border-b border-slate-100">Complaint Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {complaint.name && (
                <DetailRow icon={User} label="Submitted By" value={complaint.name} />
              )}
              {complaint.contact && (
                <DetailRow icon={Phone} label="Contact" value={complaint.contact} />
              )}
              <DetailRow
                icon={Calendar}
                label="Filed On"
                value={new Date(complaint.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              />
              <DetailRow
                icon={Calendar}
                label="Last Updated"
                value={`${daysSince(complaint.last_updated_at)} day${daysSince(complaint.last_updated_at) === 1 ? '' : 's'} ago`}
              />
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-1">Description</p>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-4">
                {complaint.description}
              </p>
            </div>

            {complaint.attachment_url && (
              <a
                href={complaint.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-700 truncate">
                    {complaint.attachment_name ?? 'Attachment'}
                  </p>
                  <p className="text-xs text-blue-500">Click to view</p>
                </div>
                <Download className="w-4 h-4 text-blue-500" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700 truncate">{value}</p>
      </div>
    </div>
  );
}
