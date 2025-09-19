"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to leaderboard page
    router.replace('/leaderboard');
  }, [router]);
  
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to leaderboard...</p>
      </div>
    </div>
  );
}
