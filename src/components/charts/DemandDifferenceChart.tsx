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

type DemandRecord = {
  SETTLEMENT_DATE: string;
  SETTLEMENT_PERIOD: number;
  ND: number; // National Demand (MW)
  TSD: number; // Transmission System Demand (MW)
};

export function DemandDifferenceChart({ data }: { data: DemandRecord[] }) {
  const formatted = data.map((d, index) => {
    // Create proper date-time from settlement data
    const date = new Date(d.SETTLEMENT_DATE);
    const hours = Math.floor((d.SETTLEMENT_PERIOD - 1) / 2);
    const minutes = ((d.SETTLEMENT_PERIOD - 1) % 2) * 30;
    date.setHours(hours, minutes, 0, 0);
    
    const difference = d.TSD - d.ND; // The gap between the two lines
    
    return {
      label: `${date.getMonth() + 1}/${date.getDate()} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
      shortLabel: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
      difference: difference,
      percentage: ((difference / d.ND) * 100),
      ND: d.ND,
      TSD: d.TSD,
      date: date,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-card-foreground font-medium mb-2">{`Time: ${label}`}</p>
          <p className="text-sm text-primary">
            {`Extra Load: ${Math.round(data.difference)} MW`}
          </p>
          <p className="text-xs text-muted-foreground">
            {`${Math.round(data.percentage)}% above base demand`}
          </p>
          <div className="mt-2 pt-2 border-t border-border text-xs">
            <p className="text-muted-foreground">Base Demand: {Math.round(data.ND).toLocaleString()} MW</p>
            <p className="text-muted-foreground">Total Load: {Math.round(data.TSD).toLocaleString()} MW</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formatted} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id="colorDifference" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(88, 30, 192)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="rgb(88, 30, 192)" stopOpacity={0.2}/>
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
          <YAxis 
            stroke="white" 
            tickLine={false} 
            axisLine={{ stroke: "rgba(255,255,255,0.25)" }}
            label={{ value: 'MW', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'white' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: "#fff" }} />
          
          <Area 
            type="monotone" 
            dataKey="difference" 
            name="Extra System Load" 
            stroke="rgb(88, 30, 192)" 
            fill="url(#colorDifference)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
