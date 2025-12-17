"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import TransliterationTextBox from "@/components/TransliterationTextBox";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const UserVerificationPage = () => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const [session, setSession] = useState<any>(null);
  const [editedText, setEditedText] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  /* ---------------- LOAD JWT ---------------- */
  useEffect(() => {
    try {
      const t = getCookie("jwt") as string | undefined;
      if (!t) {
        window.location.href = "/login";
        return;
      }

      const payload = JSON.parse(atob(t.split(".")[1]));
      setToken(t);
      setUserId(payload.id);
    } catch (err) {
      console.error("Invalid JWT");
      window.location.href = "/login";
    }
  }, []);

  /* ---------------- LOAD SESSION ---------------- */
  const loadSession = async (direction: "current" | "next") => {
    if (!token || !userId) return;

    setLoading(true);
    setStatus("");

    try {
      const res = await axios.get(
        `${API_BASE}/start_session/${userId}?direction=${direction}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSession(res.data);
      setEditedText(res.data.text_blob || "");
      setIsEditing(false);
      setSubmitted(false);
    } catch (err) {
      console.error("Failed to load session", err);
      setStatus("❌ Failed to load question");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && userId) loadSession("current");
  }, [token, userId]);

  /* ---------------- SUBMIT & AUTO-NEXT ---------------- */
  const submit = async (type: "correct" | "incorrect" | "edited") => {
    if (!session || submitted) return;

    setSubmitted(true);
    setStatus("Saving response...");

    try {
      const form = new URLSearchParams();
      form.append("user_id", String(userId));
      form.append("base", session.base || session.audio_url);
      form.append("original_text", session.text_blob || "");
      form.append("edited_text", editedText);
      form.append("status", type);

      const endpoint =
        type === "correct"
          ? "/correct"
          : type === "incorrect"
          ? "/incorrect"
          : "/edit";

      await axios.post(`${API_BASE}${endpoint}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      setStatus("✅ Saved. Loading next...");
      await loadSession("next");
    } catch (err) {
      console.error("Submit failed", err);
      setStatus("❌ Failed to save response");
      setSubmitted(false);
    }
  };

  /* ---------------- UI ---------------- */
  if (loading && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-700">Loading Verification Page.</p>
      </div>
    );
  }

  const disableActions = submitted || loading;

  const btn =
    "px-10 py-3 rounded-full font-semibold transition transform active:scale-95 hover:scale-105";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header />

      <div className="flex flex-1">
        <aside className="w-64 bg-[#00863F] text-white">
          <Sidebar active="verification" />
        </aside>

        <main className="flex-1 p-8">
          {status && (
            <div className="mb-4 text-green-600 text-sm">{status}</div>
          )}

          <div className="bg-white rounded-3xl p-8 shadow">
            <div className="flex text-black justify-between mb-6">
              <h2 className="text-xl font-semibold">
                Question {session.completed_tasks + 1}
              </h2>
              <span className="text-sm text-slate-500">
                Tasks {session.completed_tasks} / {session.total_tasks}
              </span>
            </div>

            {/* AUDIO */}
            <audio controls className="w-full mb-6" src={session.audio_url} />

            {/* TEXT */}
            <TransliterationTextBox
              value={editedText}
              onChange={setEditedText}
              isEditing={isEditing && !disableActions}
              lang="te-t-i0-und"
            />

            {/* ACTIONS */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                disabled={disableActions}
                onClick={() => submit("correct")}
                className={`${btn} ${
                  disableActions
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                ✓ Correct
              </button>

              <button
                disabled={disableActions}
                onClick={() => submit("incorrect")}
                className={`${btn} ${
                  disableActions
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                ✕ Incorrect
              </button>

              <button
                disabled={disableActions}
                onClick={() =>
                  isEditing ? submit("edited") : setIsEditing(true)
                }
                className={`${btn} ${
                  disableActions
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                ✎ {isEditing ? "Save" : "Edit"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserVerificationPage;
