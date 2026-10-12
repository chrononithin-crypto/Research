export type ComplaintStatus =
  | 'Received'
  | 'Under Review'
  | 'Follow-Up Required'
  | 'Action Taken'
  | 'Closed';

export interface Complaint {
  id: string;
  case_id: string;
  name: string | null;
  contact: string | null;
  description: string;
  status: ComplaintStatus;
  attachment_url: string | null;
  attachment_name: string | null;
  last_updated_at: string;
  created_at: string;
}

export const STATUS_OPTIONS: ComplaintStatus[] = [
  'Received',
  'Under Review',
  'Follow-Up Required',
  'Action Taken',
  'Closed',
];

export const STATUS_FLOW: ComplaintStatus[] = [
  'Received',
  'Under Review',
  'Follow-Up Required',
  'Action Taken',
  'Closed',
];

export function statusColor(status: ComplaintStatus): string {
  switch (status) {
    case 'Received':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Under Review':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Follow-Up Required':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Action Taken':
      return 'bg-teal-100 text-teal-700 border-teal-200';
    case 'Closed':
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export function statusDotColor(status: ComplaintStatus): string {
  switch (status) {
    case 'Received':
      return 'bg-blue-500';
    case 'Under Review':
      return 'bg-amber-500';
    case 'Follow-Up Required':
      return 'bg-orange-500';
    case 'Action Taken':
      return 'bg-teal-500';
    case 'Closed':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
}

export function generateCaseId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ST-${year}-${random}`;
}

export function daysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}
