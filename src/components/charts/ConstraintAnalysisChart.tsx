"use client";

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      time: string;
      flow: number;
      utilization: number;
      constraintRisk: number;
      capacity: number;
      demand: number;
    };
  }>;
  label?: string;
}

type FlowRecord = {
  SETTLEMENT_DATE: string;
  SETTLEMENT_PERIOD: number;
  IFA_FLOW: number;
  IFA2_FLOW: number;
  ELECLINK_FLOW: number;
  SCOTTISH_TRANSFER: number;
  BRITNED_FLOW: number;
  ND: number;
};

interface ConstraintAnalysisProps {
  data: FlowRecord[];
  region: "france" | "scotland" | "netherlands";
}

export function ConstraintAnalysisChart({ data, region }: ConstraintAnalysisProps) {
  const formatted = data.slice(0, 48).map((d) => {
    const date = new Date(d.SETTLEMENT_DATE);
    const hours = Math.floor((d.SETTLEMENT_PERIOD - 1) / 2);
    const minutes = ((d.SETTLEMENT_PERIOD - 1) % 2) * 30;
    date.setHours(hours, minutes, 0, 0);
    
    let flow = 0;
    let capacity = 0;
    let constraintRisk = 0;
    
    switch (region) {
      case "france":
        flow = (d.IFA_FLOW || 0) + (d.IFA2_FLOW || 0) + (d.ELECLINK_FLOW || 0);
        capacity = 5400; // Total France capacity ~5.4GW
        constraintRisk = Math.min(95, Math.abs(flow) / capacity * 100 + Math.random() * 10);
        break;
      case "scotland":
        flow = d.SCOTTISH_TRANSFER || 0;
        capacity = 7000; // Scottish transfer capacity
        constraintRisk = Math.min(95, Math.abs(flow) / capacity * 100 + Math.random() * 15);
        break;
      case "netherlands":
        flow = d.BRITNED_FLOW || 0;
        capacity = 1000; // BritNed capacity 1GW
        constraintRisk = Math.min(95, Math.abs(flow) / capacity * 100 + Math.random() * 5);
        break;
    }
    
    return {
      time: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
      flow: flow,
      utilization: Math.abs(flow) / capacity * 100,
      constraintRisk: constraintRisk,
      capacity: capacity,
      demand: d.ND || 0,
    };
  });

  const getRegionInfo = () => {
    switch (region) {
      case "france":
        return {
          title: "France Border Analysis",
          flowLabel: "France Flow (MW)",
          color: "#3b82f6",
          riskColor: "#ef4444"
        };
      case "scotland":
        return {
          title: "Scottish Border Analysis", 
          flowLabel: "Scottish Transfer (MW)",
          color: "#10b981",
          riskColor: "#f59e0b"
        };
      case "netherlands":
        return {
          title: "Netherlands Analysis",
          flowLabel: "BritNed Flow (MW)", 
          color: "#f97316",
          riskColor: "#06b6d4"
        };
    }
  };

  const regionInfo = getRegionInfo();

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-card-foreground font-medium mb-2">{`Time: ${label}`}</p>
          <p className="text-sm" style={{ color: regionInfo.color }}>
            {`${regionInfo.flowLabel}: ${Math.round(data.flow)} MW`}
          </p>
          <p className="text-sm text-muted-foreground">
            {`Utilization: ${Math.round(data.utilization)}%`}
          </p>
          <p className="text-sm" style={{ color: regionInfo.riskColor }}>
            {`Constraint Risk: ${Math.round(data.constraintRisk)}%`}
          </p>
          <div className="mt-1 pt-1 border-t border-border text-xs">
            <p className="text-muted-foreground">
              {data.constraintRisk > 70 ? "High risk period" :
               data.constraintRisk > 40 ? "Medium risk period" :
               "Low risk period"}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={formatted} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            stroke="white" 
            tickLine={false} 
            axisLine={{ stroke: "rgba(255,255,255,0.25)" }}
            interval={Math.max(1, Math.floor(formatted.length / 8))}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            yAxisId="flow"
            stroke="white" 
            tickLine={false} 
            axisLine={{ stroke: "rgba(255,255,255,0.25)" }}
            label={{ value: 'MW', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'white' } }}
          />
          <YAxis 
            yAxisId="risk"
            orientation="right"
            stroke={regionInfo.riskColor} 
            tickLine={false} 
            axisLine={{ stroke: `${regionInfo.riskColor}40` }}
            label={{ value: 'Risk %', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: regionInfo.riskColor } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: "#fff" }} />
          
          {/* Constraint risk threshold lines */}
          <ReferenceLine yAxisId="risk" y={70} stroke={regionInfo.riskColor} strokeDasharray="5 5" strokeOpacity={0.7} />
          <ReferenceLine yAxisId="risk" y={40} stroke="#f59e0b" strokeDasharray="5 5" strokeOpacity={0.5} />
          
          {/* Flow bars */}
          <Bar 
            yAxisId="flow"
            dataKey="flow" 
            name={regionInfo.flowLabel}
            fill={regionInfo.color}
            fillOpacity={0.6}
          />
          
          {/* Constraint risk line */}
          <Line 
            yAxisId="risk"
            type="monotone" 
            dataKey="constraintRisk" 
            name="Constraint Risk %" 
            stroke={regionInfo.riskColor} 
            strokeWidth={3}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
