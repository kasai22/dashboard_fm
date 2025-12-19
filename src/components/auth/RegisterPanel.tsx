"use client";

import React, { useState } from "react";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function RegisterPanel() {
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
      await axios.post(`${API_BASE}/register`, {
        full_name: form.full_name,
        college_id: form.college_id,
        college_name: form.college_name,
        mobile_number: form.mobile_number,
        email: form.email,
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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 text-left">
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
          className="w-full mt-2 py-3 rounded-xl bg-[#00863F] text-white font-medium
                     hover:bg-[#007336] transition disabled:opacity-60"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        {success && (
          <p className="text-sm text-green-600 text-center">{success}</p>
        )}
      </form>
    </div>
  );
}

/* ---------------- INPUT COMPONENT ---------------- */

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
        className="w-full px-4 py-2.5 rounded-xl border text-black border-slate-300
                   focus:outline-none focus:ring-2 focus:ring-[#00863F]/40"
      />
    </div>
  );
}
