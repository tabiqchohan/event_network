import Link from "next/link";
import { CheckCircle, Wifi } from "lucide-react";

export default function SuccessPage() {
  return (
    <main className="flex-1 flex items-center justify-center py-8">
      <div className="w-full max-w-md mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Connected! Enjoy Wi-Fi 🎉
          </h1>
          <p className="text-gray-600 mb-8">
            You are now registered and connected to the event Wi-Fi network.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center gap-3 mb-8">
            <Wifi className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              Internet access is active
            </span>
          </div>

          <Link
            href="/"
            className="inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to registration
          </Link>
        </div>
      </div>
    </main>
  );
}
