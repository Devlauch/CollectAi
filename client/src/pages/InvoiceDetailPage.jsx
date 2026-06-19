import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get('/invoices/' + id)
      .then(res => {
        const inv = res.data.invoice;
        setInvoice(inv);
        setForm({
          clientName: inv.clientName,
          clientEmail: inv.clientEmail,
          amount: inv.amount,
          dueDate: inv.dueDate.split('T')[0],
          description: inv.description || '',
          paymentLink: inv.paymentLink || '',
          status: inv.status,
        });
      })
      .catch(() => navigate('/invoices'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/invoices/' + id, { ...form, amount: Number(form.amount) });
      setInvoice(res.data.invoice);
      setEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this invoice? This cannot be undone.')) return;
    await api.delete('/invoices/' + id);
    navigate('/invoices');
  };

  const handleGenerateReminder = async () => {
    setAiLoading(true);
    setAiMessage('');
    try {
      const res = await api.post('/reminders/' + id + '/remind');
      setAiMessage(res.data.message);
      setInvoice(prev => ({ ...prev, remainderCount: (prev.remainderCount || 0) + 1 }));
    } catch (err) {
      setAiMessage('Error: ' + (err.response?.data?.message || 'Failed to generate reminder'));
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(aiMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!invoice) return null;

  const inputCls = 'w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent';
  const labelCls = 'block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide';

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
        <div className="max-w-3xl">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
            <div>
              <Link to="/invoices" className="text-sm text-slate-500 hover:text-slate-300 flex items-center gap-1 mb-3 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Invoices
              </Link>
              <h1 className="text-2xl font-black text-white">{invoice.clientName}</h1>
              <p className="text-slate-500 text-sm mt-0.5">{invoice.clientEmail}</p>
            </div>
            {!editing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="border border-white/10 text-slate-300 hover:bg-white/5 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="border border-red-500/30 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* MAIN CARD */}
          <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 mb-5">
            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Client Name</label>
                    <input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Client Email</label>
                    <input value={form.clientEmail} onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Payment Link</label>
                  <input
                    type="url"
                    value={form.paymentLink}
                    onChange={e => setForm(f => ({ ...f, paymentLink: e.target.value }))}
                    className={inputCls}
                    placeholder="https://pay.example.com/invoice/123"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Amount (INR)</label>
                    <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Due Date</label>
                    <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={inputCls + ' bg-slate-800'}>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={2}
                    className={inputCls + ' resize-none'}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="border border-white/10 text-slate-400 hover:bg-white/5 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Amount Due</p>
                    <p className="text-3xl font-black text-white">&#8377;{invoice.amount.toLocaleString('en-IN')}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Due {new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <StatusBadge status={invoice.status} large />
                </div>

                {invoice.description && (
                  <div className="pt-5 border-t border-white/5">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Description</p>
                    <p className="text-slate-300 text-sm">{invoice.description}</p>
                  </div>
                )}

                <div className="pt-5 border-t border-white/5 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Reminders Sent</p>
                    <p className="text-white font-bold mt-1">{invoice.remainderCount}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Created</p>
                    <p className="text-white font-bold mt-1">{new Date(invoice.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Invoice ID</p>
                    <p className="text-slate-500 font-mono text-xs mt-1 truncate">{invoice._id}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PAYMENT LINK CARD */}
          {!editing && (
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 mb-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Payment Link</p>
                  <h2 className="font-bold text-white">Where should the client pay?</h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Share this link with the client so they can pay the invoice directly.
                  </p>
                </div>
                {invoice.status === 'paid' ? (
                  <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                    Paid
                  </span>
                ) : (
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                    Awaiting payment
                  </span>
                )}
              </div>

              <div className="rounded-xl border border-white/5 bg-slate-800/50 p-4 mb-3">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Amount to pay</p>
                <p className="text-xl font-black text-white">&#8377;{invoice.amount.toLocaleString('en-IN')}</p>
              </div>

              {invoice.paymentLink ? (
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                  <p className="text-xs font-medium text-indigo-400 uppercase tracking-wide mb-2">Payment URL</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <a
                      href={invoice.paymentLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-indigo-300 hover:text-indigo-200 break-all flex-1 min-w-0 transition-colors"
                    >
                      {invoice.paymentLink}
                    </a>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => { navigator.clipboard.writeText(invoice.paymentLink); }}
                        className="text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/20 bg-white/5 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Copy
                      </button>
                      <a
                        href={invoice.paymentLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-400 hover:text-white border border-indigo-500/30 hover:border-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                      >
                        Open
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 p-4 text-center">
                  <p className="text-sm text-slate-500 mb-2">No payment link set yet.</p>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 hover:border-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-all"
                  >
                    Add payment link
                  </button>
                </div>
              )}
            </div>
          )}

          {/* AI REMINDER */}
          {invoice.status !== 'paid' && (
            <div className="bg-gradient-to-br from-indigo-950/60 via-violet-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-bold text-white">AI Reminder Generator</h2>
                  <p className="text-sm text-slate-400 mt-0.5">Generate a professional payment reminder with AI</p>
                </div>
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold px-2.5 py-1 rounded-full">
                  LLaMA 3.3
                </span>
              </div>

              <button
                onClick={handleGenerateReminder}
                disabled={aiLoading}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
              >
                {aiLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.001z" />
                    </svg>
                    Generate AI Reminder
                  </>
                )}
              </button>

              {aiMessage && (
                <div className="mt-4 bg-slate-900/80 border border-white/10 rounded-xl p-4">
                  <p className="text-slate-300 text-sm leading-relaxed">{aiMessage}</p>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium border border-indigo-500/30 hover:bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {copied ? (
                        <>
                          <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-green-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy message
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleGenerateReminder}
                      className="text-xs text-slate-500 hover:text-slate-300 font-medium border border-white/10 hover:bg-white/5 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
