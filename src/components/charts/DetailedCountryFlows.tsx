"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type FlowRecord = {
  SETTLEMENT_DATE: string;
  SETTLEMENT_PERIOD: number;
  IFA_FLOW: number;      // France
  IFA2_FLOW: number;     // France
  BRITNED_FLOW: number;  // Netherlands
  NEMO_FLOW: number;     // Belgium
  NSL_FLOW: number;      // Norway
  ELECLINK_FLOW: number; // France
  VIKING_FLOW: number;   // Denmark
  GREENLINK_FLOW: number; // Ireland
};

interface CableInfo {
  name: string;
  capacity: number;
  flow: number;
  status: string;
  commissioned: string;
}

interface CountryData {
  name: string;
  flag: string;
  totalFlow: number;
  totalCapacity: number;
  cables: CableInfo[];
  color: string;
  lightColor: string;
  textColor: string;
}

export function DetailedCountryFlows({ data }: { data: FlowRecord[] }) {
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  
  if (!data || data.length === 0) return null;
  
  const latest = data[0];
  
  const countries: CountryData[] = [
    {
      name: "France",
      flag: "🇫🇷",
      totalFlow: (latest.IFA_FLOW || 0) + (latest.IFA2_FLOW || 0) + (latest.ELECLINK_FLOW || 0),
      totalCapacity: 5400, // 2000 + 1000 + 1000 + 1400 planned
      cables: [
        {
          name: "IFA (Interconnexion France-Angleterre)",
          capacity: 2000,
          flow: latest.IFA_FLOW || 0,
          status: Math.abs(latest.IFA_FLOW || 0) > 100 ? "Active" : "Standby",
          commissioned: "1986 (Upgraded 2019)"
        },
        {
          name: "IFA2",
          capacity: 1000,
          flow: latest.IFA2_FLOW || 0,
          status: Math.abs(latest.IFA2_FLOW || 0) > 100 ? "Active" : "Standby",
          commissioned: "2021"
        },
        {
          name: "ElecLink (Channel Tunnel)",
          capacity: 1000,
          flow: latest.ELECLINK_FLOW || 0,
          status: Math.abs(latest.ELECLINK_FLOW || 0) > 100 ? "Active" : "Standby",
          commissioned: "2019"
        }
      ],
      color: "bg-blue-500",
      lightColor: "bg-blue-100",
      textColor: "text-blue-700"
    },
    {
      name: "Netherlands",
      flag: "🇳🇱",
      totalFlow: latest.BRITNED_FLOW || 0,
      totalCapacity: 1000,
      cables: [
        {
          name: "BritNed",
          capacity: 1000,
          flow: latest.BRITNED_FLOW || 0,
          status: Math.abs(latest.BRITNED_FLOW || 0) > 100 ? "Active" : "Standby",
          commissioned: "2011"
        }
      ],
      color: "bg-orange-500",
      lightColor: "bg-orange-100",
      textColor: "text-orange-700"
    },
    {
      name: "Belgium",
      flag: "🇧🇪",
      totalFlow: latest.NEMO_FLOW || 0,
      totalCapacity: 1000,
      cables: [
        {
          name: "Nemo Link",
          capacity: 1000,
          flow: latest.NEMO_FLOW || 0,
          status: Math.abs(latest.NEMO_FLOW || 0) > 100 ? "Active" : "Standby",
          commissioned: "2019"
        }
      ],
      color: "bg-yellow-500",
      lightColor: "bg-yellow-100",
      textColor: "text-yellow-700"
    },
    {
      name: "Norway",
      flag: "🇳🇴",
      totalFlow: latest.NSL_FLOW || 0,
      totalCapacity: 1400,
      cables: [
        {
          name: "North Sea Link (NSL)",
          capacity: 1400,
          flow: latest.NSL_FLOW || 0,
          status: Math.abs(latest.NSL_FLOW || 0) > 100 ? "Active" : "Standby",
          commissioned: "2021"
        }
      ],
      color: "bg-indigo-500",
      lightColor: "bg-indigo-100",
      textColor: "text-indigo-700"
    },
    {
      name: "Denmark",
      flag: "🇩🇰",
      totalFlow: latest.VIKING_FLOW || 0,
      totalCapacity: 1400,
      cables: [
        {
          name: "Viking Link",
          capacity: 1400,
          flow: latest.VIKING_FLOW || 0,
          status: Math.abs(latest.VIKING_FLOW || 0) > 100 ? "Active" : "Standby",
          commissioned: "2023"
        }
      ],
      color: "bg-red-500",
      lightColor: "bg-red-100",
      textColor: "text-red-700"
    },
    {
      name: "Ireland",
      flag: "🇮🇪",
      totalFlow: latest.GREENLINK_FLOW || 0,
      totalCapacity: 500,
      cables: [
        {
          name: "Greenlink",
          capacity: 500,
          flow: latest.GREENLINK_FLOW || 0,
          status: Math.abs(latest.GREENLINK_FLOW || 0) > 100 ? "Active" : "Standby",
          commissioned: "2024 (Planned)"
        }
      ],
      color: "bg-green-500",
      lightColor: "bg-green-100",
      textColor: "text-green-700"
    }
  ];

  const getFlowDescription = (flow: number) => {
    if (flow > 100) return { text: "Importing", icon: "⬇️", type: "import" };
    if (flow < -100) return { text: "Exporting", icon: "⬆️", type: "export" };
    return { text: "Balanced", icon: "⚖️", type: "balanced" };
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 80) return "bg-red-500";
    if (utilization > 60) return "bg-yellow-500";
    if (utilization > 30) return "bg-blue-500";
    return "bg-gray-400";
  };

  const toggleCountry = (countryName: string) => {
    setExpandedCountry(expandedCountry === countryName ? null : countryName);
  };

  return (
    <div className="space-y-4">
      {/* Overview Summary */}
      <Card className="bg-accent/10 border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">🌍</span>
            Interconnector Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">
                {Math.round(countries.reduce((sum, c) => sum + Math.abs(c.totalFlow), 0))} MW
              </div>
              <div className="text-sm text-muted-foreground">Total Trading</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {countries.reduce((sum, c) => sum + c.totalCapacity, 0)} MW
              </div>
              <div className="text-sm text-muted-foreground">Total Capacity</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {countries.filter(c => Math.abs(c.totalFlow) > 100).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Countries</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {countries.reduce((sum, c) => sum + c.cables.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Cables</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Country Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {countries.map((country) => {
          const flowDesc = getFlowDescription(country.totalFlow);
          const absFlow = Math.abs(country.totalFlow);
          const utilization = (absFlow / country.totalCapacity) * 100;
          const isExpanded = expandedCountry === country.name;
          
          return (
            <Card key={country.name} className="border-l-4" style={{ borderLeftColor: country.color.replace('bg-', '#') }}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{country.flag}</span>
                    <span>{country.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{flowDesc.icon}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCountry(country.name)}
                      className="text-xs"
                    >
                      {isExpanded ? "Less" : "Details"}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Country Summary */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {country.totalFlow > 0 ? '+' : ''}{Math.round(country.totalFlow)} MW
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {Math.round(utilization)}% of {country.totalCapacity}MW capacity
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${
                        flowDesc.type === 'import' ? 'bg-blue-100 text-blue-700' :
                        flowDesc.type === 'export' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {flowDesc.text}
                    </Badge>
                  </div>
                  
                  {/* Utilization Bar */}
                  {absFlow > 50 && (
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${getUtilizationColor(utilization)}`}
                        style={{ width: `${Math.min(utilization, 100)}%` }}
                      ></div>
                    </div>
                  )}
                  
                  {/* Cable Details (Expandable) */}
                  {isExpanded && (
                    <div className="space-y-3 pt-3 border-t border-border">
                      <h4 className="text-sm font-medium text-muted-foreground">Individual Cables:</h4>
                      {country.cables.map((cable, index) => {
                        const cableUtil = Math.abs(cable.flow) / cable.capacity * 100;
                        const cableFlowDesc = getFlowDescription(cable.flow);
                        
                        return (
                          <div key={index} className="bg-muted/50 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground">{cable.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {cable.status}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                {cable.flow > 0 ? '+' : ''}{Math.round(cable.flow)} MW
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {Math.round(cableUtil)}% of {cable.capacity}MW
                              </span>
                            </div>
                            
                            <div className="w-full bg-background rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  cableFlowDesc.type === 'import' ? 'bg-blue-500' :
                                  cableFlowDesc.type === 'export' ? 'bg-green-500' :
                                  'bg-gray-400'
                                }`}
                                style={{ width: `${Math.min(cableUtil, 100)}%` }}
                              ></div>
                            </div>
                            
                            <div className="text-xs text-muted-foreground">
                              Commissioned: {cable.commissioned}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Status Indicator */}
                  {absFlow > 500 && (
                    <div className="text-xs text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        utilization > 80 ? 'bg-red-100 text-red-700' :
                        utilization > 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {utilization > 80 ? 'High Utilization' :
                         utilization > 60 ? 'Medium Load' :
                         'Active Trading'}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
