import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

function StatCard({ label, value, sub, colorClass, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${colorClass}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass.replace('text-', 'bg-').replace('600', '100')}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/invoices')
      .then(res => setInvoices(res.data.invoices))
      .finally(() => setLoading(false));
  }, []);

  const pending = invoices.filter(i => i.status === 'pending');
  const paid = invoices.filter(i => i.status === 'paid');
  const overdue = invoices.filter(i => i.status === 'overdue');
  const outstanding = [...pending, ...overdue].reduce((s, i) => s + i.amount, 0);
  const recent = invoices.slice(0, 6);

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">Your invoice collection overview</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Total Invoices"
                value={invoices.length}
                sub={invoices.length === 0 ? 'Create your first' : 'all time'}
                colorClass="text-indigo-600"
                icon={<svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              />
              <StatCard
                label="Outstanding"
                value={'INR ' + outstanding.toLocaleString('en-IN')}
                sub={pending.length + overdue.length + ' unpaid'}
                colorClass="text-amber-600"
                icon={<svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
              <StatCard
                label="Paid"
                value={paid.length}
                sub={'INR ' + paid.reduce((s, i) => s + i.amount, 0).toLocaleString('en-IN')}
                colorClass="text-green-600"
                icon={<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
              <StatCard
                label="Overdue"
                value={overdue.length}
                sub={overdue.length > 0 ? 'Needs attention' : 'All clear'}
                colorClass="text-red-600"
                icon={<svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                <h2 className="font-semibold text-gray-900">Recent Invoices</h2>
                <Link to="/invoices" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  View all
                </Link>
              </div>
              {recent.length === 0 ? (
                <div className="py-16 text-center">
                  <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-400 text-sm">No invoices yet</p>
                  <Link to="/invoices/new" className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    Create your first invoice
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recent.map(inv => (
                    <Link
                      key={inv._id}
                      to={'/invoices/' + inv._id}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group"
                    >
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{inv.clientName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{inv.clientEmail}</p>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 text-sm">INR {inv.amount.toLocaleString('en-IN')}</p>
                          <p className="text-xs text-gray-400">Due {new Date(inv.dueDate).toLocaleDateString('en-IN')}</p>
                        </div>
                        <StatusBadge status={inv.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
