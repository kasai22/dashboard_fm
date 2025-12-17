"use client";

import React, { useState } from "react";
import axios from "axios";
import Header from "@/components/Header";
import { setCookie } from "cookies-next";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleAdminLogin = async () => {
    setLoading(true);
    setStatus("");

    try {
      if (!email.trim() || !password) {
        setStatus("⚠️ Enter email and password.");
        setLoading(false);
        return;
      }

      const formData = new URLSearchParams();
      formData.append("email", email.trim());
      formData.append("password", password);

      const res = await axios.post(
        `${process.env.NEXTAUTH_URL}/admin/login`,
        formData,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      const token = res.data?.access_token;
      if (!token) {
        setStatus("⚠️ Invalid server response.");
        setLoading(false);
        return;
      }

      // -----------------------------
      // 🔥 STORE JWT IN COOKIE
      // -----------------------------
      setCookie("jwt", token, {
        secure: false, // localhost support
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      setCookie("role", "Admin", {
        secure: false,
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      window.location.href = "/admin/dashboard";
    } catch (err: any) {
      if (err.response) {
        setStatus("⚠️ " + (err.response.data?.detail || "Invalid credentials"));
      } else {
        setStatus("⚠️ Network or server error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header showProfile={false} />

      <div className="min-h-[calc(100vh-64px)] bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-lg bg-white p-10 rounded-3xl shadow-md border border-slate-200">
          {/* TITLE */}
          <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">
            Admin Login
          </h1>
          <p className="text-center text-sm text-slate-500 mb-8">
            Sign in to access administrator tools.
          </p>

          {/* FORM */}
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-black placeholder:text-gray-300 outline-none focus:border-[#00863F] focus:ring-1 focus:ring-[#00863F]"
            />

            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none text-black placeholder:text-gray-300 focus:border-[#00863F] focus:ring-1 focus:ring-[#00863F]"
            />

            <button
              onClick={handleAdminLogin}
              disabled={loading}
              className="w-full bg-[#00863F] text-white font-semibold py-2 rounded-full shadow-sm hover:bg-[#007536] disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Login as Admin"}
            </button>

            {status && <p className="text-xs text-red-600">{status}</p>}
          </div>
        </div>
      </div>
    </>
  );
}
