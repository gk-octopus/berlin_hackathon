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
  ReferenceLine,
} from "recharts";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      time: string;
      fullTime: string;
      IFA: number;
      IFA2: number;
      BritNed: number;
      Nemo: number;
      NSL: number;
      Viking: number;
    };
  }>;
}

type FlowRecord = {
  SETTLEMENT_DATE: string;
  SETTLEMENT_PERIOD: number;
  IFA_FLOW: number;
  IFA2_FLOW: number;
  BRITNED_FLOW: number;
  NEMO_FLOW: number;
  NSL_FLOW: number;
  ELECLINK_FLOW: number;
  VIKING_FLOW: number;
  GREENLINK_FLOW: number;
};

export function MajorCablesTimelineChart({ data }: { data: FlowRecord[] }) {
  const formatted = data.map((d, index) => {
    const date = new Date(d.SETTLEMENT_DATE);
    const hours = Math.floor((d.SETTLEMENT_PERIOD - 1) / 2);
    const minutes = ((d.SETTLEMENT_PERIOD - 1) % 2) * 30;
    date.setHours(hours, minutes, 0, 0);
    
    return {
      time: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
      fullTime: `${date.getMonth() + 1}/${date.getDate()} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
      // Major cables only
      IFA: d.IFA_FLOW || 0,
      IFA2: d.IFA2_FLOW || 0,
      BritNed: d.BRITNED_FLOW || 0,
      Nemo: d.NEMO_FLOW || 0,
      NSL: d.NSL_FLOW || 0,
      Viking: d.VIKING_FLOW || 0,
      index: index
    };
  });

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="text-card-foreground font-medium mb-3">{`Time: ${data.fullTime}`}</p>
          
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-blue-400">IFA (2GW)</div>
                <div>{Math.round(data.IFA)}MW</div>
              </div>
              <div>
                <div className="font-medium text-blue-300">IFA2 (1GW)</div>
                <div>{Math.round(data.IFA2)}MW</div>
              </div>
              <div>
                <div className="font-medium text-orange-400">BritNed (1GW)</div>
                <div>{Math.round(data.BritNed)}MW</div>
              </div>
              <div>
                <div className="font-medium text-yellow-400">Nemo (1GW)</div>
                <div>{Math.round(data.Nemo)}MW</div>
              </div>
              <div>
                <div className="font-medium text-indigo-400">NSL (1.4GW)</div>
                <div>{Math.round(data.NSL)}MW</div>
              </div>
              <div>
                <div className="font-medium text-red-400">Viking (1.4GW)</div>
                <div>{Math.round(data.Viking)}MW</div>
              </div>
            </div>
            
            <div className="pt-2 border-t border-border text-xs text-muted-foreground">
              Positive = Import to GB • Negative = Export from GB
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            stroke="white" 
            tickLine={false} 
            axisLine={{ stroke: "rgba(255,255,255,0.25)" }}
            interval={Math.max(1, Math.floor(formatted.length / 10))}
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
          
          {/* Capacity reference lines */}
          <ReferenceLine y={2000} stroke="#3b82f6" strokeDasharray="3 3" strokeOpacity={0.5} />
          <ReferenceLine y={-2000} stroke="#3b82f6" strokeDasharray="3 3" strokeOpacity={0.5} />
          <ReferenceLine y={1400} stroke="#6366f1" strokeDasharray="3 3" strokeOpacity={0.5} />
          <ReferenceLine y={-1400} stroke="#6366f1" strokeDasharray="3 3" strokeOpacity={0.5} />
          <ReferenceLine y={1000} stroke="#f97316" strokeDasharray="3 3" strokeOpacity={0.5} />
          <ReferenceLine y={-1000} stroke="#f97316" strokeDasharray="3 3" strokeOpacity={0.5} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.5)" strokeDasharray="2 2" />
          
          {/* Individual cable lines */}
          <Line 
            type="monotone" 
            dataKey="IFA" 
            name="IFA (2000MW)" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="IFA2" 
            name="IFA2 (1000MW)" 
            stroke="#60a5fa" 
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="BritNed" 
            name="BritNed (1000MW)" 
            stroke="#f97316" 
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="Nemo" 
            name="Nemo (1000MW)" 
            stroke="#eab308" 
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="NSL" 
            name="North Sea Link (1400MW)" 
            stroke="#6366f1" 
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="Viking" 
            name="Viking Link (1400MW)" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
