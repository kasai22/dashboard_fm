"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { HiOutlineViewGrid, HiOutlinePhone } from "react-icons/hi";

type SidebarActive = "dashboard" | "verification";

interface SidebarProps {
  active?: SidebarActive;
}

const Sidebar: React.FC<SidebarProps> = ({ active = "dashboard" }) => {
  const router = useRouter();

  const goTo = (path: string) => {
    router.push(path);
  };

  const isDashboard = active === "dashboard";
  const isVerification = active === "verification";

  return (
    <aside
      className="
        w-64
        bg-[#00863F]
        text-white
        flex
        flex-col
        pt-6
        pb-8
        px-4
        space-y-4
      "
    >
      {/* big green card background like the design */}
      <div className="flex-1 rounded-[32px] bg-[#00863F] flex flex-col pt-6 px-3 space-y-3">
        {/* DASHBOARD */}
        <button
          type="button"
          onClick={() => goTo("/user/dashboard")}
          className={`
            flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium
            transition
            w-full
            ${
              isDashboard
                ? "bg-white text-emerald-700 shadow-sm"
                : "bg-white/5 text-white hover:bg-white/10"
            }
          `}
        >
          <span
            className={`
              inline-flex h-8 w-8 items-center justify-center rounded-full border
              ${
                isDashboard
                  ? "border-emerald-600 text-emerald-700 bg-white"
                  : "border-white/40 text-white"
              }
            `}
          >
            <HiOutlineViewGrid className="text-lg" />
          </span>
          <span>Dashboard</span>
        </button>

        {/* VERIFICATIONS */}
        <button
          type="button"
          onClick={() => goTo("/user/verification")}
          className={`
            flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium
            transition
            w-full
            ${
              isVerification
                ? "bg-white text-emerald-700 shadow-sm"
                : "bg-white/5 text-white hover:bg-white/10"
            }
          `}
        >
          <span
            className={`
              inline-flex h-8 w-8 items-center justify-center rounded-full border
              ${
                isVerification
                  ? "border-emerald-600 text-emerald-700 bg-white"
                  : "border-white/40 text-white"
              }
            `}
          >
            <HiOutlinePhone className="text-lg" />
          </span>
          <span>Verifications</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
