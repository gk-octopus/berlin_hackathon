"use client";

import { useState, useEffect } from "react";
import { TimeRangeToggle } from "@/components/ui/TimeRangeToggle";
import { InterconnectorMap } from "@/components/map/InterconnectorMap";

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

export default function StoryPage() {
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

  return (
    <div className="h-[calc(100vh-4rem)]"> {/* Account for navbar height */}
      {/* Time Range Toggle Above Map */}
      <div className="absolute top-20 left-2.5 z-20 space-y-4"> {/* 10px spacing from navbar and left */}
        <TimeRangeToggle 
          selectedRange={timeRange} 
          onRangeChange={setTimeRange} 
        />
        
        {/* Map Legend */}
        <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg">
          <h3 className="font-medium text-foreground mb-3">Interconnector Flows</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-1 bg-blue-400 rounded"></div>
              <span className="text-sm text-foreground">Import to GB</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-1 bg-orange-400 rounded"></div>
              <span className="text-sm text-foreground">Export from GB</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-1 bg-gray-400 rounded"></div>
              <span className="text-sm text-foreground">No significant flow</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
              Line thickness = utilization
            </div>
          </div>
        </div>
      </div>
      
      {/* Full-Screen Map */}
      <div className="h-full w-full">
        <InterconnectorMap data={records as any} />
      </div>
    </div>
  );
}
