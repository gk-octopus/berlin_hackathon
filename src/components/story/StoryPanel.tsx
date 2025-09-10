"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Crosshair } from "lucide-react";
import { StoryStep } from "./StoryData";
import Image from "next/image";

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
import { DemandChart } from "@/components/charts/DemandChart";
import { EmbeddedGenChart } from "@/components/charts/EmbeddedGenChart";
import { InterconnectorTimelineChart } from "@/components/charts/InterconnectorTimelineChart";
import { DetailedCountryFlows } from "@/components/charts/DetailedCountryFlows";
import { EvidenceBasedConstraints } from "@/components/constraint-indicators/EvidenceBasedConstraints";
import { WindComparisonBarChart } from "@/components/charts/WindComparisonBarChart";
import { NegativePriceChart } from "@/components/charts/NegativePriceChart";
import { SpendingForecastChart } from "@/components/charts/SpendingForecastChart";
import { ZonalSavingsBarChart } from "@/components/charts/ZonalSavingsBarChart";
import { EglTimelineChart } from "@/components/charts/EglTimelineChart";
import { CityPopulationBar } from "@/components/charts/CityPopulationBar";

interface StoryPanelProps {
  currentStep: StoryStep;
  totalSteps: number;
  isPlaying: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onPlayPause: () => void;
  onStepSelect: (stepId: number) => void;
  data: NesoRecord[];
}

