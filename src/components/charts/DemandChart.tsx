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

export function DemandChart({ data }: { data: DemandRecord[] }) {
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

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
          <XAxis 
            dataKey="shortLabel" 
            stroke="white" 
            tickLine={false} 
            axisLine={{ stroke: "rgba(255,255,255,0.25)" }}
            interval={Math.max(1, Math.floor(formatted.length / 12))} // Show ~12 labels max
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
    </div>
  );
}


