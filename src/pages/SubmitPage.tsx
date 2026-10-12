import { useState, useRef } from 'react';
import {
  FilePlus,
  Upload,
  CheckCircle2,
  Copy,
  ArrowRight,
  Loader2,
  FileText,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { generateCaseId } from '@/lib/types';

export function SubmitPage() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a complaint description.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const caseId = generateCaseId();
      let attachmentUrl: string | null = null;
      let attachmentName: string | null = null;

      if (file) {
        const ext = file.name.split('.').pop();
        const filePath = `${caseId}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('complaint-attachments')
          .upload(filePath, file);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('complaint-attachments')
            .getPublicUrl(filePath);
          attachmentUrl = urlData.publicUrl;
          attachmentName = file.name;
        }
      }

      const { error: insertError } = await supabase.from('complaints').insert({
        case_id: caseId,
        name: name.trim() || null,
        contact: contact.trim() || null,
        description: description.trim(),
        status: 'Received',
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
      });

      if (insertError) throw insertError;

      setSuccess(caseId);
      setName('');
      setContact('');
      setDescription('');
      setFile(null);
    } catch (err) {
      setError('Something went wrong while submitting your complaint. Please try again.');
    }

    setSubmitting(false);
  }

  function copyCaseId() {
    if (success) {
      navigator.clipboard.writeText(success);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setError('File size must be under 5 MB.');
        return;
      }
      setFile(selected);
      setError(null);
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-9 h-9 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Complaint Submitted Successfully</h2>
          <p className="text-slate-500 mb-6">
            Your complaint has been registered. Save your Case ID to track the status at any time.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <p className="text-sm text-blue-600 font-medium mb-2">Your Case ID</p>
            <div className="flex items-center justify-center gap-3">
              <code className="text-2xl font-bold text-blue-700 tracking-wider">{success}</code>
              <button
                onClick={copyCaseId}
                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                aria-label="Copy Case ID"
              >
                {copied ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-blue-600" />}
              </button>
            </div>
            {copied && <p className="text-xs text-green-600 mt-2">Copied to clipboard!</p>}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={`/track?caseId=${success}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Track This Complaint <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setSuccess(null)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
            >
              <FilePlus className="w-4 h-4" />
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <FilePlus className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Submit a Complaint</h1>
        </div>
        <p className="text-slate-500 ml-13">
          Fill out the form below. Fields marked with <span className="text-red-500">*</span> are required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Name <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-800"
          />
        </div>

        {/* Contact */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Contact Details <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Email or phone number"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-800"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Complaint Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your complaint in detail..."
            rows={5}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-800 resize-y"
          />
        </div>

        {/* File upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Supporting Documents <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          {file ? (
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 shrink-0" />
              <span className="text-sm text-slate-700 flex-1 truncate">{file.name}</span>
              <span className="text-xs text-slate-400 shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
              <button
                type="button"
                onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="p-1 rounded hover:bg-blue-100 transition-colors"
                aria-label="Remove file"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 transition-all"
            >
              <Upload className="w-8 h-8 text-slate-400" />
              <span className="text-sm text-slate-500">Click to upload a file</span>
              <span className="text-xs text-slate-400">Images, PDF, or documents up to 5 MB</span>
            </button>
          )}
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <FilePlus className="w-5 h-5" />
                Submit Complaint
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
