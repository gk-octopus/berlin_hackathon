"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

type GenRecord = {
  SETTLEMENT_DATE: string;
  SETTLEMENT_PERIOD: number;
  EMBEDDED_WIND_GENERATION: number; // MW
  EMBEDDED_SOLAR_GENERATION: number; // MW
};

export function EmbeddedGenChart({ data }: { data: GenRecord[] }) {
  const formatted = data.map((d, index) => {
    // Create proper date-time from settlement data
    const date = new Date(d.SETTLEMENT_DATE);
    const hours = Math.floor((d.SETTLEMENT_PERIOD - 1) / 2);
    const minutes = ((d.SETTLEMENT_PERIOD - 1) % 2) * 30;
    date.setHours(hours, minutes, 0, 0);
    
    return {
      label: `${date.getMonth() + 1}/${date.getDate()} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
      shortLabel: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
      wind: d.EMBEDDED_WIND_GENERATION,
      solar: d.EMBEDDED_SOLAR_GENERATION,
      date: date,
      dayIndex: Math.floor(index / 48), // Which day (0, 1, 2...)
    };
  });

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formatted} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id="colorWind" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(88, 30, 192)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="rgb(88, 30, 192)" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgba(88, 30, 192, 0.6)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="rgba(88, 30, 192, 0.6)" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
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
          <Area type="monotone" dataKey="wind" name="Wind Power" stroke="rgb(88, 30, 192)" fill="url(#colorWind)" strokeWidth={2} />
          <Area type="monotone" dataKey="solar" name="Solar Power" stroke="rgba(88, 30, 192, 0.6)" fill="url(#colorSolar)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}


