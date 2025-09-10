"use client";

import { useEffect, useMemo, useState } from "react";
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

type GeoJSONFeature = {
  type: string;
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  } | null;
  properties: Record<string, any>;
};

type GeoJSONData = {
  type: string;
  features: GeoJSONFeature[];
};

// Use the same dataset as the map for consistency
const REPD_GEOJSON_URL = 'https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/repd-q2-jul-2025.geojson';

type BarDatum = { region: string; capacityGW: number; capacityBaseGW?: number; excessGW?: number };

export function WindComparisonBarChart({ referenceGW, referenceLabel, highlightExcess }: { referenceGW?: number; referenceLabel?: string; highlightExcess?: boolean }) {
  const [repd, setRepd] = useState<GeoJSONData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(REPD_GEOJSON_URL);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json = await res.json();
        if (!cancelled) setRepd(json as GeoJSONData);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load REPD data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const data: BarDatum[] = useMemo(() => {
    if (!repd?.features) return [];

    // Mirror the StoryMap filtering logic as closely as possible
    const filtered = repd.features.filter((feature: GeoJSONFeature) => {
      const props = feature.properties || {};
      const capacity = parseFloat(props['Installed Capacity (MWelec)']) || 0;
      const technologyType = (props['Technology Type'] || '').toLowerCase();
      const status = (props['Development Status (short)'] || '').toLowerCase();
      const country = (props['Country'] || '').toLowerCase();

      const isOnshoreWind = technologyType === 'wind onshore';
      const isOperationalOrUC = status === 'operational' || status === 'under construction';
      const hasCoordinates = !!feature.geometry && !!(feature as any).geometry.coordinates;
      const isNotNorthernIreland = country !== 'northern ireland';

      // Include all capacities (including < 25MW) for total sum; ignore zero/negative
      const hasPositiveCapacity = capacity > 0;

      return isOnshoreWind && isOperationalOrUC && hasPositiveCapacity && hasCoordinates && isNotNorthernIreland;
    });

    // Aggregate installed capacity (MW) and convert to GW for display
    let scotlandMW = 0;
    let englandMW = 0;

    filtered.forEach(f => {
      const props = f.properties || {};
      const country = (props['Country'] || '').toLowerCase();
      const capacityMW = parseFloat(props['Installed Capacity (MWelec)']) || 0;
      if (country.includes('scotland')) {
        scotlandMW += capacityMW;
      } else if (country.includes('england')) {
        englandMW += capacityMW;
      }
    });

    const scotGW = parseFloat((scotlandMW / 1000).toFixed(2));
    const engGW = parseFloat((englandMW / 1000).toFixed(2));
    if (highlightExcess && typeof referenceGW === 'number') {
      const base = Math.min(scotGW, referenceGW);
      const excess = Math.max(0, scotGW - referenceGW);
      return [
        { region: 'Scotland', capacityGW: scotGW, capacityBaseGW: base, excessGW: parseFloat(excess.toFixed(2)) },
        { region: 'England', capacityGW: engGW, capacityBaseGW: engGW, excessGW: 0 },
      ];
    }
    return [
      { region: 'Scotland', capacityGW: scotGW },
      { region: 'England', capacityGW: engGW },
    ];
  }, [repd]);

  if (loading) {
    return <div className="h-64 w-full flex items-center justify-center text-sm text-muted-foreground">Loading wind data…</div>;
  }

  if (error) {
    return <div className="h-64 w-full flex items-center justify-center text-sm text-red-400">{error}</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
          <XAxis
            dataKey="region"
            stroke="white"
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.25)" }}
          />
          <YAxis
            stroke="white"
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.25)" }}
            label={{ value: 'GW (installed capacity)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'white' } }}
          />
          <Tooltip
            contentStyle={{ background: "rgb(21, 1, 69)", border: "1px solid rgba(88,30,192,0.35)", color: "#fff" }}
            labelStyle={{ color: "#fff" }}
            formatter={(value: any) => [value, 'GW']}
          />
          <Legend wrapperStyle={{ color: "#fff" }} />
          {typeof referenceGW === 'number' && (
            <ReferenceLine y={referenceGW} stroke="#ef4444" strokeDasharray="4 4" label={{ value: referenceLabel || `${referenceGW} GW`, position: 'insideTopRight', fill: '#fff' }} />
          )}
          {highlightExcess && typeof referenceGW === 'number' ? (
            <>
              <Bar dataKey="capacityBaseGW" stackId="a" name="Capacity up to B6 limit" fill="rgb(88, 30, 192)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="excessGW" stackId="a" name="Excess (curtailed risk)" fill="#ef4444" className="b6-excess-blink" />
              <style>{`
                @keyframes blinkExcess { 0%{opacity:0.6;} 50%{opacity:1;} 100%{opacity:0.6;} }
                .b6-excess-blink path { animation: blinkExcess 1.2s ease-in-out infinite; }
              `}</style>
            </>
          ) : (
            <Bar dataKey="capacityGW" name="Operational + UC Onshore Capacity (GW)" fill="rgb(88, 30, 192)" radius={[6, 6, 0, 0]} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WindComparisonBarChart;


