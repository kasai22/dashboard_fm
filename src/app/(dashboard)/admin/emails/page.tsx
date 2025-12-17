"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios, { AxiosRequestConfig } from "axios";
import Header from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";
import { getCookie } from "cookies-next";
const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 10;

interface AllowedEmail {
  id?: number;
  email?: string;
  uploaded_at?: string;
}
interface RegisteredUser {
  id: number;
  name: string;
  college_id: string;
  college_name: string;
  mobile_number: string;
  email: string;
  score: number;
}

interface RegisteredUsersResponse {
  users: RegisteredUser[];
  page?: number;
  total?: number;
}

interface AllowedEmailResponse {
  items?: AllowedEmail[];
  page?: number;
  total?: number;
}

type UploadMode = "manual" | "bulk";

export default function AdminEmailsPage() {
  const [emails, setEmails] = useState<AllowedEmail[]>([]);
  const [filtered, setFiltered] = useState<AllowedEmail[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const [statusMsg, setStatusMsg] = useState("");
  const [search, setSearch] = useState("");
  const [uploadMode, setUploadMode] = useState<UploadMode>("manual");

  const [token, setToken] = useState<string | null>(null);
  const [authConfig, setAuthConfig] = useState<AxiosRequestConfig>({});

  useEffect(() => {
    const cookieToken = getCookie("jwt");
    setToken(cookieToken ? String(cookieToken) : null);
  }, []);

  // 📩 Fetch allowed emails from backend
  // 📩 Fetch registered users (used as "emails" table source)
  const fetchEmails = async (pageNum = 1) => {
    if (!token) return;
    setLoading(true);

    try {
      const res = await axios.get<RegisteredUsersResponse>(
        `${API_BASE}/admin/users/registered`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { page: pageNum },
        }
      );

      // backend returns { users: [ { id, email, ... } ] }
      const items: AllowedEmail[] =
        res.data.users?.map((u) => ({
          id: u.id,
          email: u.email,
          // there is no uploaded_at in this endpoint,
          // so keep it undefined for now (your UI already
          // shows a placeholder when it's missing)
          uploaded_at: undefined,
        })) ?? [];

      setEmails(items);
      setFiltered(items);
      setPage(res.data.page ?? pageNum);
    } catch (err) {
      console.error("Failed fetching emails from /admin/users/registered", err);
      setStatusMsg("Failed to fetch emails");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchEmails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // 🔍 Search filter (client side)
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(emails);
      setPage(1);
      return;
    }
    const q = search.toLowerCase().trim();
    const f = emails.filter((e) => (e.email ?? "").toLowerCase().includes(q));
    setFiltered(f);
    setPage(1);
  }, [search, emails]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
    [filtered]
  );

  const currentItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  // 🗑 Delete an email
  const handleDelete = async (userId?: number) => {
    if (!userId) return;

    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`${API_BASE}/admin/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStatusMsg("User deleted successfully");
      await fetchEmails(page);
    } catch (err) {
      console.error("User delete failed", err);
      setStatusMsg("Failed to delete user");
    }
  };

  // 📝 Manual email upload
  const handleManualSubmit = async () => {
    const lines = manualInput
      .split(/\r?\n|,/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (!lines.length) {
      setStatusMsg("Enter at least one email");
      return;
    }

    const form = new FormData();
    form.append("emails_text", lines.join("\n"));

    try {
      await axios.post(`${API_BASE}/admin/upload_emails`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setStatusMsg("Uploaded successfully");
      setShowModal(false);
      setManualInput("");
      setFile(null);
      await fetchEmails(page);
    } catch (err) {
      console.error("Upload failed", err);
      setStatusMsg("Upload failed");
    }
  };

  // 📂 File upload
  const handleFileSubmit = async () => {
    if (!file) {
      setStatusMsg("Choose a CSV/Excel file first");
      return;
    }
    const form = new FormData();
    form.append("file", file);
    try {
      await axios.post(`${API_BASE}/admin/upload_emails`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setStatusMsg("File uploaded");
      setShowModal(false);
      setManualInput("");
      setFile(null);
      await fetchEmails(page);
    } catch (err) {
      console.error("File upload failed", err);
      setStatusMsg("File upload failed");
    }
  };

  const openModal = () => {
    setShowModal(true);
    setManualInput("");
    setFile(null);
    setStatusMsg("");
  };

  const closeModal = () => {
    setShowModal(false);
    setManualInput("");
    setFile(null);
    setStatusMsg("");
  };

  // 🧱 UI
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header showProfile={false} />
      <div className="flex gap-6">
        {/* LEFT: Admin sidebar */}
        <AdminSidebar active="emails" />

        {/* RIGHT: Main content */}
        <main className="flex-1 pt-8">
          {/* Title + actions */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">
              Email Management
            </h2>
            {/* <button
              onClick={openModal}
              className="rounded-full bg-[#00863F] px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#007339]"
            >
              + Add New
            </button> */}
          </div>

          {/* Search bar */}
          <div className="mb-4 flex items-center gap-3">
            <div className="relative w-full max-w-md">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search by Email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#00863F] focus:ring-1 focus:ring-[#00863F]"
              />
            </div>
          </div>

          {/* Table card */}
          <div className="rounded-3xl bg-white shadow-sm border border-slate-100">
            {loading ? (
              <div className="py-16 text-center text-sm text-slate-500">
                Loading...
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600">
                        <th className="px-6 py-3 font-medium">S.No</th>
                        <th className="px-6 py-3 font-medium">Email ID</th>
                        <th className="px-6 py-3 font-medium">Uploaded On</th>
                        <th className="px-6 py-3 font-medium text-right">
                          Action Taken
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-10 text-center text-slate-500"
                          >
                            No emails found.
                          </td>
                        </tr>
                      ) : (
                        currentItems.map((e, i) => (
                          <tr
                            key={e.id ?? i}
                            className="border-b last:border-b-0 hover:bg-slate-50"
                          >
                            <td className="px-6 py-3 text-slate-700">
                              {(page - 1) * PAGE_SIZE + i + 1}
                            </td>
                            <td className="px-6 py-3 text-slate-800">
                              {e.email ?? "-"}
                            </td>
                            <td className="px-6 py-3 text-slate-600">
                              {e.uploaded_at
                                ? new Date(e.uploaded_at).toLocaleString()
                                : "dd/mm/yyyy hh:mm"}
                            </td>
                            <td className="px-6 py-3 text-right">
                              <button
                                onClick={() => handleDelete(e.id)}
                                className="text-sm font-medium text-red-500 hover:text-red-600"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination row */}
                <div className="flex items-center justify-between px-6 py-4 text-xs text-slate-500">
                  <div>
                    1 - {Math.min(filtered.length, PAGE_SIZE)} of{" "}
                    {filtered.length || 0} items
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const newPage = Math.max(1, page - 1);
                        setPage(newPage);
                      }}
                      disabled={page === 1}
                      className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => {
                        const newPage = Math.min(totalPages, page + 1);
                        setPage(newPage);
                      }}
                      disabled={page >= totalPages}
                      className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {statusMsg && (
            <p className="mt-3 text-sm text-slate-600">{statusMsg}</p>
          )}
        </main>
      </div>

      {/* Modal overlay */}
      {showModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/30"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute right-4 top-3 text-xl text-slate-400 hover:text-slate-600"
              onClick={closeModal}
            >
              ×
            </button>

            <h3 className="mb-1 text-lg font-semibold text-slate-900">
              Upload Emails
            </h3>
            <p className="mb-4 text-xs text-slate-500">
              How would you like to upload?
            </p>

            <div className="mb-4 space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="uploadType"
                  checked={uploadMode === "manual"}
                  onChange={() => setUploadMode("manual")}
                  className="h-4 w-4 accent-[#00863F]"
                />
                <span>Add Emails Manually</span>
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-900">
                <input
                  type="radio"
                  name="uploadType"
                  checked={uploadMode === "bulk"}
                  onChange={() => setUploadMode("bulk")}
                  className="h-4 w-4 accent-[#00863F]"
                />
                <span>Bulk Upload via Excel</span>
              </label>
            </div>

            {uploadMode === "manual" ? (
              <div className="mb-4">
                <textarea
                  placeholder="Enter emails separated by commas or new lines"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="h-32 w-full rounded-xl border text-gray-800 border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-[#00863F] focus:ring-1 focus:ring-[#00863F]"
                />
              </div>
            ) : (
              <div className="mb-4">
                <div
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-xs text-slate-500"
                  onClick={() =>
                    (
                      document.getElementById(
                        "fileInput"
                      ) as HTMLInputElement | null
                    )?.click()
                  }
                >
                  <p>Drag and drop files here</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    File format: .CSV, .XLS, .XLSX
                  </p>
                  <button className="mt-3 rounded-full border border-slate-300 px-4 py-1 text-xs font-medium text-slate-700">
                    Browse
                  </button>
                  <input
                    id="fileInput"
                    type="file"
                    accept=".csv,.xls,.xlsx"
                    hidden
                    onChange={(e) =>
                      setFile(e.target.files?.[0] ? e.target.files[0] : null)
                    }
                  />
                </div>
                {file && (
                  <p className="mt-2 text-xs text-slate-600">
                    Selected: <span className="font-medium">{file.name}</span>
                  </p>
                )}
              </div>
            )}

            <button
              className="mt-2 w-full rounded-full bg-[#00863F] py-2 text-sm font-semibold text-white hover:bg-[#007339]"
              onClick={() => {
                if (uploadMode === "bulk") handleFileSubmit();
                else handleManualSubmit();
              }}
            >
              Submit
            </button>

            {statusMsg && (
              <div className="mt-2 text-xs text-slate-500">{statusMsg}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
