import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { ticketApi } from '../services/api.js';

const formatDate = (value) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
function renderInlineMarkdown(text) {
  return text.split(/(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|`[^`]+`)/g).map((part, index) => {
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      return <strong key={index} className="font-semibold text-slate-800">{part.slice(2, -2)}</strong>;
    }
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) return <em key={index}>{part.slice(1, -1)}</em>;
    if (part.startsWith('`') && part.endsWith('`')) return part.slice(1, -1);
    return part.replace(/[\*_`]/g, '');
  });
}

function SummaryMarkdown({ value }) {
  return <div className="space-y-1">{value.split(/\r?\n/).map((line, index) => {
    const heading = line.match(/^\s{0,3}#{1,6}\s+(.*)$/);
    const bullet = line.match(/^\s*(?:[-+•]\s+(.*)|\*\s+(.*)|(\d+[.)])\s+(.*))$/);
    const content = heading ? heading[1] : bullet ? (bullet[1] ?? bullet[2] ?? bullet[4] ?? '') : line;
    const visibleContent = content.replace(/[\s\*_`#>-]/g, '');
    if (!visibleContent) return null;
    if (heading) return <p key={index} className="font-semibold text-slate-800">{renderInlineMarkdown(content)}</p>;
    if (bullet) return <div key={index} className="flex gap-2"><span aria-hidden="true">•</span><span>{renderInlineMarkdown(content)}</span></div>;
    return <p key={index}>{renderInlineMarkdown(content)}</p>;
  })}</div>;
}
export default function TicketDetails() {
  const { ticketId } = useParams(); const [ticket, setTicket] = useState(null); const [status, setStatus] = useState(''); const [note, setNote] = useState(''); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [summaryLoading, setSummaryLoading] = useState(false); const [summary, setSummary] = useState(''); const [error, setError] = useState(''); const [message, setMessage] = useState('');
  const load = async () => { setLoading(true); setError(''); try { const data = await ticketApi.get(ticketId); setTicket(data); setStatus(data.status); } catch (err) { setError(err.message); } finally { setLoading(false); } };
  useEffect(() => { load(); }, [ticketId]);
  const save = async (e) => { e.preventDefault(); setError(''); setMessage(''); if (status === ticket.status && !note.trim()) { setError('Change the status or add a note before saving.'); return; } setSaving(true); try { await ticketApi.update(ticketId, { status, notes: note }); setNote(''); setMessage('Changes saved successfully.'); await load(); } catch (err) { setError(err.message); } finally { setSaving(false); } };
  const generateSummary = async () => { setSummaryLoading(true); setError(''); try { const data = await ticketApi.summary(ticketId); setSummary(data.summary); } catch (err) { setError(err.message); } finally { setSummaryLoading(false); } };
  if (loading) return <div className="card p-12 text-center text-sm text-slate-500">Loading ticket…</div>;
  if (!ticket) return <section><Link to="/" className="text-sm font-medium text-cyan-800 hover:underline">← Back to tickets</Link><div className="mt-5"><Alert type="error">{error || 'Ticket not found.'}</Alert></div></section>;
  return <section className="mx-auto max-w-5xl"><Link to="/" className="text-sm font-medium text-cyan-800 hover:underline">← Back to tickets</Link><div className="mt-4 flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-semibold text-cyan-800">{ticket.ticket_id}</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">{ticket.subject}</h1><p className="mt-2 text-slate-600">Opened {formatDate(ticket.created_at)}</p></div><StatusBadge status={ticket.status} /></div>{message && <div className="mt-5"><Alert>{message}</Alert></div>}{error && <div className="mt-5"><Alert type="error">{error}</Alert></div>}<div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]"><div className="space-y-6"><article className="card p-5 sm:p-6"><h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Customer</h2><p className="mt-3 font-semibold text-slate-800">{ticket.customer_name}</p><a href={`mailto:${ticket.customer_email}`} className="text-sm text-cyan-800 hover:underline">{ticket.customer_email}</a><h2 className="mt-7 text-sm font-bold uppercase tracking-wider text-slate-500">Issue description</h2><p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">{ticket.description}</p></article><article className="card p-5 sm:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="font-bold text-ink">AI ticket summary</h2><p className="mt-1 text-sm text-slate-500">Generate a concise handoff for a support agent.</p></div><button className="button-secondary" onClick={generateSummary} disabled={summaryLoading}>{summaryLoading ? 'Generating…' : 'Generate AI Summary'}</button></div>{summary && <div className="mt-4 rounded-lg border border-cyan-100 bg-cyan-50 p-4 text-sm leading-6 text-slate-700"><SummaryMarkdown value={summary} /></div>}</article><article className="card p-5 sm:p-6"><h2 className="font-bold text-ink">Notes & comments</h2>{ticket.notes.length === 0 ? <p className="mt-4 text-sm text-slate-500">No notes have been added yet.</p> : <div className="mt-4 space-y-4">{ticket.notes.map(item => <div key={item.id} className="border-l-2 border-cyan-600 pl-4"><p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.note_text}</p><p className="mt-1 text-xs text-slate-500">{formatDate(item.created_at)}</p></div>)}</div>}</article></div><aside><form onSubmit={save} className="card space-y-5 p-5"><div><h2 className="font-bold text-ink">Update ticket</h2><p className="mt-1 text-sm text-slate-500">Changes are saved to the customer record.</p></div><label className="label">Status<select className="input" value={status} onChange={e => setStatus(e.target.value)}><option>Open</option><option>In Progress</option><option>Closed</option></select></label><label className="label">Add note / comment<textarea className="input min-h-32 resize-y" value={note} onChange={e => setNote(e.target.value)} placeholder="Add context, a customer update, or a next step…" /></label><button className="button-primary w-full" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button><dl className="border-t border-slate-100 pt-4 text-sm"><div className="flex justify-between gap-3 py-1"><dt className="text-slate-500">Created</dt><dd className="text-right text-slate-700">{formatDate(ticket.created_at)}</dd></div><div className="flex justify-between gap-3 py-1"><dt className="text-slate-500">Updated</dt><dd className="text-right text-slate-700">{formatDate(ticket.updated_at)}</dd></div></dl></form></aside></div></section>;
}
