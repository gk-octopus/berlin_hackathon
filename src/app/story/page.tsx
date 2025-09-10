"use client";

import { useState, useEffect, useRef } from "react";
import { StoryMap, StoryMapHandle } from "@/components/story/StoryMap";
import { StoryPanel } from "@/components/story/StoryPanel";
import { storySteps } from "@/components/story/StoryData";

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

export default function StoryPage() {
  const [records, setRecords] = useState<NesoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoProgressTimer, setAutoProgressTimer] = useState<NodeJS.Timeout | null>(null);
  const mapRef = useRef<StoryMapHandle | null>(null);
  const mapWrapperRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const currentStep = storySteps[currentStepIndex];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch enough history to render full "yesterday" (00:00–23:30) and recent data
        const limit = 144; // 3 days (~72 hours) safety window
        
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
  }, []);

  // Auto-progress when playing
  useEffect(() => {
    if (isPlaying && currentStepIndex < storySteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, currentStep.duration + 2000); // Add 2 seconds for reading
      
      setAutoProgressTimer(timer);
      return () => clearTimeout(timer);
    } else if (isPlaying && currentStepIndex === storySteps.length - 1) {
      // Stop playing at the end
      setIsPlaying(false);
    }
  }, [isPlaying, currentStepIndex, currentStep.duration]);

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < storySteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setIsPlaying(false);
    }
  };


  const handleStepSelect = (stepId: number) => {
    setCurrentStepIndex(stepId);
    setIsPlaying(false);
    if (autoProgressTimer) {
      clearTimeout(autoProgressTimer);
      setAutoProgressTimer(null);
    }
  };

  const handleStepComplete = () => {
    // Called when map animation completes
    // Could trigger additional effects here
  };

  // Debug: log sizes and current step
  useEffect(() => {
    const logSizes = () => {
      const panelEl = panelRef.current;
      const mapEl = mapWrapperRef.current;
      const panelSize = panelEl ? { width: panelEl.clientWidth, height: panelEl.clientHeight } : null;
      const mapSize = mapEl ? { width: mapEl.clientWidth, height: mapEl.clientHeight } : null;
      console.log('[Story Debug]', {
        step: currentStepIndex + 1,
        totalSteps: storySteps.length,
        panelSize,
        mapSize,
        viewport: { width: window.innerWidth, height: window.innerHeight }
      });
    };

    logSizes();
    window.addEventListener('resize', logSizes);
    return () => window.removeEventListener('resize', logSizes);
  }, [currentStepIndex]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4 text-primary">⚡</div>
          <p className="text-foreground mb-4">Loading energy story...</p>
          {error && (
            <div className="bg-card border border-border rounded-lg p-4 mb-4">
              <p className="text-sm text-muted-foreground mb-2">Having trouble loading data:</p>
              <p className="text-sm text-red-400 mb-4">{error}</p>
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Preparing interactive story experience...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] overflow-hidden"> {/* Account for navbar height and prevent horizontal overflow */}
      {/* Full-screen Map */}
      <div ref={mapWrapperRef} className="absolute inset-0">
        <StoryMap 
          ref={mapRef}
          data={records} 
          currentStep={currentStep}
          onStepComplete={handleStepComplete}
        />
      </div>

      {/* Overlay Story Panel */}
      <div className="fixed left-4 md:left-6 top-[80px] bottom-[30px] z-10 pointer-events-none">
        <div ref={panelRef} className="w-[500px] md:w-[550px] h-full pointer-events-auto">  
          <StoryPanel
            currentStep={currentStep}
            totalSteps={storySteps.length}
            isPlaying={isPlaying}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onPlayPause={() => mapRef.current?.recenter()}
            onStepSelect={handleStepSelect}
            data={records}
          />
        </div>
      </div>
    </div>
  );
}
