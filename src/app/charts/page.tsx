"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DemandChart } from "@/components/charts/DemandChart";
import { EmbeddedGenChart } from "@/components/charts/EmbeddedGenChart";
import { InterconnectorTimelineChart } from "@/components/charts/InterconnectorTimelineChart";
import { MajorCablesTimelineChart } from "@/components/charts/MajorCablesTimelineChart";
import { DetailedCountryFlows } from "@/components/charts/DetailedCountryFlows";
import { EvidenceBasedConstraints } from "@/components/constraint-indicators/EvidenceBasedConstraints";
import { TimeRangeToggle } from "@/components/ui/TimeRangeToggle";
import { DemandDifferenceChart } from "@/components/charts/DemandDifferenceChart";

interface NesoRecord {
  SETTLEMENT_DATE: string;
  SETTLEMENT_PERIOD: number;
  ND: number;
  TSD: number;
  IFA_FLOW: number;
  IFA2_FLOW: number;
  BRITNED_FLOW: number;
  NEMO_FLOW: number;
  NSL_FLOW: number;
  ELECLINK_FLOW: number;
  VIKING_FLOW: number;
  GREENLINK_FLOW: number;
  EMBEDDED_WIND_GENERATION: number;
  EMBEDDED_SOLAR_GENERATION: number;
  SCOTTISH_TRANSFER: number;
  [key: string]: any; // For any other properties we might have missed
}

interface NesoApiResponse {
  records: NesoRecord[];
}

async function fetchNeso(limit: number = 96) {
  try {
    console.log('Fetching NESO data with limit:', limit);
    const url = `https://api.neso.energy/api/3/action/datastore_search?resource_id=b2bde559-3455-4021-b179-dfe60c0337b0&limit=${limit}`;
    const res = await fetch(url, { 
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    console.log('NESO API response status:', res.status);
    
    if (!res.ok) {
      console.error('NESO API error:', res.status, res.statusText);
      return { records: [] };
    }
    
    const json = await res.json();
    console.log('NESO data received, records count:', json.result?.records?.length || 0);
    return json.result as NesoApiResponse;
  } catch (error) {
    console.error('Error fetching NESO data:', error);
    return { records: [] };
  }
}

export default function ChartsPage() {
  const [timeRange, setTimeRange] = useState<"day" | "week">("day");
  const [records, setRecords] = useState<NesoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const limit = timeRange === "day" ? 48 : 336; // 48 for 1 day, 336 for 7 days
        
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        );
        
        const { records: data } = await Promise.race([
          fetchNeso(limit),
          timeoutPromise
        ]) as NesoApiResponse;
        
        setRecords(data || []);
        
        if (!data || data.length === 0) {
          setError('No data received from NESO API');
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        // Set some mock data so the app still works
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4 text-primary">⚡</div>
          <p className="text-foreground mb-4">Loading energy data...</p>
          {error && (
            <div className="bg-card border border-border rounded-lg p-4 mb-4">
              <p className="text-sm text-muted-foreground mb-2">Having trouble loading data:</p>
              <p className="text-sm text-red-400 mb-4">{error}</p>
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Check browser console for details
          </div>
        </div>
      </div>
    );
  }

  // Calculate key metrics from the data
  const latest = records[records.length - 1];
  const current = latest
    ? {
        France: (latest.IFA_FLOW || 0) + (latest.IFA2_FLOW || 0) + (latest.ELECLINK_FLOW || 0),
        Netherlands: latest.BRITNED_FLOW || 0,
        Belgium: latest.NEMO_FLOW || 0,
        Norway: latest.NSL_FLOW || 0,
        Denmark: latest.VIKING_FLOW || 0,
        Ireland: latest.GREENLINK_FLOW || 0,
      }
    : {
        France: 0,
        Netherlands: 0,
        Belgium: 0,
        Norway: 0,
        Denmark: 0,
        Ireland: 0,
      };
  const countryOrder: Array<keyof typeof current> = [
    'France',
    'Netherlands',
    'Belgium',
    'Norway',
    'Denmark',
    'Ireland',
  ];
  const flag: Record<string, string> = {
    France: '🇫🇷',
    Netherlands: '🇳🇱',
    Belgium: '🇧🇪',
    Norway: '🇳🇴',
    Denmark: '🇩🇰',
    Ireland: '🇮🇪',
  };

  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          The UK Energy Divide
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Real-time monitoring of electricity flows between Great Britain and European neighbours
        </p>
      </div>

      {/* Time Range Control */}
      <div className="flex justify-center mb-8">
        <TimeRangeToggle 
          selectedRange={timeRange} 
          onRangeChange={setTimeRange} 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* GB Demand Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              GB Electricity Demand
            </CardTitle>
            <CardDescription>
              {timeRange === "day" ? "Last 24 hours" : "Last 7 days"} - How much power Great Britain is using
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DemandChart data={records} />
          </CardContent>
        </Card>

        {/* Renewables Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              Renewable Generation
            </CardTitle>
            <CardDescription>
              {timeRange === "day" ? "Last 24 hours" : "Last 7 days"} - Wind and solar power across GB
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmbeddedGenChart data={records} />
          </CardContent>
        </Card>
      </div>

      {/* Current cross-border flows (simple tiles) */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              Current cross-border flows
            </CardTitle>
            <CardDescription>Live net flow per country (GB-positive = importing)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {countryOrder.map((c) => {
                const v = Math.round(current[c]);
                const importing = v > 0;
                const magnitude = Math.abs(v);
                return (
                  <div key={c} className="rounded-lg border border-border bg-card/60 p-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{flag[c]} {c}</div>
                      <div className="text-xs text-muted-foreground">{importing ? 'Importing from' : 'Exporting to'} {c}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${importing ? 'text-green-400' : 'text-amber-400'}`}>
                        {importing ? '⬇️' : '⬆️'} {magnitude} MW
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demand Difference Analysis */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              Extra System Load
            </CardTitle>
            <CardDescription>
              The difference between total system demand and base GB demand - shows pumping, exports, and losses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DemandDifferenceChart data={records} />
          </CardContent>
        </Card>
      </div>

      {/* Per-country timelines - removed per request */}

      {/* Current Status Overview - removed per request */}

      {/* Constraint Prediction Section - removed per request */}
    </main>
  );
}
