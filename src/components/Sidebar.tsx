"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineViewGrid, HiOutlinePhone, HiMenu, HiX } from "react-icons/hi";
import { deleteCookie } from "cookies-next";
import Link from "next/link";
import Image from "next/image";
type SidebarActive = "dashboard" | "verification";

interface SidebarProps {
  active?: SidebarActive;
}

const Sidebar: React.FC<SidebarProps> = ({ active = "dashboard" }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const goTo = (path: string) => {
    router.push(path);
    setOpen(false); // close on mobile
  };

  const isDashboard = active === "dashboard";
  const isVerification = active === "verification";
  const logout = () => {
    // clear auth
    deleteCookie("jwt");
    localStorage.removeItem("username");
    localStorage.removeItem("email");

    // redirect
    router.replace("/login");
  };

  return (
    <>
      {/* ---------- MOBILE TOP BAR ---------- */}
      <div className="md:hidden bg-[#00863F] px-4 py-4 flex items-center justify-between text-white">
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
        <button onClick={() => setOpen(true)}>
          <HiMenu className="text-2xl" />
        </button>
      </div>

      {/* ---------- MOBILE OVERLAY ---------- */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* ---------- SIDEBAR ---------- */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 bg-[#00863F] text-white
          flex flex-col pt-6 pb-8 px-4 space-y-4
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* MOBILE CLOSE */}
        <div className="md:hidden flex justify-end">
          <button onClick={() => setOpen(false)}>
            <HiX className="text-2xl" />
          </button>
        </div>

        {/* MAIN CARD */}
        <div className="flex-1 rounded-[32px] bg-[#00863F] flex flex-col pt-6 px-3 space-y-3">
          {/* DASHBOARD */}
          <SidebarItem
            active={isDashboard}
            label="Dashboard"
            icon={<HiOutlineViewGrid className="text-lg" />}
            onClick={() => goTo("/user/dashboard")}
          />

          {/* VERIFICATIONS */}
          <SidebarItem
            active={isVerification}
            label="Verifications"
            icon={<HiOutlinePhone className="text-lg" />}
            onClick={() => goTo("/user/verification")}
          />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

/* ---------------- SUB COMPONENT ---------------- */

const SidebarItem = ({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium
      transition w-full
      ${
        active
          ? "bg-white text-emerald-700 shadow-sm"
          : "bg-white/5 text-white hover:bg-white/10"
      }
    `}
  >
    <span
      className={`
        inline-flex h-8 w-8 items-center justify-center rounded-full border
        ${
          active
            ? "border-emerald-600 text-emerald-700 bg-white"
            : "border-white/40 text-white"
        }
      `}
    >
      {icon}
    </span>
    <span>{label}</span>
  </button>
);
