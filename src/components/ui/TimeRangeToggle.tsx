"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TimeRangeToggleProps {
  selectedRange: "day" | "week";
  onRangeChange: (range: "day" | "week") => void;
}

export function TimeRangeToggle({ selectedRange, onRangeChange }: TimeRangeToggleProps) {
  return (
    <div className="flex items-center gap-4 mb-6 p-4 bg-card rounded-lg border border-border">
      <span className="text-sm font-medium text-card-foreground">
        Time Range:
      </span>
      
      <div className="flex gap-1 bg-muted rounded-lg p-1">
        <Button
          variant={selectedRange === "day" ? "default" : "ghost"}
          size="sm"
          onClick={() => onRangeChange("day")}
          className={`${
            selectedRange === "day"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-card-foreground"
          }`}
        >
          Last Day
        </Button>
        <Button
          variant={selectedRange === "week" ? "default" : "ghost"}
          size="sm"
          onClick={() => onRangeChange("week")}
          className={`${
            selectedRange === "week"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-card-foreground"
          }`}
        >
          Last Week
        </Button>
      </div>
      
      <div className="flex items-center gap-2 ml-auto">
        <Badge variant="secondary" className="bg-green-500/20 text-green-400">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
          Live Data
        </Badge>
        <span className="text-xs text-muted-foreground">
          Updates every 5 minutes
        </span>
      </div>
    </div>
  );
}
