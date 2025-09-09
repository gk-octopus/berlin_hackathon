"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export function IndividualCountryFlows({ data }: { data: FlowRecord[] }) {
  if (!data || data.length === 0) return null;
  
  const latest = data[0];
  
  const countries = [
    {
      name: "France",
      flag: "🇫🇷",
      flow: (latest.IFA_FLOW || 0) + (latest.IFA2_FLOW || 0) + (latest.ELECLINK_FLOW || 0),
      cables: ["IFA", "IFA2", "ElecLink"],
      color: "bg-blue-500",
      lightColor: "bg-blue-100",
      textColor: "text-blue-700"
    },
    {
      name: "Netherlands", 
      flag: "🇳🇱",
      flow: latest.BRITNED_FLOW || 0,
      cables: ["BritNed"],
      color: "bg-orange-500",
      lightColor: "bg-orange-100", 
      textColor: "text-orange-700"
    },
    {
      name: "Belgium",
      flag: "🇧🇪", 
      flow: latest.NEMO_FLOW || 0,
      cables: ["Nemo"],
      color: "bg-yellow-500",
      lightColor: "bg-yellow-100",
      textColor: "text-yellow-700"
    },
    {
      name: "Norway",
      flag: "🇳🇴",
      flow: latest.NSL_FLOW || 0, 
      cables: ["North Sea Link"],
      color: "bg-indigo-500",
      lightColor: "bg-indigo-100",
      textColor: "text-indigo-700"
    },
    {
      name: "Denmark",
      flag: "🇩🇰",
      flow: latest.VIKING_FLOW || 0,
      cables: ["Viking Link"], 
      color: "bg-red-500",
      lightColor: "bg-red-100",
      textColor: "text-red-700"
    },
    {
      name: "Ireland",
      flag: "🇮🇪",
      flow: latest.GREENLINK_FLOW || 0,
      cables: ["Greenlink"],
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {countries.map((country) => {
        const flowDesc = getFlowDescription(country.flow);
        const absFlow = Math.abs(country.flow);
        
        return (
          <Card key={country.name} className="border-l-4" style={{ borderLeftColor: country.color.replace('bg-', '#') }}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{country.flag}</span>
                  <span>{country.name}</span>
                </div>
                <span className="text-xl">{flowDesc.icon}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {country.flow > 0 ? '+' : ''}{Math.round(country.flow)} MW
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
                
                {absFlow > 50 && (
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        flowDesc.type === 'import' ? 'bg-blue-500' :
                        flowDesc.type === 'export' ? 'bg-green-500' :
                        'bg-gray-400'
                      }`}
                      style={{ 
                        width: `${Math.min((absFlow / 2000) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground text-center">
                  via {country.cables.join(', ')}
                </div>
                
                {absFlow > 500 && (
                  <div className="text-xs text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      absFlow > 1500 ? 'bg-red-100 text-red-700' :
                      absFlow > 1000 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {absFlow > 1500 ? 'High Flow' :
                       absFlow > 1000 ? 'Medium Flow' :
                       'Active'}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
