"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { getCookie, deleteCookie } from "cookies-next";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

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
  index: number;
  text: string;
  action: "correct" | "incorrect" | "edited" | null;
  completed_at: string | null;
  audio_url?: string;
}

/* ---------------- JWT DECODE ---------------- */
function decodeJwt(token: string): any | null {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

/* ===================== DASHBOARD ===================== */
export default function UserDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = getCookie("jwt");

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

        /* -------- USER PROFILE -------- */
        const profile = await axios.get(`${API_BASE}/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(profile.data);

        /* -------- DASHBOARD STATS -------- */
        const statsRes = await axios.get(`${API_BASE}/dashboard/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

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

        /* -------- RECENT ACTIVITY -------- */
        const tasksRes = await axios.get(`${API_BASE}/user/${userId}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const attemptedTasks = (tasksRes.data.tasks || [])
          .filter((t: any) => t.completed === true && t.action !== null)
          .slice(0, 10);

        setRecent(attemptedTasks);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  if (loading) return <LoadingScreen />;
  if (!user) return <UnauthenticatedScreen />;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header showProfile />

      <div className="flex flex-1">
        <Sidebar active="dashboard" />

        <main className="flex-1 px-8 py-8">
          {/* -------- USER INFO -------- */}
          <section className="bg-white rounded-3xl shadow px-8 py-6 border border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              Welcome back,{" "}
              <span className="text-green-700 font-bold">
                {user.full_name || user.email.split("@")[0]}
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-sm">
              <UserInfo label="Full Name" value={user.full_name} />
              <UserInfo label="College ID" value={user.college_id} />
              <UserInfo label="Mobile Number" value={user.mobile_number} />
              <UserInfo label="Email" value={user.email} />
              <UserInfo label="College Name" value={user.college_name} />
            </div>
          </section>

          {/* -------- STATS -------- */}
          <section className="mt-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              Dashboard Overview
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard
                label="Assigned"
                value={stats?.assigned_files}
                color="green"
              />
              <StatCard label="Correct" value={stats?.correct} color="green" />
              <StatCard
                label="Incorrect"
                value={stats?.incorrect}
                color="red"
              />
              <StatCard label="Edited" value={stats?.edited} color="blue" />
              <StatCard
                label="Pending"
                value={stats?.pending_files}
                color="green"
              />
            </div>
          </section>

          {/* -------- RECENT ACTIVITY -------- */}
          <section className="mt-10">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              Recent Activity
            </h3>

            <div className="bg-white rounded-3xl shadow border border-slate-200 overflow-hidden">
              {recent.length === 0 ? (
                <p className="p-6 text-slate-600">No recent activity found.</p>
              ) : (
                <ActivityTable recent={recent} />
              )}
            </div>

            <div className="flex justify-between items-center text-sm text-slate-600 mt-3 px-2">
              <span>Showing last {recent.length} attempted items</span>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

/* ===================== SUB COMPONENTS ===================== */

const UserInfo = ({ label, value }: { label: string; value: any }) => (
  <div>
    <p className="text-xs uppercase text-slate-400">{label}</p>
    <p className="mt-1 font-medium text-slate-800">{value || "N/A"}</p>
  </div>
);

/* -------- STAT CARD (HOVER COLOR INVERT) -------- */
const StatCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value?: number;
  color: "green" | "red" | "blue";
}) => {
  const styles = {
    green:
      "border-green-600 text-green-600 bg-green-50 hover:bg-green-600 hover:text-white",
    red: "border-red-600 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white",
    blue: "border-blue-600 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white",
  };

  return (
    <div
      className={`
        group
        border rounded-2xl p-5
        transition-all duration-200 ease-in-out
        cursor-pointer
        hover:shadow-lg hover:-translate-y-1
        ${styles[color]}
      `}
    >
      <p className="text-xs uppercase opacity-70 group-hover:opacity-100">
        {label}
      </p>
      <p className="text-3xl font-bold mt-2">{value ?? 0}</p>
    </div>
  );
};

/* -------- ACTIVITY TABLE -------- */
const ActivityTable = ({ recent }: { recent: Activity[] }) => (
  <table className="min-w-full text-sm">
    <thead className="bg-slate-50 text-slate-400 text-xs uppercase">
      <tr>
        <th className="px-4 py-3">File Name</th>
        <th className="px-4 py-3">Timestamp</th>
        <th className="px-4 py-3">Action Taken</th>
      </tr>
    </thead>

    <tbody className="divide-y">
      {[...recent].reverse().map((item) => (
        <tr key={item.id} className="text-slate-700">
          <td className="px-4 py-3 truncate max-w-xs text-center">
            {getFileName(item.audio_url)}
          </td>
          <td className="px-4 py-3 text-center">
            {item.completed_at
              ? new Date(item.completed_at).toLocaleString("en-IN")
              : "-"}
          </td>
          <td className="px-4 py-3 text-center">
            <span
              className={`font-semibold ${
                item.action === "correct"
                  ? "text-green-600"
                  : item.action === "incorrect"
                  ? "text-red-600"
                  : item.action === "edited"
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            >
              {item.action ?? "-"}
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

/* -------- STATES -------- */
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-100">
    <p className="text-slate-600">Loading dashboard…</p>
  </div>
);

const UnauthenticatedScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-100">
    <p className="text-slate-700">Not authenticated.</p>
  </div>
);
