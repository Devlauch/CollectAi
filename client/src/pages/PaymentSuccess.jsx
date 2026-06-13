import { Link } from "react-router-dom";

export default function PaymentSuccess() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <h1 className="text-green-500 text-4xl font-bold mb-4">
        Payment Successful 🚀
      </h1>

      <p className="text-gray-400 mb-6">
        Your invoice has been paid successfully.
      </p>

      <Link
        to="/dashboard"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}