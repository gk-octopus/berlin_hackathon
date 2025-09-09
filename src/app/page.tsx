"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to story view by default
    router.push('/story');
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 text-primary">⚡</div>
        <p className="text-foreground">Redirecting to Story View...</p>
      </div>
    </div>
  );
}