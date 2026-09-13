const styles = { Open: 'bg-blue-100 text-blue-800', 'In Progress': 'bg-amber-100 text-amber-800', Closed: 'bg-emerald-100 text-emerald-800' };
export default function StatusBadge({ status }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] || 'bg-slate-100 text-slate-700'}`}>{status}</span>; }
