import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';

export default function CreateInvoicePage() {
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    amount: '',
    dueDate: '',
    description: '',
    paymentLink: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/invoices', { ...form, amount: Number(form.amount) });
      navigate('/invoices');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent';
  const labelCls = 'block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide';

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl">
          <div className="mb-8">
            <Link to="/invoices" className="text-sm text-slate-500 hover:text-slate-300 flex items-center gap-1 mb-4 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Invoices
            </Link>
            <h1 className="text-2xl font-black text-white">New Invoice</h1>
            <p className="text-slate-500 mt-1 text-sm">Create a new invoice for a client</p>
          </div>

          <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 sm:p-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Client Name *</label>
                  <input
                    name="clientName"
                    required
                    value={form.clientName}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <label className={labelCls}>Client Email *</label>
                  <input
                    type="email"
                    name="clientEmail"
                    required
                    value={form.clientEmail}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="client@example.com"
                  />
                </div>
                <div>
                  <label className={labelCls}>Client Phone *</label>
                  <input
                    type="tel"
                    name="clientPhone"
                    required
                    value={form.clientPhone}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Amount (INR) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₹</span>
                    <input
                      type="number"
                      name="amount"
                      required
                      min="1"
                      value={form.amount}
                      onChange={handleChange}
                      className={inputCls + ' pl-8'}
                      placeholder="5000"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Due Date *</label>
                  <input
                    type="date"
                    name="dueDate"
                    required
                    value={form.dueDate}
                    onChange={handleChange}
                    className={inputCls + ' [color-scheme:dark]'}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>
                  Description <span className="text-slate-600 normal-case font-normal">(optional)</span>
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                  className={inputCls + ' resize-none'}
                  placeholder="Web development services for Q1..."
                />
              </div>

              <div>
                <label className={labelCls}>
                  Payment Link <span className="text-slate-600 normal-case font-normal">(optional)</span>
                </label>
                <input
                  type="url"
                  name="paymentLink"
                  value={form.paymentLink}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="https://pay.example.com/invoice/123"
                />
                <p className="text-xs text-slate-600 mt-1.5">Shown on the invoice so the client knows where to pay.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60 shadow-lg shadow-indigo-500/20"
                >
                  {loading ? 'Creating...' : 'Create Invoice'}
                </button>
                <Link
                  to="/invoices"
                  className="border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
