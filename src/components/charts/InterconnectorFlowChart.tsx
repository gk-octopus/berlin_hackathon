"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";

type FlowRecord = {
  SETTLEMENT_DATE: string;
  SETTLEMENT_PERIOD: number;
  IFA_FLOW: number;      // France
  IFA2_FLOW: number;     // France
  BRITNED_FLOW: number;  // Netherlands
  NEMO_FLOW: number;     // Belgium
  NSL_FLOW: number;      // Norway
  ELECLINK_FLOW: number; // France
  VIKING_FLOW: number;   // Denmark
  GREENLINK_FLOW: number; // Ireland
};

export function InterconnectorFlowChart({ data }: { data: FlowRecord[] }) {
  const formatted = data.slice(0, 24).map((d) => ({
    time: `${String(d.SETTLEMENT_PERIOD).padStart(2, '0')}:${d.SETTLEMENT_PERIOD % 2 === 1 ? '00' : '30'}`,
    period: d.SETTLEMENT_PERIOD,
    // Positive = Import to GB, Negative = Export from GB
    France: (d.IFA_FLOW + d.IFA2_FLOW + d.ELECLINK_FLOW),
    Netherlands: d.BRITNED_FLOW,
    Belgium: d.NEMO_FLOW,
    Norway: d.NSL_FLOW,
    Denmark: d.VIKING_FLOW,
    Ireland: d.GREENLINK_FLOW,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-card-foreground font-medium mb-2">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value > 0 ? '+' : ''}${entry.value} MW`}
              <span className="text-muted-foreground ml-1">
                {entry.value > 0 ? '(Import)' : '(Export)'}
              </span>
            </p>
          ))}
          <p className="text-xs text-muted-foreground mt-1">
            Positive = Import to GB, Negative = Export from GB
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            stroke="white" 
            tickLine={false} 
            axisLine={{ stroke: "rgba(255,255,255,0.25)" }}
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
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.5)" strokeDasharray="2 2" />
          
          <Bar dataKey="France" name="France" fill="rgb(88, 30, 192)" />
          <Bar dataKey="Netherlands" name="Netherlands" fill="rgba(88, 30, 192, 0.8)" />
          <Bar dataKey="Belgium" name="Belgium" fill="rgba(88, 30, 192, 0.6)" />
          <Bar dataKey="Norway" name="Norway" fill="rgba(88, 30, 192, 0.4)" />
          <Bar dataKey="Denmark" name="Denmark" fill="rgba(88, 30, 192, 0.3)" />
          <Bar dataKey="Ireland" name="Ireland" fill="rgba(88, 30, 192, 0.2)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
