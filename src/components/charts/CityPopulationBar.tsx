"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList, Cell } from "recharts";

type City = { name: string; population: number };

const cities: City[] = [
  { name: "London", population: 7556900 },
  { name: "Birmingham", population: 984333 },
  { name: "Liverpool", population: 864122 },
  { name: "Nottingham", population: 729977 },
  { name: "Sheffield", population: 685368 },
  { name: "Bristol", population: 617280 },
  { name: "Glasgow", population: 591620 },
  { name: "Leicester", population: 508916 },
  { name: "Edinburgh", population: 464990 },
  { name: "Leeds", population: 455123 },
  { name: "Cardiff", population: 447287 },
  // Removed by request: Manchester, Stoke-on-Trent, Cardiff
  // { name: "Manchester", population: 395515 },
  // { name: "Stoke-on-Trent", population: 372775 },
  { name: "Coventry", population: 359262 },
];

const data = cities
  .map(c => ({ ...c, popM: c.population / 1_000_000 }))
  .sort((a, b) => b.population - a.population);

export function CityPopulationBar() {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, bottom: 4, left: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" horizontal vertical={false} />
          <XAxis type="number" stroke="#fff" tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.25)" }} tickFormatter={(v) => `${Number(v).toFixed(1)}m`} />
          <YAxis type="category" dataKey="name" width={160} stroke="#fff" tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.25)" }} />
          <Tooltip formatter={(v: any) => [`${Number(v).toFixed(1)}m`, "Population"]} contentStyle={{ background: "rgb(21,1,69)", border: "1px solid rgba(88,30,192,0.35)", color: "#fff" }} />
          <Bar dataKey="popM" name="Population" radius={[10, 10, 10, 10]}>
            {data.map((d, idx) => {
              const scottish = d.name === 'Glasgow' || d.name === 'Edinburgh';
              return <Cell key={`cell-${idx}`} fill={scottish ? '#a855f7' : '#1d4ed8'} />;
            })}
            <LabelList dataKey="popM" position="right" formatter={(v: any) => `${Number(v).toFixed(1)}m`} fill="#fff" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CityPopulationBar;
