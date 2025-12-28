"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import { getCookie, deleteCookie } from "cookies-next";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/* ---------------- TYPES ---------------- */

interface User {
  id: number;
  email: string;
  full_name?: string;
  mobile_number?: string;
  college_name?: string;
  college_id?: string;
}

interface Stats {
  assigned_files: number;
  correct: number;
  incorrect: number;
  edited: number;
  pending_files: number;
}

interface Activity {
  id: number;
  completed_at: string | null;
  audio_url?: string;
  action: "correct" | "incorrect" | "edited" | null;
}

/* ---------------- HELPERS ---------------- */

const getFileName = (url?: string) => {
  if (!url) return "—";
  try {
    const u = new URL(url);
    return decodeURIComponent(u.pathname.split("/").pop() || "—");
  } catch {
    return "—";
  }
};

const decodeJwt = (token: string): any | null => {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

/* ===================== PAGE ===================== */

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const token = getCookie("jwt");

        /* ---------- AUTH CHECK ---------- */
        if (!token || typeof token !== "string") {
          router.replace("/login");
          return;
        }

        const decoded = decodeJwt(token);
        const userId = decoded?.id;

        if (!userId) {
          deleteCookie("jwt");
          router.replace("/login");
          return;
        }

        const authHeader = {
          headers: { Authorization: `Bearer ${token}` },
        };

        /* ---------- USER PROFILE ---------- */
        const profileRes = await axios.get(
          `${API_BASE}/user/${userId}`,
          authHeader
        );
        setUser(profileRes.data);

        /* ---------- DASHBOARD STATS ---------- */
        const statsRes = await axios.get(
          `${API_BASE}/dashboard/${userId}`,
          authHeader
        );

        const d = statsRes.data;
        const total = d.total ?? 0;

        setStats({
          assigned_files: total,
          correct: d.correct ?? 0,
          incorrect: d.incorrect ?? 0,
          edited: d.edited ?? 0,
          pending_files:
            total - (d.correct ?? 0) - (d.incorrect ?? 0) - (d.edited ?? 0),
        });

        /* ---------- RECENT ACTIVITY ---------- */
        const tasksRes = await axios.get(
          `${API_BASE}/user/${userId}/tasks`,
          authHeader
        );

        const attempted = (tasksRes.data.tasks || [])
          .filter((t: any) => t.completed === true && t.action !== null)
          .slice(0, 10);

        setRecent(attempted);
      } catch (err) {
        deleteCookie("jwt");
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  if (loading) return <LoadingScreen />;
  if (!user) return <UnauthenticatedScreen />;

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      {/* SIDEBAR (mobile + desktop handled internally) */}
      <Sidebar active="dashboard" />

      {/* MAIN */}
      <main className="flex-1 px-4 md:px-8 py-6 md:py-8 space-y-8">
        {/* USER CARD */}
        <section className="bg-white rounded-3xl shadow p-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Welcome back,{" "}
            <span className="text-emerald-700">
              {user.full_name || user.email.split("@")[0]}
            </span>
          </h2>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-sm">
            <Info label="Full Name" value={user.full_name} />
            <Info label="College ID" value={user.college_id} />
            <Info label="Mobile Number" value={user.mobile_number} />
            <Info label="Email" value={user.email} />
            <Info label="College Name" value={user.college_name} />
          </div>
        </section>

        {/* STATS */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Dashboard Overview</h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard label="Assigned" value={stats?.assigned_files} />
            <StatCard label="Correct" value={stats?.correct} green />
            <StatCard label="Incorrect" value={stats?.incorrect} red />
            <StatCard label="Edited" value={stats?.edited} blue />
            <StatCard label="Pending" value={stats?.pending_files} orange />
          </div>
        </section>

        {/* RECENT ACTIVITY */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>

          <div className="bg-white rounded-2xl shadow overflow-hidden">
            {recent.length === 0 ? (
              <p className="p-6 text-slate-600">No recent activity found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-200 text-slate-600">
                  <tr>
                    <th className="text-left px-4 py-3">File Name</th>
                    <th className="px-4 py-3 text-center">Timestamp</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[...recent].reverse().map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        {getFileName(item.audio_url)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.completed_at
                          ? new Date(item.completed_at).toLocaleString("en-IN")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">
                        {item.action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <p className="text-sm text-slate-500 mt-3">
            Showing last {recent.length} attempted items
          </p>
        </section>
      </main>
    </div>
  );
}

/* ---------------- UI COMPONENTS ---------------- */

const Info = ({ label, value }: any) => (
  <div>
    <p className="text-xs uppercase text-slate-400">{label}</p>
    <p className="mt-1 font-medium text-slate-800">{value || "N/A"}</p>
  </div>
);

const StatCard = ({ label, value, green, red, blue, orange }: any) => {
  const color = green
    ? "text-green-600"
    : red
    ? "text-red-600"
    : blue
    ? "text-blue-600"
    : orange
    ? "text-orange-500"
    : "text-slate-800";

  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value ?? 0}</p>
    </div>
  );
};

/* ---------------- STATES ---------------- */

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    Loading dashboard…
  </div>
);

const UnauthenticatedScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    Not authenticated.
  </div>
);
