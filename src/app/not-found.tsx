import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#181A1F] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-[#E7F2EF] text-[#2E6F5E] flex items-center justify-center font-bold text-2xl mb-4 shadow-soft">
        404
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Page Not Found</h1>
      <p className="text-sm text-[#646873] max-w-md mb-6">
        The requested page does not exist or has been moved. Return to your daily diet dashboard.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2E6F5E] text-white font-semibold text-xs shadow-soft hover:bg-[#255c4e] transition-colors"
      >
        <Home className="w-4 h-4 text-[#8CE07A]" />
        <span>Return to Nutriya Dashboard</span>
      </Link>
    </div>
  );
}
