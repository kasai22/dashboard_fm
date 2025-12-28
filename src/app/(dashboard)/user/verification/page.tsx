"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { getCookie, deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/Sidebar";
import TransliterationTextBox from "@/components/TransliterationTextBox";
import Header from "@/components/Header";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const UserVerificationPage = () => {
  const router = useRouter();

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
        router.replace("/login");
        return;
      }

      const payload = JSON.parse(atob(t.split(".")[1]));
      setToken(t);
      setUserId(payload.id);
    } catch {
      deleteCookie("jwt");
      router.replace("/login");
    }
  }, [router]);

  /* ---------------- LOAD SESSION ---------------- */
  const loadSession = async () => {
    if (!token || !userId) return;

    setLoading(true);
    setStatus("");

    try {
      const res = await axios.get(`${API_BASE}/start_session/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSession(res.data);
      setEditedText(res.data.text_blob || "");
      setIsEditing(false);
      setSubmitted(false);
    } catch {
      setStatus("❌ Failed to load question");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && userId) loadSession();
  }, [token, userId]);

  /* ---------------- SUBMIT ---------------- */
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
      await loadSession();
    } catch {
      setStatus("❌ Failed to save response");
      setSubmitted(false);
    }
  };

  if (loading && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading verification…
      </div>
    );
  }

  const disableActions = loading || submitted;
  const btnBase =
    "px-6 py-3 rounded-full font-semibold transition active:scale-95";

  return (
    <>
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <div className="hidden md:block">
          <Header showProfile={true} />
        </div>
        <div className="min-h-screen bg-slate-100 md:flex">
          {/* SIDEBAR (mobile + desktop) */}
          <Sidebar active="verification" />

          {/* MAIN */}
          <main className="flex-1 px-4 md:px-8 py-6 md:py-8">
            {status && (
              <div className="mb-4 text-sm text-green-600">{status}</div>
            )}

            <div className="bg-white rounded-3xl shadow p-6 md:p-8">
              {/* HEADER */}
              <div className="flex justify-between mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-black">
                  Question {session.completed_tasks + 1}
                </h2>
                <span className="text-xs md:text-sm text-slate-500">
                  {session.completed_tasks + 1} / {session.total_tasks}
                </span>
              </div>

              {/* AUDIO */}
              <audio controls className="w-full mb-6" src={session.audio_url} />

              {/* TEXT BOX */}
              <TransliterationTextBox
                value={editedText}
                onChange={setEditedText}
                isEditing={isEditing && !disableActions}
                lang="te-t-i0-und"
              />

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                <button
                  disabled={disableActions}
                  onClick={() => submit("correct")}
                  className={`${btnBase} ${
                    disableActions
                      ? "bg-gray-300"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  ✓ Correct
                </button>

                <button
                  disabled={disableActions}
                  onClick={() => submit("incorrect")}
                  className={`${btnBase} ${
                    disableActions
                      ? "bg-gray-300"
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
                  className={`${btnBase} ${
                    disableActions
                      ? "bg-gray-300"
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
    </>
  );
};

export default UserVerificationPage;
