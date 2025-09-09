"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Crosshair } from "lucide-react";
import { StoryStep } from "./StoryData";
import { DemandChart } from "@/components/charts/DemandChart";
import { EmbeddedGenChart } from "@/components/charts/EmbeddedGenChart";
import { InterconnectorTimelineChart } from "@/components/charts/InterconnectorTimelineChart";
import { DetailedCountryFlows } from "@/components/charts/DetailedCountryFlows";
import { EvidenceBasedConstraints } from "@/components/constraint-indicators/EvidenceBasedConstraints";

interface StoryPanelProps {
  currentStep: StoryStep;
  totalSteps: number;
  isPlaying: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onPlayPause: () => void;
  onStepSelect: (stepId: number) => void;
  data: any[];
}

export function StoryPanel({ 
  currentStep, 
  totalSteps, 
  isPlaying, 
  onPrevious, 
  onNext, 
  onPlayPause, 
  onStepSelect,
  data 
}: StoryPanelProps) {

  const renderChart = () => {
    if (!currentStep.chartType || data.length === 0) return null;

    switch (currentStep.chartType) {
      case 'demand':
        return <DemandChart data={data} timeRange="day" />;
      case 'interconnector':
        return <InterconnectorTimelineChart data={data} />;
      case 'renewable':
        return <EmbeddedGenChart data={data} timeRange="day" />;
      case 'flows':
        return <DetailedCountryFlows data={data} />;
      case 'constraints':
        return <EvidenceBasedConstraints data={data} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Story Content */}
      <div className="flex-1">
        <Card className="h-full relative flex flex-col overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Step {currentStep.id} of {totalSteps}
              </Badge>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPlayPause}
                  className="h-7 px-2 py-1 text-sm flex items-center gap-1"
                >
                  <Crosshair className="h-3 w-3" />
                  Centre map
                </Button>
              </div>
            </div>
            <CardTitle className="text-2xl mb-3">{currentStep.title}</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              {currentStep.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 min-h-0 overflow-y-auto relative">
            {/* Chart Section */}
            {currentStep.chartType && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  Live Data Visualization
                </h3>
                <div className="h-64 bg-muted/20 rounded-lg p-4">
                  {renderChart()}
                </div>
              </div>
            )}

            {/* Step Insights */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Key Insights</h3>
              
              {currentStep.id === 1 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-primary">8</div>
                    <div className="text-sm text-muted-foreground">Interconnector Cables</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-primary">9.4GW</div>
                    <div className="text-sm text-muted-foreground">Total Capacity</div>
                  </div>
                </div>
              )}

              {currentStep.id === 2 && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-lg font-bold text-blue-400">IFA</div>
                    <div className="text-sm text-muted-foreground">2000MW</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-lg font-bold text-blue-400">IFA2</div>
                    <div className="text-sm text-muted-foreground">1000MW</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-lg font-bold text-blue-400">ElecLink</div>
                    <div className="text-sm text-muted-foreground">1000MW</div>
                  </div>
                </div>
              )}

              {currentStep.id === 3 && (
                <div className="space-y-3">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Viking Link (Denmark)</span>
                      <span className="font-bold text-primary">1400MW</span>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">North Sea Link (Norway)</span>
                      <span className="font-bold text-primary">1400MW</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Add more step-specific insights as needed */}
            </div>
            {/* Blending gradient above footer */}
            <div className="pointer-events-none sticky bottom-0 h-8 -mb-8 bg-gradient-to-t from-card to-transparent" />
          </CardContent>

          {/* Pagination inside the card footer */}
          <CardFooter className="flex-col gap-3 border-t border-border bg-card/50">
            {/* Step Dots */}
            <div className="flex justify-center w-full">
              <div className="flex items-center gap-2">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => onStepSelect(i + 1)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      currentStep.id === i + 1 
                        ? 'bg-primary' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                    aria-label={`Go to step ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Previous/Next Buttons */}
            <div className="flex justify-between items-center w-full">
              <Button
                variant="outline"
                onClick={onPrevious}
                disabled={currentStep.id === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="text-sm text-muted-foreground">
                {currentStep.id} / {totalSteps}
              </div>

              <Button
                variant="outline"
                onClick={onNext}
                disabled={currentStep.id === totalSteps}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
