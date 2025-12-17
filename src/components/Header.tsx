"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";

interface HeaderProps {
  showProfile?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showProfile = true }) => {
  const router = useRouter();

  const [userName, setUserName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    try {
      const storedName = localStorage.getItem("username");
      const storedEmail = localStorage.getItem("email");

      if (storedName) setUserName(storedName);
      if (storedEmail) setEmail(storedEmail);
    } catch (err) {
      console.warn("Failed reading from localStorage:", err);
    }
  }, []);

  const displayName = isMounted && userName ? userName : "User";

  /* ---------------- LOGOUT ---------------- */
  const logout = () => {
    // clear auth
    deleteCookie("jwt");
    localStorage.removeItem("username");
    localStorage.removeItem("email");

    // redirect
    router.replace("/login");
  };

  return (
    <header className="w-full h-16 border-b border-slate-200 bg-white flex items-center justify-between px-[2rem]">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <div className="relative h-16 w-[150px]">
          <Image
            src="/farmvaidya_logo.png"
            alt="Farm Vaidya"
            fill
            priority
            className="object-contain"
          />
        </div>
      </Link>

      {showProfile && (
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 focus:outline-none"
          >
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-sm font-medium text-slate-800">
                {displayName}
              </span>
              {isMounted && email && (
                <span className="text-xs text-slate-500">{email}</span>
              )}
            </div>

            <div className="h-9 w-9 rounded-full bg-emerald-700 text-white flex items-center justify-center text-sm font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
              <button
                onClick={logout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
