"use client";

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

interface TooltipPayloadEntry {
  dataKey: string;
  value: number;
  color: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

type BalanceRecord = {
  SETTLEMENT_DATE: string;
  SETTLEMENT_PERIOD: number;
  ND: number;
  TSD: number;
  EMBEDDED_WIND_GENERATION: number;
  EMBEDDED_SOLAR_GENERATION: number;
  PUMP_STORAGE_PUMPING: number;
  SCOTTISH_TRANSFER: number;
};

export function GridBalanceChart({ data }: { data: BalanceRecord[] }) {
  const formatted = data.slice(0, 48).map((d) => {
    const totalEmbedded = d.EMBEDDED_WIND_GENERATION + d.EMBEDDED_SOLAR_GENERATION;
    const netDemand = d.ND - totalEmbedded;
    const balancingLoad = d.PUMP_STORAGE_PUMPING;
    
    return {
      time: `${String(d.SETTLEMENT_PERIOD).padStart(2, '0')}:${d.SETTLEMENT_PERIOD % 2 === 1 ? '00' : '30'}`,
      period: d.SETTLEMENT_PERIOD,
      grossDemand: d.ND,
      netDemand: netDemand,
      embeddedGen: totalEmbedded,
      balancing: balancingLoad,
      scottishFlow: d.SCOTTISH_TRANSFER,
      // Grid stress indicator (higher when demand is high and embedded gen is low)
      gridStress: Math.max(0, (d.ND - totalEmbedded) / 1000), // Normalize to 0-50 range
    };
  });

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-card-foreground font-medium mb-2">{`Time: ${label}`}</p>
          {payload.map((entry: TooltipPayloadEntry, index: number) => {
            let unit = 'MW';
            let description = '';
            
            switch(entry.dataKey) {
              case 'grossDemand':
                description = 'Total Demand';
                break;
              case 'netDemand':
                description = 'Net Demand (after embedded)';
                break;
              case 'embeddedGen':
                description = 'Embedded Generation';
                break;
              case 'balancing':
                description = 'Pump Storage';
                break;
              case 'scottishFlow':
                description = 'Scottish Transfer';
                break;
              case 'gridStress':
                description = 'Grid Stress Indicator';
                unit = '';
                break;
            }
            
            return (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {`${description}: ${Math.round(entry.value)} ${unit}`}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={formatted} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id="colorEmbedded" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgba(34, 197, 94, 0.8)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="rgba(34, 197, 94, 0.8)" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgba(239, 68, 68, 0.8)" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="rgba(239, 68, 68, 0.8)" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            stroke="white" 
            tickLine={false} 
            axisLine={{ stroke: "rgba(255,255,255,0.25)" }}
            interval="preserveStartEnd"
          />
          <YAxis 
            yAxisId="demand"
            stroke="white" 
            tickLine={false} 
            axisLine={{ stroke: "rgba(255,255,255,0.25)" }}
            label={{ value: 'MW', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'white' } }}
          />
          <YAxis 
            yAxisId="stress"
            orientation="right"
            stroke="rgba(239, 68, 68, 0.8)" 
            tickLine={false} 
            axisLine={{ stroke: "rgba(239, 68, 68, 0.25)" }}
            label={{ value: 'Stress', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: 'rgba(239, 68, 68, 0.8)' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: "#fff" }} />
          
          {/* Background area for embedded generation */}
          <Area 
            yAxisId="demand"
            type="monotone" 
            dataKey="embeddedGen" 
            name="Embedded Generation" 
            stroke="rgba(34, 197, 94, 0.8)" 
            fill="url(#colorEmbedded)" 
            strokeWidth={1}
          />
          
          {/* Main demand lines */}
          <Line 
            yAxisId="demand"
            type="monotone" 
            dataKey="grossDemand" 
            name="Gross Demand" 
            stroke="rgb(88, 30, 192)" 
            strokeWidth={3}
            dot={false}
          />
          <Line 
            yAxisId="demand"
            type="monotone" 
            dataKey="netDemand" 
            name="Net Demand" 
            stroke="rgba(88, 30, 192, 0.6)" 
            strokeWidth={2}
            dot={false}
          />
          
          {/* Grid stress indicator */}
          <Area 
            yAxisId="stress"
            type="monotone" 
            dataKey="gridStress" 
            name="Grid Stress" 
            stroke="rgba(239, 68, 68, 0.8)" 
            fill="url(#colorStress)" 
            strokeWidth={2}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
