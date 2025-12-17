"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";
import { getCookie } from "cookies-next";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/* ---------- TYPES ---------- */
interface RegisteredUser {
  id: number;
  name: string;
  email: string;
  college_id?: string;
  college_name?: string;
  mobile_number?: string;
  score?: number;
}

export default function AdminAssignTasksPage() {
  const token = getCookie("jwt");

  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [limit, setLimit] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- Load Registered Users ---------------- */
  useEffect(() => {
    if (!token) return;

    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/admin/users/registered?page=1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUsers(res.data.users || []);
      } catch (err) {
        console.error("Failed to load users", err);
        setError("Failed to load users");
      }
    };

    fetchUsers();
  }, [token]);

  /* ---------------- Assign Tasks ---------------- */
  const handleAssign = async () => {
    setMessage(null);
    setError(null);

    if (!selectedUser || !limit) {
      setError("Please select a user and enter task limit");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API_BASE}/admin/tasks/assign`,
        {
          user_id: Number(selectedUser),
          limit: Number(limit),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage("Tasks assigned successfully ✅");
      setSelectedUser("");
      setLimit("");
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
          "Failed to assign tasks. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header showProfile={false} />

      <div className="flex flex-1">
        <AdminSidebar active="unassigned" />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            Assign Tasks to User
          </h2>

          <div className="max-w-xl bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            {/* ---------------- User Dropdown ---------------- */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                User
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full rounded-lg border text-black border-slate-300 px-4 py-2 text-sm focus:border-[#00863F] focus:ring-1 focus:ring-[#00863F]"
              >
                <option value="">Select user</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            {/* ---------------- Task Limit ---------------- */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Number of Tasks
              </label>
              <input
                type="number"
                min={1}
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="Enter task limit"
                className="w-full rounded-lg border text-black border-slate-300 px-4 py-2 text-sm focus:border-[#00863F] focus:ring-1 focus:ring-[#00863F]"
              />
            </div>

            {/* ---------------- Action Button ---------------- */}
            <button
              onClick={handleAssign}
              disabled={loading}
              className="w-full rounded-full bg-[#00863F] py-2.5 text-sm font-semibold text-white hover:bg-[#007339] disabled:opacity-50"
            >
              {loading ? "Assigning..." : "Assign Tasks"}
            </button>

            {/* ---------------- Messages ---------------- */}
            {message && (
              <p className="mt-4 text-sm text-green-600">{message}</p>
            )}
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          </div>
        </main>
      </div>
    </div>
  );
}
