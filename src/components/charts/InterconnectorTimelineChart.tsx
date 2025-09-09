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

export function InterconnectorTimelineChart({ data }: { data: FlowRecord[] }) {
  const formatted = data.map((d, index) => {
    const date = new Date(d.SETTLEMENT_DATE);
    const hours = Math.floor((d.SETTLEMENT_PERIOD - 1) / 2);
    const minutes = ((d.SETTLEMENT_PERIOD - 1) % 2) * 30;
    date.setHours(hours, minutes, 0, 0);
    
    return {
      time: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
      fullTime: `${date.getMonth() + 1}/${date.getDate()} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
      // Individual cables
      IFA: d.IFA_FLOW || 0,
      IFA2: d.IFA2_FLOW || 0,
      ElecLink: d.ELECLINK_FLOW || 0,
      BritNed: d.BRITNED_FLOW || 0,
      Nemo: d.NEMO_FLOW || 0,
      NorthSeaLink: d.NSL_FLOW || 0,
      Viking: d.VIKING_FLOW || 0,
      Greenlink: d.GREENLINK_FLOW || 0,
      // Country totals
      France: (d.IFA_FLOW || 0) + (d.IFA2_FLOW || 0) + (d.ELECLINK_FLOW || 0),
      Netherlands: d.BRITNED_FLOW || 0,
      Belgium: d.NEMO_FLOW || 0,
      Norway: d.NSL_FLOW || 0,
      Denmark: d.VIKING_FLOW || 0,
      Ireland: d.GREENLINK_FLOW || 0,
      // Net total
      NetFlow: (d.IFA_FLOW || 0) + (d.IFA2_FLOW || 0) + (d.ELECLINK_FLOW || 0) + 
               (d.BRITNED_FLOW || 0) + (d.NEMO_FLOW || 0) + (d.NSL_FLOW || 0) + 
               (d.VIKING_FLOW || 0) + (d.GREENLINK_FLOW || 0),
      index: index
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg max-w-xs">
          <p className="text-card-foreground font-medium mb-3">{`Time: ${data.fullTime}`}</p>
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-card-foreground">🇫🇷 France ({Math.round(data.France)}MW)</div>
            <div className="pl-4 space-y-1 text-xs">
              <div>IFA: {Math.round(data.IFA)}MW</div>
              <div>IFA2: {Math.round(data.IFA2)}MW</div>
              <div>ElecLink: {Math.round(data.ElecLink)}MW</div>
            </div>
            
            <div className="text-sm">🇳🇱 Netherlands: {Math.round(data.Netherlands)}MW</div>
            <div className="text-sm">🇧🇪 Belgium: {Math.round(data.Belgium)}MW</div>
            <div className="text-sm">🇳🇴 Norway: {Math.round(data.Norway)}MW</div>
            <div className="text-sm">🇩🇰 Denmark: {Math.round(data.Denmark)}MW</div>
            
            <div className="pt-2 border-t border-border">
              <div className="text-sm font-medium">
                Net Flow: {data.NetFlow > 0 ? '+' : ''}{Math.round(data.NetFlow)}MW
              </div>
              <div className="text-xs text-muted-foreground">
                {data.NetFlow > 0 ? 'GB Importing' : 'GB Exporting'}
              </div>
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
          
          {/* Zero reference line */}
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.5)" strokeDasharray="2 2" />
          
          {/* Country lines with distinct colors */}
          <Line 
            type="monotone" 
            dataKey="France" 
            name="🇫🇷 France" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="Netherlands" 
            name="🇳🇱 Netherlands" 
            stroke="#f97316" 
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="Belgium" 
            name="🇧🇪 Belgium" 
            stroke="#eab308" 
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="Norway" 
            name="🇳🇴 Norway" 
            stroke="#6366f1" 
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="Denmark" 
            name="🇩🇰 Denmark" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="Ireland" 
            name="🇮🇪 Ireland" 
            stroke="#22c55e" 
            strokeWidth={1}
            dot={false}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
