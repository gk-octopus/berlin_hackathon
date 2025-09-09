"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { StoryStep } from './StoryData';

// You'll need to replace this with your actual token
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

type FlowRecord = {
  SETTLEMENT_DATE: string;
  SETTLEMENT_PERIOD: number;
  IFA_FLOW: number;
  IFA2_FLOW: number;
  BRITNED_FLOW: number;
  NEMO_FLOW: number;
  NSL_FLOW: number;
  ELECLINK_FLOW: number;
  VIKING_FLOW: number;
  GREENLINK_FLOW: number;
};

interface StoryMapProps {
  data: FlowRecord[];
  currentStep: StoryStep;
  onStepComplete?: () => void;
}

export type StoryMapHandle = {
  recenter: () => void;
};

// Interconnector cable endpoints (exact coordinates)
const CABLE_ROUTES = {
  IFA: {
    name: "IFA (France)",
    capacity: 2000,
    route: [
      [1.1132895117105799, 51.103418620953185], // Sellindge (GB)
      [1.8437466954197943, 50.91858680615138]   // Les Mandarins/Bonningues-les-Calais (FR)
    ]
  },
  IFA2: {
    name: "IFA2 (France)", 
    capacity: 1000,
    route: [
      [-1.0780820394170618, 50.7832443935355], // Chilling/Lee-on-the-Solent (GB)
      [-0.3555646077046868, 49.252922881363524] // Tourbe (FR)
    ]
  },
  ELECLINK: {
    name: "ElecLink (France)",
    capacity: 1000,
    route: [
      [1.251511226202367, 51.11968861177729], // Folkestone (GB)
      [2.0007939769182586, 50.99242490824861] // Coquelles/Peuplingues (FR)
    ]
  },
  BRITNED: {
    name: "BritNed (Netherlands)",
    capacity: 1000,
    route: [
      [0.7844011743939115, 51.4210441539729], // Isle of Grain (GB)
      [4.010945866841263, 51.9375695645561]   // Maasvlakte/Rotterdam (NL)
    ]
  },
  NEMO: {
    name: "Nemo (Belgium)",
    capacity: 1000,
    route: [
      [1.425909959533029, 51.3806718610709], // Richborough (GB)
      [3.1488361716378432, 51.311241673097]  // Zeebrugge (BE)
    ]
  },
  NSL: {
    name: "North Sea Link (Norway)",
    capacity: 1400,
    route: [
      [-1.5377582630947457, 55.14695791911281], // Blyth/Cambois (GB)
      [5.914769385343425, 59.28562883699823]   // Kvilldal (NO)
    ]
  },
  VIKING: {
    name: "Viking Link (Denmark)",
    capacity: 1400,
    route: [
      [0.24854766482862675, 53.2966020321828], // Bicker Fen (GB)
      [8.257409460962705, 55.69847339714555]   // Revsing (DK)
    ]
  },
  GREENLINK: {
    name: "Greenlink (Ireland)",
    capacity: 500,
    route: [
      [-5.121986599180269, 51.747221260687866], // Pembroke (GB)
      [-7.067225838405891, 52.1923428810892]    // Great Island (IE)
    ]
  }
};

