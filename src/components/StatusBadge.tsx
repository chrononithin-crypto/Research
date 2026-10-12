import type { ComplaintStatus } from '@/lib/types';
import { statusColor } from '@/lib/types';

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  const color = statusColor(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${color.includes('blue') ? 'bg-blue-500' : color.includes('amber') ? 'bg-amber-500' : color.includes('orange') ? 'bg-orange-500' : color.includes('teal') ? 'bg-teal-500' : 'bg-green-500'}`} />
      {status}
    </span>
  );
}
