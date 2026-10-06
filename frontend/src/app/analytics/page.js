'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AnalyticsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/analytics');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-900 text-gray-400 space-y-3">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm">Redirecting to Analytics...</p>
    </div>
  );
}