export const StoryMap = forwardRef<StoryMapHandle, StoryMapProps>(function StoryMap({ data, currentStep, onStepComplete }: StoryMapProps, ref) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Get latest data point for current flows
  const latestData = data[data.length - 1] || {};

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Set the access token
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    
    let animationId: number;

    // Initialize map with your custom style and globe view
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/gk-octopus/cmfcdl40q007001r153nlchkk', // Your custom style
      center: currentStep.mapCenter,
      zoom: currentStep.mapZoom,
      bearing: currentStep.mapBearing || 0,
      pitch: currentStep.mapPitch || 44.42,
      projection: 'globe'
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      
      if (!map.current) return;
      
      // Add interconnector cable routes
      Object.entries(CABLE_ROUTES).forEach(([key, cable]) => {
        const flow = latestData[`${key}_FLOW` as keyof typeof latestData] || 0;
        const utilization = Math.abs(flow) / cable.capacity;
        
        // Determine color based on flow direction and magnitude
        let color = '#666666'; // Default gray
        let width = 2;
        
        if (Math.abs(flow) > 50) { // Only show active flows
          if (flow > 0) {
            color = '#3b82f6'; // Blue for imports
          } else {
            color = '#f97316'; // Orange for exports  
          }
          width = Math.max(2, Math.min(8, utilization * 8)); // Scale width by utilization
        }

        // Add cable route as line
        map.current!.addSource(`cable-${key}`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {
              name: cable.name,
              flow: flow,
              capacity: cable.capacity,
              utilization: Math.round(utilization * 100)
            },
            geometry: {
              type: 'LineString',
              coordinates: cable.route
            }
          }
        });

        map.current!.addLayer({
          id: `cable-${key}`,
          type: 'line',
          source: `cable-${key}`,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': color,
            'line-width': Math.max(2, width),
            'line-opacity': 0.6
          }
        });

        // Add dots for power flow (animated if flow > 50MW, static if lower)
        if (Math.abs(flow) > 10) {
          const route = cable.route;
          const distance = Math.sqrt(
            Math.pow(route[1][0] - route[0][0], 2) + 
            Math.pow(route[1][1] - route[0][1], 2)
          );
          
          // Calculate number of dots based on distance and cable type
          let numDots = Math.max(3, Math.min(8, Math.floor(distance * 20)));
          
          // Special cases for specific cables
          if (key === 'NSL') {
            numDots = Math.min(15, numDots * 3); // North Sea Link gets 3x dots
          } else if (key === 'VIKING') {
            numDots = Math.min(12, numDots * 2); // Viking Link gets 2x dots
          }
          const speed = Math.abs(flow) / 1000; // Speed based on flow magnitude
          
          for (let i = 0; i < numDots; i++) {
            const dotId = `dot-${key}-${i}`;
            const initialProgress = i / numDots;
            
            // Create dot source
            map.current!.addSource(dotId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {
                  progress: initialProgress,
                  speed: speed,
                  reverse: flow < 0 // Reverse direction for exports
                },
                geometry: {
                  type: 'Point',
                  coordinates: [
                    route[0][0] + (route[1][0] - route[0][0]) * initialProgress,
                    route[0][1] + (route[1][1] - route[0][1]) * initialProgress
                  ]
                }
              }
            });

            // Add dot layer
            map.current!.addLayer({
              id: dotId,
              type: 'circle',
              source: dotId,
              paint: {
                'circle-radius': 2,
                'circle-color': color,
                'circle-opacity': 0.7,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#ffffff',
                'circle-stroke-opacity': 0.3
              }
            });
          }
        }

        // Add endpoint circles for cable endpoints
        cable.route.forEach((coord, index) => {
          const isUK = index === 0;
          const endpointId = `endpoint-${key}-${index}`;
          
          // Determine country info
          let countryCode = 'GB';
          let countryName = 'Great Britain';
          let flagEmoji = '🇬🇧';
          
          if (!isUK) {
            switch (key) {
              case 'IFA':
              case 'IFA2':
              case 'ELECLINK':
                countryCode = 'FR';
                countryName = 'France';
                flagEmoji = '🇫🇷';
                break;
              case 'BRITNED':
                countryCode = 'NL';
                countryName = 'Netherlands';
                flagEmoji = '🇳🇱';
                break;
              case 'NEMO':
                countryCode = 'BE';
                countryName = 'Belgium';
                flagEmoji = '🇧🇪';
                break;
              case 'NSL':
                countryCode = 'NO';
                countryName = 'Norway';
                flagEmoji = '🇳🇴';
                break;
              case 'VIKING':
                countryCode = 'DK';
                countryName = 'Denmark';
                flagEmoji = '🇩🇰';
                break;
              case 'GREENLINK':
                countryCode = 'IE';
                countryName = 'Ireland';
                flagEmoji = '🇮🇪';
                break;
            }
          }

          // Add endpoint source
          map.current!.addSource(endpointId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {
                country: countryName,
                countryCode: countryCode,
                cable: cable.name,
                flow: flow,
                capacity: cable.capacity,
                utilization: Math.round(utilization * 100)
              },
              geometry: {
                type: 'Point',
                coordinates: coord
              }
            }
          });

          // Add larger background circle for flag effect
          map.current!.addLayer({
            id: `${endpointId}-bg-circle`,
            type: 'circle',
            source: endpointId,
            paint: {
              'circle-radius': 16,
              'circle-color': isUK ? '#581ec0' : color,
              'circle-opacity': 0.3,
              'circle-stroke-width': 1,
              'circle-stroke-color': '#ffffff',
              'circle-stroke-opacity': 0.4
            }
          });

          // Add flag emoji text on the background circle
          map.current!.addLayer({
            id: `${endpointId}-flag-emoji`,
            type: 'symbol',
            source: endpointId,
            layout: {
              'text-field': flagEmoji,
              'text-size': 16,
              'text-anchor': 'center',
              'text-allow-overlap': true,
              'text-ignore-placement': true
            },
            paint: {
              'text-opacity': 0.7
            }
          });

          // Add endpoint circle layer (on top of flag)
          map.current!.addLayer({
            id: `${endpointId}-circle`,
            type: 'circle',
            source: endpointId,
            paint: {
              'circle-radius': 12,
              'circle-color': isUK ? '#581ec0' : color,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
              'circle-stroke-opacity': 0.8,
              'circle-opacity': 0.9
            }
          });

          // Add country code text layer (on top of everything)
          map.current!.addLayer({
            id: `${endpointId}-text`,
            type: 'symbol',
            source: endpointId,
            layout: {
              'text-field': countryCode,
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-size': 10,
              'text-anchor': 'center',
              'text-allow-overlap': true,
              'text-ignore-placement': true
            },
            paint: {
              'text-color': '#ffffff',
              'text-halo-color': '#000000',
              'text-halo-width': 1
            }
          });
        });
      });
    });

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const flyToCurrentStep = () => {
    if (!map.current) return;
    map.current.flyTo({
      center: currentStep.mapCenter,
      zoom: currentStep.mapZoom,
      bearing: currentStep.mapBearing || 0,
      pitch: currentStep.mapPitch || 44.42,
      duration: currentStep.duration,
      essential: true
    });

    if (onStepComplete) {
      setTimeout(() => {
        onStepComplete();
      }, currentStep.duration + 500);
    }
  };

  // Expose imperative handle to recenter map
  useImperativeHandle(ref, () => ({
    recenter: () => flyToCurrentStep()
  }), [currentStep, mapLoaded]);

  // Animate to new step when step changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    flyToCurrentStep();
  }, [currentStep, mapLoaded]);

  if (!MAPBOX_ACCESS_TOKEN) {
    return (
      <div className="h-full flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center">
          <p className="text-muted-foreground">Please add your Mapbox access token</p>
          <p className="text-sm text-muted-foreground mt-2">
            Set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your environment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
});
