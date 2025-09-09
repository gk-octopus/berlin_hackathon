"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TimeRangeSelectorProps {
  selectedRange: string;
  onRangeChange: (range: string) => void;
}

export function TimeRangeSelector({ selectedRange, onRangeChange }: TimeRangeSelectorProps) {
  const ranges = [
    { label: "Last 24h", value: "24h", hours: 24 },
    { label: "Last 48h", value: "48h", hours: 48 },
    { label: "Last Week", value: "7d", hours: 168 },
    { label: "Last Month", value: "30d", hours: 720 },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <span className="text-sm font-medium text-muted-foreground self-center mr-2">
        Time Range:
      </span>
      {ranges.map((range) => (
        <Button
          key={range.value}
          variant={selectedRange === range.value ? "default" : "outline"}
          size="sm"
          onClick={() => onRangeChange(range.value)}
          className={`${
            selectedRange === range.value
              ? "bg-primary text-primary-foreground"
              : "bg-card border-border text-card-foreground hover:bg-accent"
          }`}
        >
          {range.label}
        </Button>
      ))}
      
      <div className="flex items-center ml-4">
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          Live Data
        </Badge>
        <span className="text-xs text-muted-foreground ml-2">
          Updates every 5 minutes
        </span>
      </div>
    </div>
  );
}
