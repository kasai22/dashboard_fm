"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { setCookie } from "cookies-next";

declare global {
  interface Window {
    google: any;
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// Load Google Script
function loadGsiScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();

    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject("Google script failed");
    document.head.appendChild(s);
  });
}

// Decode Google ID Token
function decodeJwt(token: string) {
  try {
    const [, payload] = token.split(".");
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export default function GoogleSignInBtn() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function init() {
      await loadGsiScript();

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        { theme: "outline", size: "large" }
      );

      setStatus("ready");
    }

    init();
  }, []);

  async function handleGoogleResponse(response: any) {
    try {
      const id_token = response.credential;
      if (!id_token) return;

      const res = await axios.post(`${API_BASE}/google-login`, {
        token: id_token,
      });

      const jwt = res.data?.access_token;
      if (!jwt) return alert("Server did not return token");

      setCookie("jwt", jwt, {
        secure: false,
        sameSite: "strict",
        path: "/user/dashboard",
        maxAge: 60 * 60 * 24 * 7,
      });

      setCookie("role", "User", {
        secure: false,
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      window.location.href = "/user/dashboard";
    } catch (err) {
      alert("Google login failed");
    }
  }

  return (
    <div>
      <div id="googleSignInDiv" />
      {status === "loading" && <p>Loading Google…</p>}
    </div>
  );
}
