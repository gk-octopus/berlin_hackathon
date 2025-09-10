"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LabelList,
} from "recharts";

type CsvRow = {
  delivery_from: string;
  price: number;
};

const CSV_URL = 'https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/negative_prices.csv';

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) return [];
  // Find header
  const header = lines[0].split(',').map(h => h.trim());
  const idxDeliveryFrom = header.findIndex(h => h.toLowerCase().includes('delivery_from'));
  const idxPrice = header.findIndex(h => h.toLowerCase() === 'price');
  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const parts = line.split(',');
    const delivery_from = parts[idxDeliveryFrom]?.trim();
    const priceStr = parts[idxPrice]?.trim();
    const price = priceStr ? Number(priceStr) : NaN;
    if (!delivery_from || Number.isNaN(price)) continue;
    rows.push({ delivery_from, price });
  }
  return rows;
}

export function NegativePriceChart() {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(CSV_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const text = await res.text();
        const parsed = parseCsv(text).filter(r => r.price < 0);
        if (!cancelled) setRows(parsed);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load CSV');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const { series, total2024 } = useMemo(() => {
    const dayKey = (d: Date) => {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const da = String(d.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${da}`;
    };
    // Monthly aggregation for 2024
    const monthly: number[] = Array.from({ length: 12 }, () => 0);
    let total2024 = 0;
    rows.forEach(r => {
      const dt = new Date(r.delivery_from);
      if (dt.getUTCFullYear() === 2024) {
        monthly[dt.getUTCMonth()] += 1;
        total2024 += 1;
      }
    });
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const series = monthNames.map((name, i) => ({ month: name, count: monthly[i] }));
    return { series, total2024 };
  }, [rows]);

  if (loading) {
    return <div className="h-64 w-full flex items-center justify-center text-sm text-muted-foreground">Loading negative price data…</div>;
  }
  if (error) {
    return <div className="h-64 w-full flex items-center justify-center text-sm text-red-400">{error}</div>;
  }

  return (
    <div className="w-full space-y-4">
      {/* Title/Stat */}
      <div className="text-sm">
        <span className="font-semibold text-foreground">2024 negative day-ahead price periods:</span>
        <span className="ml-2 font-medium text-primary">{total2024}</span>
        <span className="ml-2 text-muted-foreground">(DA prices can be very low — even negative)</span>
      </div>

      {/* Monthly bar chart for 2024 */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              stroke="white"
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.25)" }}
              interval={0}
            />
            <YAxis
              stroke="white"
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.25)" }}
              label={{ value: 'Negative periods per month', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'white' } }}
            />
            <Tooltip contentStyle={{ background: "rgb(21, 1, 69)", border: "1px solid rgba(88,30,192,0.35)", color: "#fff" }} />
            <Legend wrapperStyle={{ color: "#fff" }} />
            <Bar dataKey="count" name="Negative periods" fill="#ef4444" radius={[4,4,0,0]}>
              <LabelList dataKey="count" position="top" fill="#fff" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default NegativePriceChart;


