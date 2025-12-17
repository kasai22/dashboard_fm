"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";
import { getCookie } from "cookies-next";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/* ----------------------------- Types ----------------------------- */
interface SummaryStats {
  registered_users: number;
  tasks_assigned: number;
  throughput: string; // e.g. "17/50"
}

interface RegisteredUser {
  full_name: string;
  email: string;
  college_name: string;
  score: number;
  status: string;
}

interface OverviewStats {
  total_tasks: number;
  assigned_tasks: number;
  unassigned_tasks: number;
  corrected_tasks: number;
  incorrect_tasks: number;
  edited_tasks: number;
}
/* ----------------------------- Page ----------------------------- */
export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const [stats, setStats] = useState<SummaryStats>({
    registered_users: 0,
    tasks_assigned: 0,
    throughput: "0/0",
  });
  const [overviewStats, setOverviewStats] = useState<OverviewStats>({
    total_tasks: 0,
    assigned_tasks: 0,
    unassigned_tasks: 0,
    corrected_tasks: 0,
    incorrect_tasks: 0,
    edited_tasks: 0,
  });
  const [users, setUsers] = useState<RegisteredUser[]>([]);

  /* ------------------------- Auth Guard ------------------------- */
  useEffect(() => {
    const jwt = getCookie("jwt");
    const role = getCookie("role");

    if (!jwt || role !== "Admin") {
      window.location.href = "/adminlogin";
      return;
    }

    setToken(String(jwt));
  }, []);

  /* ------------------------- Fetch Summary ------------------------- */
  useEffect(() => {
    if (!token) return;

    const fetchSummary = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${API_BASE}/admin/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStats(res.data.stats);
        setUsers(res.data.registered_users || []);
      } catch (err) {
        console.error("Admin summary error:", err);
        window.location.href = "/adminlogin";
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const fetchOverview = async () => {
      try {
        setLoading(true);

        const resOver = await axios.get(`${API_BASE}/admin/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOverviewStats(resOver.data);
      } catch (err) {
        console.error("Admin summary error:", err);
        window.location.href = "/adminlogin";
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-700">
        Loading Dashboard...
      </div>
    );
  }

  /* ------------------------- Derived ------------------------- */
  const totalTasks = stats.tasks_assigned;
  const [completedStr] = stats.throughput.split("/");
  const completed = Number(completedStr || 0);
  const pending = totalTasks - completed;

  // Example distribution
  const unassigned = overviewStats.total_tasks;
  const correct = overviewStats.corrected_tasks;
  const incorrect = overviewStats.incorrect_tasks;
  const edited = overviewStats.edited_tasks;

  /* ------------------------- Chart ------------------------- */
  const pieData = {
    labels: ["Correct", "Incorrect", "Edited", "Pending"],
    datasets: [
      {
        data: [correct, incorrect, edited, pending],
        backgroundColor: ["#9AD43A", "#FF4D3D", "#4C8BF5", "#FFA000"],
        hoverOffset: 8,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header showProfile />

      <div className="flex flex-1">
        <AdminSidebar active="dashboard" />

        <main className="flex-1 px-10 py-8">
          {/* ---------------- Welcome ---------------- */}
          <section className="bg-white rounded-3xl shadow-sm px-8 py-6 mb-8">
            <h2 className="text-2xl font-semibold text-black">
              Welcome back, <span className="text-[#9C6400]">Admin</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 text-gray-500 font-black gap-6 mt-6 text-sm">
              <Info label="Full Name" value={"Admin"} />
              <Info label="Email" value={"admin@farmvaidya.com"} />
            </div>
          </section>

          {/* ---------------- Overview ---------------- */}
          <h3 className="text-black text-lg font-semibold mb-4">Overview</h3>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
            <Stat label="Total Users" value={stats.registered_users} />
            <Stat label="Assigned Tasks" value={totalTasks} highlight />
            <Stat label="Completed" value={completed} color="blue" />
            <Stat label="Pending" value={pending} color="orange" />
            <Stat label="Unassigned" value={unassigned} color="orange" />
          </section>

          {/* ---------------- Chart + Actions ---------------- */}
          <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chart */}
            <div className="bg-white rounded-3xl shadow-sm p-6 col-span-3">
              <h3 className="text-lg font-semibold mb-6 text-black">
                Assigned Tasks Overview
              </h3>

              <div className="flex flex-col items-start">
                {/* Left numbers */}
                <div className="flex flex-row gap-20">
                  <div>
                    <p className="text-sm text-slate-400">Assigned Tasks</p>
                    <p className="text-3xl font-bold text-black">
                      {totalTasks}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">
                      Ready For Training (Correct + Edited)
                    </p>
                    <p className="text-3xl font-bold text-black">
                      {correct + edited}
                    </p>
                  </div>
                </div>

                {/* Pie */}
                <div className="h-72 w-72">
                  <Pie
                    data={pieData}
                    options={{
                      plugins: {
                        legend: {
                          position: "right",
                          labels: {
                            boxWidth: 14,
                            padding: 20,
                            font: { size: 14 },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-black">
                Quick Actions
              </h3>
              {/* 
              <ActionButton text="Upload Emails" url="/admin/emails" /> */}

              <ActionButton text="Assign Tasks" url="/admin/unassigned" />
              <ActionButton text="View Users" url="/admin/userManagement" />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

/* ----------------------- Components ----------------------- */

const Info = ({ label, value }: any) => (
  <div>
    <p className="text-xs text-slate-400">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

const Stat = ({ label, value, highlight, color }: any) => (
  <div className="bg-white rounded-2xl shadow-sm px-6 py-4">
    <p className="text-xs text-slate-400">{label}</p>
    <p
      className={`text-2xl font-semibold mt-2 ${
        highlight
          ? "text-[#9C6400]"
          : color === "blue"
          ? "text-blue-600"
          : color === "orange"
          ? "text-orange-500"
          : "text-slate-800"
      }`}
    >
      {value}
    </p>
  </div>
);

const ActionButton = ({ text, url }: any) => (
  <button
    onClick={() => (window.location.href = url)}
    className="w-full bg-[#3AA76D] text-white rounded-xl px-4 py-3
               flex justify-between items-center
               hover:bg-[#2f8f5d] active:scale-[0.97] transition-all"
  >
    <span>{text}</span>
    <span>›</span>
  </button>
);
