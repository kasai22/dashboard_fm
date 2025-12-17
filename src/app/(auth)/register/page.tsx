"use client";

import React, { useState } from "react";
import axios from "axios";
import Header from "@/components/Header";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: "",
    college_id: "",
    college_name: "",
    mobile_number: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await axios.post(`${API_BASE}/register`, form, {
        headers: { "Content-Type": "application/json" },
      });
      setSuccess("Registration successful. Please login.");
      setForm({
        full_name: "",
        college_id: "",
        college_name: "",
        mobile_number: "",
        email: "",
      });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header showProfile={false} />

      <div className="min-h-[calc(100vh-64px)] bg-white flex items-start px-6 pt-6">
        <div className="w-full flex gap-8">
          {/* ---------------- LEFT PANEL ---------------- */}
          <div className="w-[380px] bg-[#00863F] rounded-3xl text-white p-8 flex flex-col">
            <h2 className="text-3xl font-bold leading-snug">
              <span className="text-[#FFCF32]">Rythuvaani -</span>
              <br />
              India’s Largest Telugu
              <br />
              Agri-Conversational
              <br />
              Speech Dataset
            </h2>

            <p className="mt-3 text-sm text-emerald-100 italic">
              “Building conversational voice technologies that truly understand
              farmers”
            </p>

            <div
              className="mt-8 w-full aspect-square rounded-2xl flex items-center justify-center
              bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.35)_0px,rgba(255,255,255,0.35)_12px,transparent_12px,transparent_24px)]
            "
            >
              <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center shadow">
                <span className="text-[#00863F] text-2xl">▶</span>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-lg font-semibold text-[#FFCF32]">Why Us?</h3>
              <ul className="mt-3 space-y-2 text-sm text-emerald-100">
                <li>⭐ Collecting 30K hours of agri conversational audio</li>
                <li>⭐ Works for all dialects across AP & Telangana</li>
                <li>⭐ Supports 10+ million farmers directly</li>
              </ul>
            </div>
          </div>

          {/* ---------------- RIGHT PANEL ---------------- */}
          <div className="flex-1 flex justify-center">
            <div className="max-w-lg w-full bg-white rounded-3xl p-12 shadow-sm">
              <h1 className="text-4xl font-bold text-center text-slate-900">
                Register to <span className="text-[#9C6400]">Rythuvaani</span>
              </h1>

              <p className="text-sm text-slate-500 mt-2 mb-8 text-center">
                Create your account to start contributing Telugu audio data.
              </p>

              {/* Switch */}
              <div className="w-full bg-[#00863F] rounded-full p-1 flex mb-6">
                <button className="flex-1 py-2 rounded-full bg-white text-[#00863F] font-medium">
                  User Register
                </button>
                <button className="flex-1 py-2 rounded-full text-white font-medium">
                  Admin Login
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                />
                <Input
                  label="College ID"
                  name="college_id"
                  value={form.college_id}
                  onChange={handleChange}
                />
                <Input
                  label="College Name"
                  name="college_name"
                  value={form.college_name}
                  onChange={handleChange}
                />
                <Input
                  label="Mobile Number"
                  name="mobile_number"
                  value={form.mobile_number}
                  onChange={handleChange}
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3 rounded-xl bg-[#00863F] text-white font-medium hover:bg-[#007336] transition disabled:opacity-60"
                >
                  {loading ? "Registering..." : "Register"}
                </button>

                {error && (
                  <p className="text-sm text-red-600 text-center">{error}</p>
                )}
                {success && (
                  <p className="text-sm text-green-600 text-center">
                    {success}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------- INPUT ---------------- */

function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <input
        {...props}
        required
        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00863F]/40"
      />
    </div>
  );
}
