import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// ─── helpers ────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getLast6Months() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      label: d.toLocaleString('en-IN', { month: 'short' }),
    };
  });
}

function fmt(n) {
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
  if (n >= 1000)   return '₹' + (n / 1000).toFixed(1) + 'k';
  return '₹' + n;
}

// ─── sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, sub, delta, icon, iconBg }) {
  const positive = delta > 0;
  return (
    <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
      </div>
      <p className="text-2xl font-black text-white truncate">{value}</p>
      <div className="flex items-center gap-2 mt-1.5">
        {delta !== undefined && delta !== 0 && (
          <span className={`text-xs font-semibold flex items-center gap-0.5 ${positive ? 'text-green-400' : 'text-red-400'}`}>
            <svg className={`w-3 h-3 ${positive ? '' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            {Math.abs(delta)}%
          </span>
        )}
        {sub && <p className="text-xs text-slate-500">{sub}</p>}
      </div>
    </div>
  );
}

// SVG bar chart — last 6 months collected vs outstanding
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.collected + d.outstanding), 1);
  const H = 80;

  return (
    <div className="w-full">
      <div className="flex items-end gap-2 h-24">
        {data.map((d, i) => {
          const totalH  = Math.round((d.collected + d.outstanding) / max * H);
          const paidH   = Math.round(d.collected / max * H);
          const pendH   = totalH - paidH;
          const isLast  = i === data.length - 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              {/* tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 border border-white/10 rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap pointer-events-none absolute -mt-16 z-10">
                <span className="text-green-400">{fmt(d.collected)}</span> / <span className="text-amber-400">{fmt(d.outstanding)}</span>
              </div>
              <div className="w-full flex flex-col justify-end" style={{ height: H }}>
                {pendH  > 0 && <div className="w-full rounded-t-sm bg-amber-500/50" style={{ height: pendH }} />}
                {paidH  > 0 && <div className={`w-full bg-indigo-500 ${pendH === 0 ? 'rounded-t-sm' : ''}`} style={{ height: paidH }} />}
                {totalH === 0 && <div className="w-full h-1 bg-slate-800 rounded-sm" />}
              </div>
              <span className={`text-xs ${isLast ? 'text-white font-bold' : 'text-slate-600'}`}>{d.label}</span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-3">
        <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2 h-2 rounded-sm bg-indigo-500 inline-block" />Collected</span>
        <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2 h-2 rounded-sm bg-amber-500/50 inline-block" />Outstanding</span>
      </div>
    </div>
  );
}

// SVG donut ring
function DonutChart({ paid, pending, overdue }) {
  const total = paid + pending + overdue || 1;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const paidDash    = (paid    / total) * circ;
  const pendingDash = (pending / total) * circ;
  const overdueDash = (overdue / total) * circ;
  // stagger offsets so segments follow each other
  const paidOffset    = 0;
  const pendingOffset = -(paidDash);
  const overdueOffset = -(paidDash + pendingDash);

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-24 h-24 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
          {/* track */}
          <circle cx="50" cy="50" r={r} fill="none" stroke="#1e293b" strokeWidth="14" />
          {/* paid */}
          {paid > 0 && (
            <circle cx="50" cy="50" r={r} fill="none" stroke="#6366f1" strokeWidth="14"
              strokeDasharray={`${paidDash} ${circ - paidDash}`}
              strokeDashoffset={paidOffset}
              strokeLinecap="butt"
            />
          )}
          {/* pending */}
          {pending > 0 && (
            <circle cx="50" cy="50" r={r} fill="none" stroke="#f59e0b" strokeWidth="14"
              strokeDasharray={`${pendingDash} ${circ - pendingDash}`}
              strokeDashoffset={pendingOffset}
              strokeLinecap="butt"
            />
          )}
          {/* overdue */}
          {overdue > 0 && (
            <circle cx="50" cy="50" r={r} fill="none" stroke="#ef4444" strokeWidth="14"
              strokeDasharray={`${overdueDash} ${circ - overdueDash}`}
              strokeDashoffset={overdueOffset}
              strokeLinecap="butt"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-black text-lg">{total}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0" />
          <span className="text-xs text-slate-400">Paid</span>
          <span className="ml-auto text-xs font-bold text-white">{paid}</span>
          <span className="text-xs text-slate-600">{Math.round(paid/total*100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
          <span className="text-xs text-slate-400">Pending</span>
          <span className="ml-auto text-xs font-bold text-white">{pending}</span>
          <span className="text-xs text-slate-600">{Math.round(pending/total*100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
          <span className="text-xs text-slate-400">Overdue</span>
          <span className="ml-auto text-xs font-bold text-white">{overdue}</span>
          <span className="text-xs text-slate-600">{Math.round(overdue/total*100)}%</span>
        </div>
      </div>
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user }                = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/invoices')
      .then(res => setInvoices(res.data.invoices))
      .finally(() => setLoading(false));
  }, []);

  // ── derived stats ──────────────────────────────────────────────────────────
  const now          = new Date();
  const thisMonth    = now.getMonth();
  const thisYear     = now.getFullYear();
  const lastMonth    = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastYear     = thisMonth === 0 ? thisYear - 1 : thisYear;

  const ofMonth = (inv, m, y) => {
    const d = new Date(inv.createdAt);
    return d.getMonth() === m && d.getFullYear() === y;
  };

  const pending  = invoices.filter(i => i.status === 'pending');
  const paid     = invoices.filter(i => i.status === 'paid');
  const overdue  = invoices.filter(i => i.status === 'overdue');

  const outstanding   = [...pending, ...overdue].reduce((s, i) => s + i.amount, 0);
  const collected     = paid.reduce((s, i) => s + i.amount, 0);
  const collectionRate = invoices.length > 0 ? Math.round((paid.length / invoices.length) * 100) : 0;

  // month-over-month deltas (invoice count)
  const thisMonthCount = invoices.filter(i => ofMonth(i, thisMonth, thisYear)).length;
  const lastMonthCount = invoices.filter(i => ofMonth(i, lastMonth, lastYear)).length;
  const countDelta     = lastMonthCount > 0
    ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
    : 0;

  const thisMonthPaid = paid.filter(i => ofMonth(i, thisMonth, thisYear)).reduce((s, i) => s + i.amount, 0);
  const lastMonthPaid = paid.filter(i => ofMonth(i, lastMonth, lastYear)).reduce((s, i) => s + i.amount, 0);
  const paidDelta     = lastMonthPaid > 0
    ? Math.round(((thisMonthPaid - lastMonthPaid) / lastMonthPaid) * 100)
    : 0;

  // monthly bar chart data
  const months      = getLast6Months();
  const monthlyData = months.map(m => {
    const mi = invoices.filter(inv => {
      const d = new Date(inv.createdAt);
      return d.getFullYear() === m.year && d.getMonth() === m.month;
    });
    return {
      ...m,
      collected:   mi.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0),
      outstanding: mi.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0),
    };
  });

  // top clients by outstanding
  const clientMap = {};
  [...pending, ...overdue].forEach(inv => {
    const k = inv.clientEmail;
    if (!clientMap[k]) clientMap[k] = { name: inv.clientName, email: k, amount: 0, count: 0 };
    clientMap[k].amount += inv.amount;
    clientMap[k].count  += 1;
  });
  const topClients = Object.values(clientMap)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const recent = invoices.slice(0, 6);

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 p-6 lg:p-8">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-slate-500 text-sm mb-0.5">{greeting()},</p>
            <h1 className="text-2xl font-black text-white">{user?.name || 'Welcome back'}</h1>
          </div>
          <Link
            to="/invoices/new"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Invoice
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* STAT CARDS */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <StatCard
                label="Total Invoices"
                value={invoices.length}
                sub="all time"
                delta={countDelta}
                iconBg="bg-indigo-500/15"
                icon={<svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              />
              <StatCard
                label="Outstanding"
                value={'₹' + outstanding.toLocaleString('en-IN')}
                sub={(pending.length + overdue.length) + ' unpaid'}
                iconBg="bg-amber-500/15"
                icon={<svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
              <StatCard
                label="Collected"
                value={'₹' + collected.toLocaleString('en-IN')}
                sub={paid.length + ' invoices paid'}
                delta={paidDelta}
                iconBg="bg-green-500/15"
                icon={<svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
              <StatCard
                label="Overdue"
                value={overdue.length}
                sub={overdue.length > 0 ? 'needs attention' : 'all clear'}
                iconBg="bg-red-500/15"
                icon={<svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
              />
            </div>

            {/* CHARTS ROW */}
            {invoices.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

                {/* BAR CHART */}
                <div className="lg:col-span-2 bg-slate-900 border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-bold text-white text-sm">Monthly Overview</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Collections vs Outstanding — last 6 months</p>
                    </div>
                    <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                      {months[5].label} {months[5].year}
                    </span>
                  </div>
                  <BarChart data={monthlyData} />
                </div>

                {/* DONUT CHART */}
                <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
                  <h2 className="font-bold text-white text-sm mb-1">Invoice Status</h2>
                  <p className="text-xs text-slate-500 mb-5">Current breakdown by status</p>
                  <DonutChart paid={paid.length} pending={pending.length} overdue={overdue.length} />

                  {/* collection rate mini */}
                  <div className="mt-5 pt-5 border-t border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">Collection rate</span>
                      <span className="text-xs font-bold text-white">{collectionRate}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                        style={{ width: collectionRate + '%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BOTTOM ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* RECENT INVOICES */}
              <div className="lg:col-span-2 bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                  <h2 className="font-bold text-white text-sm">Recent Invoices</h2>
                  <Link to="/invoices" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors flex items-center gap-1">
                    View all
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                {recent.length === 0 ? (
                  <div className="py-16 text-center px-6">
                    <p className="text-slate-400 font-medium mb-1">No invoices yet</p>
                    <p className="text-slate-600 text-sm mb-5">Create your first invoice to see analytics</p>
                    <Link to="/invoices/new" className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Create invoice
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {recent.map(inv => (
                      <Link key={inv._id} to={'/invoices/' + inv._id}
                        className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate-400">
                            {inv.clientName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white text-sm truncate">{inv.clientName}</p>
                            <p className="text-xs text-slate-500 truncate">{inv.clientEmail}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                          <div className="text-right hidden sm:block">
                            <p className="font-bold text-white text-sm">₹{inv.amount.toLocaleString('en-IN')}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                          <StatusBadge status={inv.status} />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* TOP CLIENTS */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5">
                  <h2 className="font-bold text-white text-sm">Top Outstanding</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Clients with most unpaid balance</p>
                </div>

                {topClients.length === 0 ? (
                  <div className="py-10 text-center px-4">
                    <p className="text-green-400 font-semibold text-sm">All caught up!</p>
                    <p className="text-slate-600 text-xs mt-1">No outstanding balances</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {topClients.map((c, i) => {
                      const maxAmt = topClients[0].amount;
                      const pct    = Math.round((c.amount / maxAmt) * 100);
                      return (
                        <div key={c.email} className="px-5 py-3.5">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs text-slate-600 font-bold w-4">#{i + 1}</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-white truncate">{c.name}</p>
                            </div>
                            <p className="text-sm font-black text-amber-400 flex-shrink-0">
                              ₹{c.amount.toLocaleString('en-IN')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-6">
                            <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500/60 rounded-full" style={{ width: pct + '%' }} />
                            </div>
                            <span className="text-xs text-slate-600">{c.count} inv</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {topClients.length > 0 && (
                  <div className="px-5 py-3 border-t border-white/5">
                    <Link to="/payments" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors flex items-center gap-1">
                      View all payments
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
