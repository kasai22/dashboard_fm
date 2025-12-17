"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios, { AxiosRequestConfig } from "axios";
import Header from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";
import { getCookie } from "cookies-next";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/* ---------- Types ---------- */

interface SummaryStats {
  registered_users: number;
  selected_users: number;
  rejected_users: number;
  tasks_assigned: number;
  throughput: string;
}

interface SummaryUser {
  full_name: string;
  email: string;
  mobile_number: string;
  college_name: string;
  score: number;
  status: "Selected" | "Rejected" | "Pending";
  tasks_assigned: number;
  tasks_completed: number;
  tasks_correct: number;
  tasks_incorrect: number;
  tasks_edited: number;
}

/* ---------- Component ---------- */

export default function AdminUsersManagementPage() {
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [users, setUsers] = useState<SummaryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");

  const [token, setToken] = useState<string | null>(null);
  const [authConfig, setAuthConfig] = useState<AxiosRequestConfig>({});

  /* ---------- Admin Auth (SAME AS AdminEmailsPage) ---------- */

  useEffect(() => {
    const cookieToken = getCookie("jwt");
    if (!cookieToken) {
      setStatusMsg("Admin session expired. Please login again.");
      return;
    }

    const t = String(cookieToken);
    setToken(t);
    setAuthConfig({
      headers: {
        Authorization: `Bearer ${t}`,
      },
    });
  }, []);

  /* ---------- Fetch Admin Summary ---------- */

  const fetchSummary = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/summary`, authConfig);

      setStats(res.data?.stats ?? null);
      setUsers(res.data?.registered_users ?? []);
    } catch (err) {
      console.error("Admin summary fetch failed", err);
      setStatusMsg("Failed to load admin summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /* ---------- Render ---------- */

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header showProfile={false} />

      <div className="flex gap-6">
        <AdminSidebar active="users" />

        <main className="flex-1 pt-8 px-6">
          <h2 className="mb-6 text-2xl font-semibold text-slate-900">
            User Management
          </h2>

          {/* ---------- Users Table ---------- */}
          <div className="rounded-3xl border bg-white shadow-sm">
            {loading ? (
              <div className="py-20 text-center text-slate-500">
                Loading summary...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 align-center font-medium">
                      <th className="px-6 py-3 align-center">S.No</th>
                      <th className="px-6 py-3">Full Name</th>
                      <th className="px-6 py-3">Email ID</th>
                      <th className="px-6 py-3">Assigned</th>
                      <th className="px-6 py-3">Ready for Training</th>
                      <th className="px-6 py-3">Correct</th>
                      <th className="px-6 py-3">Incorrect</th>

                      <th className="px-6 py-3">Edited</th>
                      <th className="px-6 py-3">Pending</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-12 text-center text-slate-500"
                        >
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((u, idx) => (
                        <tr
                          key={u.email}
                          className="border-b last:border-0 text-black hover:bg-slate-50"
                        >
                          <td className="px-6 py-3">{idx + 1}</td>
                          <td className="px-6 py-3 font-medium text-black">
                            {u.full_name}
                          </td>
                          <td className="px-6 py-3 text-black">{u.email}</td>
                          <td className="px-6 py-3 text-black text-center">
                            {u.tasks_assigned}
                          </td>
                          <td className="px-6 py-3 text-black text-center">
                            {u.tasks_correct + u.tasks_edited}
                          </td>
                          <td className="px-6 py-3 text-black text-center">
                            {u.tasks_correct}
                          </td>
                          <td className="px-6 py-3 text-black text-center">
                            {u.tasks_incorrect}
                          </td>
                          <td className="px-6 py-3 text-black text-center">
                            {u.tasks_edited}
                          </td>
                          <td className="px-6 py-3 text-black text-center">
                            {u.tasks_assigned - u.tasks_completed}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {statusMsg && (
            <p className="mt-3 text-sm text-slate-600">{statusMsg}</p>
          )}
        </main>
      </div>
    </div>
  );
}

/* ---------- Small Components ---------- */

function StatCard({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="mt-1 text-xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "Selected"
      ? "bg-emerald-50 text-emerald-700"
      : status === "Rejected"
      ? "bg-red-50 text-red-600"
      : "bg-amber-50 text-amber-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${color}`}>
      {status}
    </span>
  );
}
