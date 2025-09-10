"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LabelList } from "recharts";

type Project = {
  name: string;
  start: number;
  plannedEnd: number;
  actualEnd: number;
  status: "Delayed" | "Unaffected";
};

const projects: Project[] = [
  {
    name: "EGL1 (Torness–Hawthorn Pit)",
    start: 2024,
    plannedEnd: 2027,
    actualEnd: 2030,
    status: "Delayed",
  },
  {
    name: "EGL2 (Peterhead–Drax)",
    start: 2024,
    plannedEnd: 2029,
    actualEnd: 2029,
    status: "Unaffected",
  },
];

const minYear = Math.min(...projects.map((p) => p.start), 2024);
const maxYear = Math.max(...projects.map((p) => p.actualEnd), 2031);

const data = projects.map((p) => ({
  name: p.name,
  offset: p.start - minYear,
  planned: p.plannedEnd - p.start,
  delay: Math.max(0, p.actualEnd - p.plannedEnd),
  actualEnd: p.actualEnd,
  status: p.status,
}));

export function EglTimelineChart() {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 24, bottom: 4, left: 0 }}>
          <defs>
            <pattern id="delayStripes" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
              <rect width="6" height="6" fill="#ef4444" opacity="0.85" />
              <line x1="0" y1="0" x2="0" y2="6" stroke="#7f1d1d" strokeWidth="2" />
            </pattern>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis
            type="number"
            domain={[0, maxYear - minYear]}
            tickFormatter={(v) => `${minYear + Number(v)}`}
            stroke="#fff"
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.25)" }}
          />
          <YAxis type="category" dataKey="name" width={210} stroke="#fff" tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.25)" }} />
          <Tooltip
            formatter={(v: any, name: string, props: any) => {
              if (name === "planned") return [`${Number(v)} yrs`, "Planned duration"];
              if (name === "delay") return [`${Number(v)} yrs`, "Delay"];
              return [String(v), name];
            }}
            labelFormatter={(_, p: any) => p?.payload?.name}
            contentStyle={{ background: "rgb(21, 1, 69)", border: "1px solid rgba(88,30,192,0.35)", color: "#fff" }}
          />
          <Legend wrapperStyle={{ color: "#fff" }} />

          {/* Offset bar to position the timeline at the correct year */}
          <Bar dataKey="offset" stackId="a" fill="transparent" legendType="none" />
          {/* Planned window */}
          <Bar dataKey="planned" stackId="a" name="Planned" fill="#22c55e" />
          {/* Delay window */}
          <Bar dataKey="delay" stackId="a" name="Delay" fill="url(#delayStripes)">
            <LabelList
              dataKey="actualEnd"
              position="right"
              formatter={(v: any) => `${v}`}
              fill="#fff"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 text-xs text-muted-foreground">Bars show years from start → planned completion (green) plus slippage (red).</div>
    </div>
  );
}

export default EglTimelineChart;


