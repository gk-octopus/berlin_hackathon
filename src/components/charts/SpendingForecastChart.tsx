"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

type AnyRecord = Record<string, any>;

const NESO_SPEND_URL =
  "https://api.neso.energy/api/3/action/datastore_search?resource_id=6afe1c2b-6d70-4e76-8e74-0952b0a2beab&limit=10000";

export function SpendingForecastChart() {
  const [rows, setRows] = useState<AnyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(NESO_SPEND_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json = await res.json();
        const parsed = (json.result?.records || []) as AnyRecord[];
        if (!cancelled) setRows(parsed);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const { series, ytdTotal, cutoffLabel } = useMemo(() => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const monthTotals: number[] = Array.from({ length: 12 }, () => 0);

    // Identify date and cost fields dynamically to be robust to schema changes
    const detectDate = (rec: AnyRecord): Date | null => {
      const candidateKeys = [
        "Date",
        "date",
        "Settlement Date",
        "Settlement date",
        "Settlement Date (UTC)",
      ];
      for (const key of candidateKeys) {
        if (key in rec) {
          const parsed = new Date(rec[key]);
          if (!isNaN(parsed.getTime())) return parsed;
        }
      }
      // Fallback: try to find first key that looks like a date string
      for (const [k, v] of Object.entries(rec)) {
        if (typeof v === "string" && /\d{4}-\d{2}-\d{2}/.test(v)) {
          const parsed = new Date(v);
          if (!isNaN(parsed.getTime())) return parsed;
        }
      }
      return null;
    };

    const extractTotal = (rec: AnyRecord): number => {
      // Prefer explicit total if present
      const totalKey = Object.keys(rec).find((k) => k.toLowerCase().includes("total") && k.toLowerCase().includes("cost"));
      if (totalKey) return Number(rec[totalKey]) || 0;
      // Else sum all fields that look like individual cost components
      let sum = 0;
      for (const [k, v] of Object.entries(rec)) {
        if (k.toLowerCase().includes("cost")) {
          const num = Number(v);
          if (!isNaN(num)) sum += num;
        }
      }
      return sum;
    };

    rows.forEach((r) => {
      const d = detectDate(r);
      if (!d || d.getUTCFullYear() !== year) return;
      const m = d.getUTCMonth();
      monthTotals[m] += extractTotal(r);
    });

    // Determine cutoff at the end of the last fully completed month
    const nowIdx = now.getUTCMonth();
    const cutoffIdx = Math.max(0, nowIdx - 1);
    const actualMonths = monthTotals.slice(0, cutoffIdx + 1);
    const ytdTotalRaw = actualMonths.reduce((a, b) => a + b, 0);
    const monthlyAvg = actualMonths.length > 0 ? ytdTotalRaw / actualMonths.length : 0;

    // Build cumulative series: cumulative actual up to current month
    const cumulativeActual: Array<number | null> = Array.from({ length: 12 }, () => null);
    let running = 0;
    for (let i = 0; i <= cutoffIdx; i++) {
      running += monthTotals[i];
      cumulativeActual[i] = Math.round(running);
    }

    // Projection: extend cumulative using monthly average for remaining months
    const cumulativeProjected: Array<number | null> = Array.from({ length: 12 }, () => null);
    // Seed the projection at the cutoff point so the dashed line starts at the last actual value
    cumulativeProjected[cutoffIdx] = Math.round(running);
    let projRunning = running;
    for (let i = cutoffIdx + 1; i < 12; i++) {
      projRunning += monthlyAvg;
      cumulativeProjected[i] = Math.round(projRunning);
    }

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const series = monthNames.map((name, i) => ({
      month: name,
      actual: cumulativeActual[i],
      projected: cumulativeProjected[i],
    }));

    return { series, ytdTotal: Math.round(running), cutoffLabel: monthNames[cutoffIdx] };
  }, [rows]);

  if (loading) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-sm text-muted-foreground">
        Loading spend data…
      </div>
    );
  }
  if (error) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-sm text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      <div className="text-sm">
        <span className="font-semibold text-foreground">Cumulative YTD balancing + constraint spend:</span>
        <span className="ml-2 font-medium text-primary">£{(ytdTotal / 1_000_000).toFixed(1)}m</span>
        <span className="ml-2 text-muted-foreground">(through end of {cutoffLabel}; projection extends cumulative using YTD monthly average)</span>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke="white" tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.25)" }} interval={0} />
            <YAxis
              stroke="white"
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.25)" }}
              tickFormatter={(v) => `£${Math.round(v / 1_000_000)}m`}
            />
            <Tooltip
              formatter={(v: any) => [`£${(Number(v) / 1_000_000).toFixed(2)}m`, "Cumulative spend"]}
              contentStyle={{ background: "rgb(21, 1, 69)", border: "1px solid rgba(88,30,192,0.35)", color: "#fff" }}
            />
            <Legend wrapperStyle={{ color: "#fff" }} />

            <Line type="monotone" dataKey="actual" name="Cumulative actual" stroke="#8b5cf6" strokeWidth={2} dot={false} connectNulls={false} />
            <Line type="monotone" dataKey="projected" name="Cumulative projection" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" connectNulls={true} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="text-xs text-muted-foreground">Source: NESO</div>
    </div>
  );
}

export default SpendingForecastChart;


