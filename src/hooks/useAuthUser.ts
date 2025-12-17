"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";

const API_BASE = "http://127.0.0.1:8000";

export interface User {
  id: number;
  full_name: string;
  email: string;
  college_name: string;
  college_id: string;
  mobile_number: string;
  gender?: string | null;
  age?: number | null;
  dialect?: string | null;
  mode?: string | null;
}

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = getCookie("jwt") as string | undefined;
        if (!token) return;

        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload.id;

        const res = await axios.get(`${API_BASE}/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);
      } catch (err) {
        console.error("Failed to load user profile", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return { user, loading };
}
