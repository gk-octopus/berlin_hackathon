"use client";

import { useState, useEffect, useRef } from "react";
import { StoryMap, StoryMapHandle } from "@/components/story/StoryMap";
import { StoryPanel } from "@/components/story/StoryPanel";
import { storySteps } from "@/components/story/StoryData";

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
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoProgressTimer, setAutoProgressTimer] = useState<NodeJS.Timeout | null>(null);
  const mapRef = useRef<StoryMapHandle | null>(null);

  const currentStep = storySteps[currentStepIndex];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const limit = 48; // Get last 24 hours of data
        
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

  const handlePlayPause = () => {
    if (autoProgressTimer) {
      clearTimeout(autoProgressTimer);
      setAutoProgressTimer(null);
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepSelect = (stepId: number) => {
    setCurrentStepIndex(stepId - 1);
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
    <div className="relative h-[calc(100vh-4rem)]"> {/* Account for navbar height */}
      {/* Full-screen Map */}
      <div className="absolute inset-0">
        <StoryMap 
          ref={mapRef}
          data={records} 
          currentStep={currentStep}
          onStepComplete={handleStepComplete}
        />
      </div>

      {/* Overlay Story Panel */}
      <div className="fixed left-4 md:left-6 top-[80px] bottom-[30px] z-10 pointer-events-none">
        <div className="w-96 md:w-[420px] h-full pointer-events-auto">
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
