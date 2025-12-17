"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-600 text-lg">
      Redirecting...
    </div>
  );
}
