"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemandChart } from "@/components/charts/DemandChart";
import { EmbeddedGenChart } from "@/components/charts/EmbeddedGenChart";
import { InterconnectorTimelineChart } from "@/components/charts/InterconnectorTimelineChart";
import { MajorCablesTimelineChart } from "@/components/charts/MajorCablesTimelineChart";
import { DetailedCountryFlows } from "@/components/charts/DetailedCountryFlows";
import { EvidenceBasedConstraints } from "@/components/constraint-indicators/EvidenceBasedConstraints";
import { TimeRangeToggle } from "@/components/ui/TimeRangeToggle";
import { DemandDifferenceChart } from "@/components/charts/DemandDifferenceChart";

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
      return { records: [] } as any;
    }
    
    const json = await res.json();
    console.log('NESO data received, records count:', json.result?.records?.length || 0);
    return json.result as { records: any[] };
  } catch (error) {
    console.error('Error fetching NESO data:', error);
    return { records: [] } as any;
  }
}

export default function ChartsPage() {
  const [timeRange, setTimeRange] = useState<"day" | "week">("day");
  const [records, setRecords] = useState<any[]>([]);
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
        ]) as { records: any[] };
        
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
  const latest = records[0] || {};
  const currentDemand = latest.ND || 0;
  const totalInterconnectorFlow = (latest.IFA_FLOW || 0) + (latest.IFA2_FLOW || 0) + 
    (latest.BRITNED_FLOW || 0) + (latest.NEMO_FLOW || 0) + (latest.NSL_FLOW || 0) + 
    (latest.ELECLINK_FLOW || 0) + (latest.VIKING_FLOW || 0) + (latest.GREENLINK_FLOW || 0);
  const embeddedGeneration = (latest.EMBEDDED_WIND_GENERATION || 0) + (latest.EMBEDDED_SOLAR_GENERATION || 0);
  const gridUtilization = Math.round((currentDemand / 45000) * 100); // Assuming 45GW peak capacity

  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          GB-EU Interconnector Dashboard
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Real-time monitoring of electricity flows between Great Britain and European neighbors
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
            <DemandChart data={records as any} />
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
            <EmbeddedGenChart data={records as any} />
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
            <DemandDifferenceChart data={records as any} />
          </CardContent>
        </Card>
      </div>

      {/* Historical Interconnector Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              Country Trading Timeline
            </CardTitle>
            <CardDescription>
              {timeRange === "day" ? "Last 24 hours" : "Last 7 days"} - How flows changed by country over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InterconnectorTimelineChart data={records as any} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              Individual Cable Timeline
            </CardTitle>
            <CardDescription>
              {timeRange === "day" ? "Last 24 hours" : "Last 7 days"} - Each physical interconnector cable
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MajorCablesTimelineChart data={records as any} />
          </CardContent>
        </Card>
      </div>

      {/* Current Status Overview */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              Current Interconnector Status
            </CardTitle>
            <CardDescription>Right now - detailed breakdown by country and cable</CardDescription>
          </CardHeader>
          <CardContent>
            <DetailedCountryFlows data={records as any} />
          </CardContent>
        </Card>
      </div>

      {/* Constraint Prediction Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 bg-primary rounded-full"></div>
                Constraint Predictions
              </CardTitle>
              <CardDescription>
                AI-powered predictions of grid constraints based on interconnector flows and market signals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EvidenceBasedConstraints data={records as any} />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 bg-primary rounded-full"></div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="default">
                🚨 Alert Operations
              </Button>
              <Button className="w-full" variant="outline">
                📊 Export Data
              </Button>
              <Button className="w-full" variant="outline">
                📈 Historical Analysis
              </Button>
              <Button className="w-full" variant="outline">
                ⚙️ Configure Alerts
              </Button>
              
              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium mb-2">Data Sources</h4>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    NESO API - Live
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    ENTSO-E - 15min delay
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Market Data - Live
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
