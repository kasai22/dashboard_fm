"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// React Icons
import { FiGrid, FiMail, FiUsers, FiFolder } from "react-icons/fi";

interface Props {
  active?: string;
}

export default function AdminSidebar({ active }: Props) {
  const pathname = usePathname();

  const menuItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <FiGrid />,
      href: "/admin/dashboard",
    },
    {
      key: "emails",
      label: "Emails Management",
      icon: <FiMail />,
      href: "/admin/emails",
    },
    {
      key: "usermanagement",
      label: "User Management",
      icon: <FiUsers />,
      href: "/admin/userManagement",
    },
    {
      key: "unassigned",
      label: "Unassigned Tasks",
      icon: <FiFolder />,
      href: "/admin/unassigned",
    },
  ];

  return (
    <aside className="w-64 bg-[#00863F] text-white min-h-[calc(100vh-70px)] p-4 rounded-r-3xl mt-2">
      <nav className="flex flex-col gap-2 mt-4">
        {menuItems.map((item) => {
          const isActive =
            active === item.key || pathname.startsWith(item.href);

          return (
            <Link key={item.key} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all text-sm font-medium ${
                  isActive
                    ? "bg-white text-[#00863F] shadow"
                    : "hover:bg-white/20"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
