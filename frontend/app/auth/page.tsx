"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { useAuth } from "@/context/auth-context";

export default function AuthPage() {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && token) {
      router.replace("/dashboard");
    }
  }, [loading, token, router]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Access
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Sign in to Jaspers AI
        </h1>
        <p className="mt-2 text-slate-500">
          Use your assessment account or register a brand new one.
        </p>
      </div>
      <AuthCard />
    </div>
  );
}

