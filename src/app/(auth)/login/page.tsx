"use client";

import { useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import { AuthSwitch } from "@/components/auth/AuthSwitch";
import { LoginPanel } from "@/components/auth/LoginPanel";
import RegisterPanel from "@/components/auth/RegisterPanel";

export default function AuthPage() {
  const [active, setActive] = useState<"login" | "register">("login");

  return (
    <AuthLayout>
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl text-black font-bold">
          {active === "login" ? "Login to" : "Register on"}{" "}
          <span className="text-[#9C6400]">Rythuvaani</span>
        </h1>

        <AuthSwitch active={active} setActive={setActive} />

        <div className="mt-6">
          {active === "login" ? <LoginPanel /> : <RegisterPanel />}
        </div>
      </div>
    </AuthLayout>
  );
}
