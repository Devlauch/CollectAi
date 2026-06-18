import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying | paid | failed

  useEffect(() => {
    const orderId = searchParams.get("order_id");
    if (!orderId) {
      setStatus("failed");
      return;
    }
    api.get("/payment/verify/" + orderId)
      .then((res) => {
        setStatus(res.data.orderStatus === "PAID" ? "paid" : "failed");
      })
      .catch(() => setStatus("failed"));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">
      {status === "verifying" && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Verifying payment...</p>
        </div>
      )}

      {status === "paid" && (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Payment Successful</h1>
          <p className="text-slate-400 text-sm mb-8">Your invoice has been marked as paid.</p>
          <Link
            to="/payments"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
          >
            View Payments
          </Link>
        </div>
      )}

      {status === "failed" && (
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Payment Failed</h1>
          <p className="text-slate-400 text-sm mb-8">Something went wrong. Please try again.</p>
          <Link
            to="/payments"
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            Back to Payments
          </Link>
        </div>
      )}
    </div>
  );
}
