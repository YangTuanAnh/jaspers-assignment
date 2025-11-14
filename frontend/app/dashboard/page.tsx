"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { portfolioApi } from "@/lib/api";
import { PortfolioPayload } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { SummaryCards } from "@/components/summary-cards";
import { HoldingsTable } from "@/components/holdings-table";
import { RequireAuth } from "@/components/require-auth";

export default function DashboardPage() {
  const { token, loading } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioPayload | null>(null);
  const [error, setError] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }
    const fetchData = async () => {
      setIsFetching(true);
      setError("");
      try {
        const data = await portfolioApi.get(token);
        setPortfolio(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load portfolio");
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, [token]);

  const handleSync = async () => {
    if (!token) return;
    setIsSyncing(true);
    setError("");
    try {
      const data = await portfolioApi.sync(token);
      setPortfolio(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sync portfolio");
    } finally {
      setIsSyncing(false);
    }
  };

  if (!loading && !token) {
    return (
      <RequireAuth
        title="Authentication required"
        description="Login or register to view your portfolio dashboard."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Portfolio overview"
        description="Review your Alpaca cash balance and open positions."
        action={
          <button
            onClick={handleSync}
            disabled={!token || isSyncing}
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSyncing ? "Syncing..." : "Sync portfolio"}
          </button>
        }
      />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {isFetching && !portfolio ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading portfolio...
        </div>
      ) : null}

      {portfolio ? (
        <>
          <SummaryCards summary={portfolio.summary} />
          <HoldingsTable holdings={portfolio.holdings} />
        </>
      ) : null}
    </div>
  );
}

