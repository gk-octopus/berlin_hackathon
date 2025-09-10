"use client";

import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LabelList } from "recharts";

type YearPoint = { year: number; national: number; zonal: number; savings: number; pct: number };

const raw: Array<{ year: number; national: number; zonal: number }> = [
  { year: 2030, national: 98.4, zonal: 90.7 },
  { year: 2035, national: 95.8, zonal: 88.5 },
  { year: 2040, national: 93.9, zonal: 88.1 },
  { year: 2045, national: 82.3, zonal: 76.4 },
  { year: 2050, national: 77.6, zonal: 67.4 },
];

const data: YearPoint[] = raw.map((d) => ({
  ...d,
  savings: +(d.national - d.zonal).toFixed(1),
  pct: +(((d.national - d.zonal) / d.national) * 100).toFixed(1),
}));

export function ZonalSavingsBarChart() {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
          <XAxis dataKey="year" stroke="#fff" tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.25)" }} />
          <YAxis stroke="#fff" tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.25)" }} tickFormatter={(v) => `£${v}`} />
          <Tooltip
            formatter={(v: any, name: any, props: any) => {
              const val = Number(v);
              return [`£${val.toFixed(1)}/MWh`, name];
            }}
            labelFormatter={(label) => `${label}`}
            contentStyle={{ background: "rgb(21, 1, 69)", border: "1px solid rgba(88,30,192,0.35)", color: "#fff" }}
          />
          <Legend wrapperStyle={{ color: "#fff" }} />

          {/* Bars: National (orange) and Zonal (green) */}
          <Bar dataKey="national" name="National" fill="#f97316" radius={[4, 4, 0, 0]} />
          <Bar dataKey="zonal" name="Zonal" fill="#22c55e" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="savings" position="top" formatter={(v: any) => `−£${Number(v).toFixed(1)}`} fill="#c4b5fd" />
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-2 text-xs text-muted-foreground">Source: FTI/Ofgem scenarios (illustrative values)</div>
    </div>
  );
}

export default ZonalSavingsBarChart;


