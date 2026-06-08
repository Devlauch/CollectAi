import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

export default function MyInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/invoices/my-invoices")
      .then((res) => setInvoices(res.data.invoices))
      .finally(() => setLoading(false));
  }, []);

  const totalDue = invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">
            My Invoices
          </h1>
          <p className="text-slate-500 mt-1">
            Invoices assigned to your email
          </p>
        </div>

        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 mb-6">
          <p className="text-slate-400 text-sm">
            Total Outstanding
          </p>

          <h2 className="text-4xl font-black text-amber-400 mt-2">
            ₹{totalDue.toLocaleString("en-IN")}
          </h2>
        </div>

        {loading ? (
          <div className="text-white">Loading...</div>
        ) : invoices.length === 0 ? (
          <div className="bg-slate-900 border border-white/5 rounded-2xl p-10 text-center">
            <p className="text-slate-400">
              No invoices assigned to you.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice._id}
                className="bg-slate-900 border border-white/5 rounded-2xl p-5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      {invoice.clientName}
                    </h3>

                    <p className="text-slate-500 text-sm mt-1">
                      Due:{" "}
                      {new Date(
                        invoice.dueDate
                      ).toLocaleDateString("en-IN")}
                    </p>

                    {invoice.description && (
                      <p className="text-slate-400 text-sm mt-3">
                        {invoice.description}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-black text-white">
                      ₹
                      {invoice.amount.toLocaleString(
                        "en-IN"
                      )}
                    </p>

                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        invoice.status === "paid"
                          ? "bg-green-500/20 text-green-400"
                          : invoice.status === "overdue"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                </div>

                {invoice.paymentLink && (
                  <div className="mt-5">
                    <a
                      href={invoice.paymentLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium"
                    >
                      Pay Now
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}