export function StoryPanel({ 
  currentStep, 
  totalSteps, 
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
        return <CityPopulationBar />;
      case 'interconnector':
        // On step 4 (id 3), show yesterday's load profile for a complete day
        return <InterconnectorTimelineChart data={data} view={currentStep.id === 3 ? 'yesterday' : 'last24h'} />;
      case 'renewable':
        // For step 5, use the same bar chart as step 2 but with the 6.1 GW reference line
        if (currentStep.id === 4) {
          return <WindComparisonBarChart referenceGW={6.1} referenceLabel="B6 max limit (6.1 GW)" />;
        }
        // For step 8, highlight excess above B6 limit for Scotland
        if (currentStep.id === 7) {
          return <WindComparisonBarChart referenceGW={6.1} referenceLabel="B6 max limit (6.1 GW)" highlightExcess />;
        }
        return <EmbeddedGenChart data={data} timeRange="day" />;
      case 'flows':
        return <DetailedCountryFlows data={data} />;
      case 'constraints':
        return <EvidenceBasedConstraints data={data} />;
      case 'windComparison':
        return <WindComparisonBarChart />;
      case 'image':
        return (
          <div className="w-full flex flex-col items-start gap-3">
            {currentStep.imageUrl && (
              <Image
                src={currentStep.imageUrl}
                alt="Context visual"
                width={1000}
                height={600}
                className="w-full h-80 object-contain rounded-lg"
              />
            )}
            {currentStep.externalLink && (
              <a
                href={currentStep.externalLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary underline font-medium"
              >
                📖 {currentStep.externalLink.label} ↗
              </a>
            )}
          </div>
        );
      case 'negativePrice':
        return <NegativePriceChart />;
      case 'spending':
        return <SpendingForecastChart />;
      case 'zonalSavings':
        return <ZonalSavingsBarChart />;
      case 'eglTimeline':
        return <EglTimelineChart />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Story Content */}
      <Card className="flex-1 min-h-0 relative flex flex-col overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Step {currentStep.id + 1} of {totalSteps}
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
          {currentStep.id === 15 && (
            <div className="mt-4 grid grid-cols-1 gap-3">
              <div className="rounded-lg border border-border bg-card/60 p-4">
                <div className="text-sm uppercase tracking-wide text-muted-foreground">01</div>
                <div className="text-lg font-semibold text-foreground mt-1">Regional pricing</div>
                <p className="text-sm text-muted-foreground mt-1">Align generation and demand across zones and reduce costly last‑minute balancing.</p>
              </div>
              <div className="rounded-lg border border-border bg-card/60 p-4">
                <div className="text-sm uppercase tracking-wide text-muted-foreground">02</div>
                <div className="text-lg font-semibold text-foreground mt-1">Deliver transmission (EGL1/EGL2)</div>
                <p className="text-sm text-muted-foreground mt-1">Unlock north–south transfer and cut B6 bottlenecks. Keep projects on time.</p>
              </div>
              <div className="rounded-lg border border-border bg-card/60 p-4">
                <div className="text-sm uppercase tracking-wide text-muted-foreground">03</div>
                <div className="text-lg font-semibold text-foreground mt-1">EU market recoupling</div>
                <p className="text-sm text-muted-foreground mt-1">Enable efficient cross‑border trading and fuller use of interconnectors.</p>
              </div>
            </div>
          )}
          {currentStep.id === 14 && (
            <div className="mt-3 space-y-2 text-sm">
              <div className="text-xs">
                <a className="underline text-primary" href="https://www.spglobal.com/commodityinsights/en/market-insights/latest-news/electric-power/051925-eu-uk-to-open-door-to-recouple-electricity-trading-arrangements" target="_blank" rel="noreferrer">EU, UK to open door to recouple electricity trading arrangements (S&P Global)</a>
              </div>
              <div className="text-xs text-muted-foreground">Nine GB–EU interconnectors (~10 GW) could transmit up to ~80 TWh/year if efficiently coupled.</div>
            </div>
          )}
          {currentStep.id === 12 && (
            <div className="mt-3 space-y-1 text-sm">
              <a className="underline text-primary" href="https://octopus.energy/press/octopus-strikes-back/" target="_blank" rel="noreferrer">Octopus Energy: “Octopus strikes back” (press release)</a>
              <a className="underline text-primary block" href="https://www.ofgem.gov.uk/sites/default/files/2023-10/FINAL%20FTI%20Assessment%20of%20locational%20wholesale%20electricity%20market%20design%20options%20-%2027%20Oct%202023%205.pdf" target="_blank" rel="noreferrer">Ofgem: FTI assessment of locational wholesale market designs (2023)</a>
              <a className="underline text-primary block" href="https://octoenergy-production-media.s3.amazonaws.com/documents/FTI_-_Octopus_-_Impact_of_zonal_design_-_Final_report_-_24_Feb_2025.pdf" target="_blank" rel="noreferrer">FTI Consulting for Octopus: Impact of a potential zonal design (2025)</a>
            </div>
          )}
          {currentStep.id === 0 && (
            <div className="mt-4">
              <Image
                src="https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/Google%20Chrome%202025-09-09%2023.45.32.png"
                alt="Energy Story"
                width={800}
                height={300}
                className="w-full h-80 object-contain rounded-lg"
              />
            </div>
          )}
          {currentStep.id === 16 && (
            <div className="mt-3">
              <Image
                src="https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/Group%208801.png"
                alt="Contributors"
                width={1000}
                height={220}
                className="w-full max-w-xl h-auto object-contain rounded-md mb-3"
              />
              <a
                href="https://github.com/gk-octopus/berlin_hackathon"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary underline font-medium"
              >
                Check out this project on GitHub ↗
              </a>
              <div className="mt-3">
                <a
                  href="https://github.com/gk-octopus/berlin_hackathon"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center px-3 py-2 rounded-md bg-primary text-primary-foreground shadow hover:opacity-90 transition"
                >
                  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" className="mr-2"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                  GitHub
                </a>
              </div>
              <div className="mt-2 text-sm text-foreground">
                Love and power, <span className="font-semibold">Fem Alonge</span>, <span className="font-semibold">George Kolokotronis</span>, <span className="font-semibold">Yeong Xin Wee</span>
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="flex-1 min-h-0 overflow-y-auto relative">
          {/* Chart Section */}
          {currentStep.chartType && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                {currentStep.id === 6 ? 'Negative Price Overview' : currentStep.id === 4 ? 'Wind Capacity vs B6 Limit' : currentStep.id === 11 ? 'NESO Spend (YTD + Projection)' : currentStep.id === 12 ? 'Zonal vs National (£/MWh savings)' : currentStep.id === 13 ? 'EGL Timelines (planned vs delay)' : 'Visualisation'}
              </h3>
              <div className={`${currentStep.chartType === 'windComparison' ? 'h-56' : (currentStep.chartType === 'demand' ? 'h-[26rem]' : 'h-64')} bg-muted/20 rounded-lg p-4`}>
                {renderChart()}
              </div>
            </div>
          )}

          {/* Step Insights removed per request */}
          {/* Bottom blur removed */}
        </CardContent>

        {/* Pagination inside the card footer */}
        <CardFooter className="flex items-center justify-between gap-4 px-3 py-1 border-t border-border bg-card/50">
          {/* Previous Button */}
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={currentStep.id === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {/* Middle Content: Dots and Page Number */}
          <div className="flex flex-1 justify-center items-center gap-4">
            {/* Step Dots */}
            <div className="hidden sm:flex items-center gap-1.5">
              {Array.from({ length: totalSteps }, (_, i) => (
                <button
                  key={i}
                  onClick={() => onStepSelect(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentStep.id === i
                      ? 'bg-primary' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>
            {/* Page Number */}
            <div className="text-sm text-muted-foreground tabular-nums">
              {currentStep.id + 1} / {totalSteps}
            </div>
          </div>

          {/* Next Button */}
          <Button
            variant="outline"
            onClick={onNext}
            disabled={currentStep.id === totalSteps - 1}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
