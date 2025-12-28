"use client";

import Header from "@/components/Header";
import AuthLeftPanel from "./AuthLeftPanel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header showProfile={false} />

      <div className="min-h-[calc(100vh-64px)] bg-white flex items-center px-6">
        <div className="w-full flex gap-10">
          <div className="md:block hidden">
            <AuthLeftPanel />
          </div>
          <div className="flex-1 flex items-center justify-center">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
