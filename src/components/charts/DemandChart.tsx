"use client";

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

type DemandRecord = {
  SETTLEMENT_DATE: string;
  SETTLEMENT_PERIOD: number;
  ND: number; // National Demand (MW)
  TSD: number; // Transmission System Demand (MW)
};

export function DemandChart({ data, timeRange = 'day' }: { data: DemandRecord[]; timeRange?: 'day' | 'all' }) {
  const formatted = data.map((d, index) => {
    // Create proper date-time from settlement data
    const date = new Date(d.SETTLEMENT_DATE);
    const hours = Math.floor((d.SETTLEMENT_PERIOD - 1) / 2);
    const minutes = ((d.SETTLEMENT_PERIOD - 1) % 2) * 30;
    date.setHours(hours, minutes, 0, 0);
    
    return {
      label: `${date.getMonth() + 1}/${date.getDate()} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
      shortLabel: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
      ND: d.ND,
      TSD: d.TSD,
      date: date,
      dayIndex: Math.floor(index / 48),
    };
  });

  // Use only the last 24 hours up to the latest completed 30-min interval
  const now = new Date();
  const latestValid = new Date(now);
  latestValid.setMinutes(now.getMinutes() >= 30 ? 30 : 0, 0, 0);

  const filtered = formatted
    .filter((d) => d.date <= latestValid)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  const last24h = timeRange === 'day' ? filtered.slice(-48) : filtered;

  const startLabel = last24h[0]?.date;
  const endLabel = last24h[last24h.length - 1]?.date;
  const fmt = (d?: Date) => d ? d.toLocaleString('en-GB', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) : '';

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={last24h} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
          <XAxis 
            dataKey="shortLabel" 
            stroke="white" 
            tickLine={false} 
            axisLine={{ stroke: "rgba(255,255,255,0.25)" }}
            interval={Math.max(1, Math.floor(last24h.length / 12))} // Show ~12 labels max
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis stroke="white" tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.25)" }} />
          <Tooltip
            contentStyle={{ background: "rgb(21, 1, 69)", border: "1px solid rgba(88,30,192,0.35)", color: "#fff" }}
            labelStyle={{ color: "#fff" }}
          />
          <Legend wrapperStyle={{ color: "#fff" }} />
          <Line type="monotone" dataKey="ND" name="GB Demand" stroke="rgb(88, 30, 192)" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="TSD" name="Total Load" stroke="rgba(88, 30, 192, 0.6)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 text-xs text-muted-foreground">
        Last 24 hours (up to {fmt(endLabel)}). Values accurate to the last 30 minutes. Range: {fmt(startLabel)} – {fmt(endLabel)}.
      </div>
    </div>
  );
}


