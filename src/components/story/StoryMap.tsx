"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck

import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import Image from 'next/image';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { StoryStep } from './StoryData';

// You'll need to replace this with your actual token
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: {
    Boundary_n?: string;
    'Technology Type'?: string;
    'Development Status'?: string;
    'Country'?: string;
    'Region'?: string;
    [key: string]: any;
  };
}

interface GeoJSONData {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

interface WindowWithGeoJSON extends Window {
  gasFacilityGeoJSON?: GeoJSONData;
  mapInstance?: mapboxgl.Map;
  constantineCustomerData?: any;
  nesoPinLayerConfig?: {
    id: string;
    type: string;
    [key: string]: any;
  };
  constantineIconLoaded?: boolean;
}

// URL for the boundary GeoJSON data
const BOUNDARIES_GEOJSON_URL = 'https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/boundarieshackathon.geojson';

// URL for the circuit lines GeoJSON data
const CIRCUIT_LINES_GEOJSON_URL = 'https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/circuitlineshackathon.geojson';

// URL for the renewable energy planning database GeoJSON
const REPD_GEOJSON_URL = 'https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/repd-q2-jul-2025.geojson';

// URL for the landfill gas facilities GeoJSON
const GAS_GEOJSON_URL = 'https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/repd-q2-jul-2025_gas.geojson';

// Country flag/pin image URLs - using the correct Supabase format
const COUNTRY_IMAGES = {
  FR: 'https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/Flag%20constantine=France%20Flag.png',
  NL: 'https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/Flag%20constantine=Netherlands%20Flag.png',
  BE: 'https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/Flag%20constantine=Belguim%20Flag.png',
  NO: 'https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/Flag%20constantine=Norway%20Flag.png',
  DK: 'https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/Flag%20constantine=Denmark%20Flag.png',
  IE: 'https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/Flag%20constantine=Ireland%20Flag.png'
};

// Constantine figure URL for customer representation
const CONSTANTINE_IMAGE_URL = 'https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/constantine.png';

// URL for Eastern Green Link 2 transmission line
const EGL2_GEOJSON_URL = 'https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/gline_ssen-transmission-eastern-green-link-2-linear-route.geojson';

// URL for gas facility icon
const GAS_ICON_URL = 'https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/740842.png';

// URL for countries GeoJSON
const COUNTRIES_GEOJSON_URL = 'https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/countrieshackathon.geojson';

// URLs for protected areas GeoJSON data
const NATIONAL_PARKS_GEOJSON_URL = 'https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/national-park.geojson';
const GREEN_BELT_GEOJSON_URL = 'https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/green-belt.geojson';
const AONB_GEOJSON_URL = 'https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/area-of-outstanding-natural-beauty.geojson';

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
      [-0.21220927959232472, 52.90198278941064], // Bicker Fen (GB) - corrected coordinates
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

// Flying money animation system
let moneyAnimationInterval: NodeJS.Timeout | null = null;
let customerToNesoAnimationInterval: NodeJS.Timeout | null = null;

const startFlyingMoneyAnimation = (currentStep: StoryStep) => {
  if (moneyAnimationInterval) {
    console.log('⚠️ NESO animation already running, skipping');
    return; // Already running
  }
  
  console.log('🚀 Starting NESO-to-targets animation for:', currentStep.title);
  const nesoLocation = [-1.5684551896500056, 52.274893556845626]; // NESO pin location
  
  const getTargetLocations = (step: StoryStep) => {
    console.log('🔍 Analyzing step for targets:', { title: step.title, description: step.description?.substring(0, 50) + '...' });
    
    if (step.title.includes('Wind to Curtail')) {
      console.log('🌬️ Selected WIND targets');
      // Money flies to wind turbines (expanded Scottish and northern locations)
      return [
        // Scottish Highlands & Islands
        [-2.5, 55.5],   // Central Scotland
        [-3.0, 55.0],   // Southern Scotland
        [-2.0, 56.0],   // Eastern Scotland
        [-3.5, 55.8],   // Western Scotland
        [-2.8, 54.8],   // Border region
        // Additional Scottish wind farms
        [-4.2, 56.8],   // West Highlands
        [-3.8, 57.5],   // Northern Scotland
        [-2.2, 57.2],   // Northeast Scotland (Aberdeenshire)
        [-4.5, 56.2],   // Isle of Mull area
        [-3.2, 56.4],   // Central Highlands
        [-1.8, 55.8],   // Scottish Borders (east)
        [-4.0, 55.4],   // Ayrshire/Galloway
        [-2.6, 56.8],   // Cairngorms area
        [-3.6, 56.1],   // Stirling area
        [-1.5, 56.3]    // Fife/Tayside
      ];
    } else if (step.title.includes('Gas Plants')) {
      console.log('🔥 Selected GAS targets');
      // Money flies to ALL gas facilities (real locations + regional coverage)
      const realGasFacilities = [
        [-0.5868, 52.0517], // Brogborough Phase III
        [-0.5867, 52.0553], // Brogborough Phase IV  
        [0.3180, 51.5248],  // Ockendon Area III
        [0.1938, 51.4903],  // Rainham Phase II
        [1.0813, 52.1089],  // Masons Power Plant (East England)
      ];
      
      // Add more gas facility locations from loaded data if available
      const additionalGasLocations = [];
      if ((window as WindowWithGeoJSON).gasFacilityGeoJSON) {
        const gasData = (window as WindowWithGeoJSON).gasFacilityGeoJSON!;
        if (gasData.features) {
          gasData.features.slice(0, 20).forEach((feature: GeoJSONFeature) => {
            if (feature.geometry?.coordinates) {
              additionalGasLocations.push([feature.geometry.coordinates[0], feature.geometry.coordinates[1]]);
            }
          });
        }
      }
      
      // Regional coverage areas for comprehensive money distribution
      const regionalTargets = [
        [-1.2, 52.8],       // Midlands area
        [-0.8, 51.8],       // London area
        [-2.1, 53.1],       // Northwest England
        [-1.8, 50.9],       // South coast
        [0.5, 52.2],        // East of England
        [-2.8, 52.5],       // West Midlands
        [-1.5, 53.8],       // Yorkshire area
        [0.8, 51.3],        // Southeast England
        [-3.2, 51.5],       // South Wales
        [-2.3, 54.2],       // North England
        [-1.0, 54.5],       // Northeast England
        [-3.8, 52.2],       // Central Wales
        [0.2, 53.1],        // Lincolnshire
        [-2.5, 51.2],       // Southwest England
        [-1.7, 52.2]        // Warwickshire
      ];
      
      // Combine all gas targets
      return [...realGasFacilities, ...additionalGasLocations, ...regionalTargets];
    } else if (step.description?.includes('interconnectors') || step.title.includes('Reverse Wrong Direction')) {
      console.log('🔌 Selected INTERCONNECTOR targets');
      // Money flies to ALL interconnector endpoints (UK side of each cable)
      return [
        [1.1132895117105799, 51.103418620953185],   // IFA - Sellindge (GB)
        [-1.0780820394170618, 50.7832443935355],   // IFA2 - Chilling/Lee-on-the-Solent (GB)
        [1.251511226202367, 51.11968861177729],    // ElecLink - Folkestone (GB)
        [0.7844011743939115, 51.4210441539729],    // BritNed - Isle of Grain (GB)
        [1.425909959533029, 51.3806718610709],     // Nemo - Richborough (GB)
        [-1.5377582630947457, 55.14695791911281],  // North Sea Link - Blyth/Cambois (GB)
        [-0.21220927959232472, 52.90198278941064], // Viking Link - Bicker Fen (GB)
        [-5.121986599180269, 51.747221260687866]   // Greenlink - Pembroke (GB)
      ];
    }
    
    console.log('❌ No targets found for step:', step.title);
    return [];
  };
  
  const targetLocations = getTargetLocations(currentStep);
  console.log('🎯 Target locations for NESO animation:', targetLocations.map(loc => ({ coords: loc, name: getLocationName(loc) })));
  
  if (targetLocations.length === 0) {
    console.warn('❌ No target locations found for step:', currentStep.title);
    return;
  }
  
  // Create money emoji animations every 800ms (more frequent)
  moneyAnimationInterval = setInterval(() => {
    const randomTarget = targetLocations[Math.floor(Math.random() * targetLocations.length)];
    // Create multiple money emojis per interval
    createFlyingMoney(nesoLocation, randomTarget);
    setTimeout(() => createFlyingMoney(nesoLocation, randomTarget), 200);
    setTimeout(() => createFlyingMoney(nesoLocation, randomTarget), 400);
  }, 800);
};

const stopFlyingMoneyAnimation = () => {
  if (moneyAnimationInterval) {
    console.log('🛑 Stopping NESO-to-targets animation');
    clearInterval(moneyAnimationInterval);
    moneyAnimationInterval = null;
  }
  
  // Remove any existing money elements
  document.querySelectorAll('.flying-money').forEach(el => el.remove());
};

// Helper function to identify locations for debugging
const getLocationName = (coords: [number, number]) => {
  const [lng, lat] = coords;
  const nesoLng = -1.5684551896500056;
  const nesoLat = 52.274893556845626;
  
  // Check if it's NESO (within small tolerance)
  if (Math.abs(lng - nesoLng) < 0.01 && Math.abs(lat - nesoLat) < 0.01) {
    return 'NESO';
  }
  
  // Check if it's a known customer location
  const customerLocations = {
    'London': [-0.1276, 51.5074],
    'Birmingham': [-1.9026, 52.4797],
    'Manchester': [-2.2426, 53.4808],
    'Edinburgh': [-3.1883, 55.9533],
    'Glasgow': [-4.2518, 55.8642]
  };
  
  for (const [name, [customerLng, customerLat]] of Object.entries(customerLocations)) {
    if (Math.abs(lng - customerLng) < 0.1 && Math.abs(lat - customerLat) < 0.1) {
      return `Customer-${name}`;
    }
  }
  
  // Check if it's an interconnector endpoint
  if (lng > 1 && lat < 52) return 'IC-South';
  if (lng > 0 && lat > 53) return 'IC-Denmark';
  if (lng < -4) return 'IC-Ireland';
  
  // Check if it's a gas facility
  if (lng > -1 && lng < 1 && lat > 51 && lat < 53) return 'Gas-Facility';
  
  // Check if it's a wind turbine
  if (lat > 54) return 'Wind-Turbine';
  
  return `Unknown(${lng.toFixed(2)}, ${lat.toFixed(2)})`;
};

const createFlyingMoney = (from: [number, number], to: [number, number]) => {
  // Wait 1 second before creating money to avoid map transition interference
  setTimeout(() => {
    const mapInstance = (window as WindowWithGeoJSON).mapInstance;
    if (!mapInstance) return;

    // Convert coordinates
    const startPixel = mapInstance.project(from);
    const endPixel = mapInstance.project(to);
    
    // Create money element
    const money = document.createElement('div');
    money.textContent = '💷';
    money.style.position = 'absolute';
    money.style.fontSize = '24px';
    money.style.left = startPixel.x + 'px';
    money.style.top = startPixel.y + 'px';
    money.style.transition = 'all 3s ease-out';
    money.style.pointerEvents = 'none';
    money.style.zIndex = '999';
    money.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
    
    // Add to map
    mapInstance.getContainer().appendChild(money);
    
    console.log('💷 Money:', startPixel.x, startPixel.y, '→', endPixel.x, endPixel.y);
    
    // Animate
    setTimeout(() => {
      money.style.left = endPixel.x + 'px';
      money.style.top = endPixel.y + 'px';
      money.style.opacity = '0';
    }, 100);
    
    // Remove
    setTimeout(() => money.remove(), 3500);
  }, 1000);
};

// Customer-to-NESO animation system (reverse direction)
const startCustomerToNesoAnimation = () => {
  if (customerToNesoAnimationInterval) {
    console.log('⚠️ Customer animation already running, skipping');
    return; // Already running
  }
  
  console.log('🚀 Starting customer-to-NESO animation');
  const nesoLocation = [-1.5684551896500056, 52.274893556845626]; // NESO pin location
  
  // Constantine customer locations (24 customers - 20% reduction from 30)
  const customerLocations = [
    // Key UK cities (matching the map layer)
    [-0.1276, 51.5074], // London
    [-1.9026, 52.4797], // Birmingham
    [-2.2426, 53.4808], // Manchester
    [-1.5491, 53.3811], // Sheffield
    [-3.1883, 55.9533], // Edinburgh
    [-4.2518, 55.8642], // Glasgow
    [-1.6131, 54.9783], // Newcastle
    [-2.9916, 53.4084], // Liverpool
    [-1.0873, 51.4545], // Reading
    [-2.5879, 51.4543], // Bristol
    [-1.1398, 52.6369], // Leicester
    [-1.8904, 52.8007], // Stoke
    [0.7158, 52.3676],  // Norwich (East England)
    [-1.2577, 51.7520], // Luton
    [-0.5792, 51.4816], // Slough
    [-2.7916, 53.2611], // Warrington
    [-1.4659, 50.9097], // Southampton
    [-3.5339, 50.7236], // Exeter
    [-2.1269, 52.2068], // Worcester
    [-0.9781, 52.4058], // Northampton
    [-1.0832, 51.2802], // Basingstoke
    [-3.2017, 51.4816], // Cardiff
    [-4.4802, 51.6214], // Swansea
    [-1.2620, 54.5429]  // Middlesbrough
  ];
  
  // Create money animations from customers to NESO every 800ms (doubled flow)
  customerToNesoAnimationInterval = setInterval(() => {
    // Double the money flow - 6 money emojis per interval instead of 3
    const randomCustomer1 = customerLocations[Math.floor(Math.random() * customerLocations.length)];
    createFlyingMoney(randomCustomer1, nesoLocation);
    
    setTimeout(() => {
      const randomCustomer2 = customerLocations[Math.floor(Math.random() * customerLocations.length)];
      createFlyingMoney(randomCustomer2, nesoLocation);
    }, 150);
    
    setTimeout(() => {
      const randomCustomer3 = customerLocations[Math.floor(Math.random() * customerLocations.length)];
      createFlyingMoney(randomCustomer3, nesoLocation);
    }, 300);
    
    setTimeout(() => {
      const randomCustomer4 = customerLocations[Math.floor(Math.random() * customerLocations.length)];
      createFlyingMoney(randomCustomer4, nesoLocation);
    }, 450);
    
    setTimeout(() => {
      const randomCustomer5 = customerLocations[Math.floor(Math.random() * customerLocations.length)];
      createFlyingMoney(randomCustomer5, nesoLocation);
    }, 600);
    
    setTimeout(() => {
      const randomCustomer6 = customerLocations[Math.floor(Math.random() * customerLocations.length)];
      createFlyingMoney(randomCustomer6, nesoLocation);
    }, 750);
  }, 800);
};

const stopCustomerToNesoAnimation = () => {
  if (customerToNesoAnimationInterval) {
    clearInterval(customerToNesoAnimationInterval);
    customerToNesoAnimationInterval = null;
  }
  
  // Remove any existing customer money elements
  document.querySelectorAll('.flying-money').forEach(el => el.remove());
};

export const StoryMap = forwardRef<StoryMapHandle, StoryMapProps>(function StoryMap({ data, currentStep, onStepComplete }: StoryMapProps, ref) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapOffset, setMapOffset] = useState<[number, number]>([0, 0]);
  const animationFrameRef = useRef<number | null>(null);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Get latest data point for current flows
  const latestData = data[data.length - 1] || {};

  // Loading screen animation
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    
    const animateProgress = () => {
      const staggerPoint = Math.floor(Math.random() * 50) + 20; // Random between 20-70%
      let progress = 0;
      
      progressInterval = setInterval(() => {
        if (progress < staggerPoint) {
          progress += Math.random() * 3 + 1; // Fast progress initially
        } else if (progress < staggerPoint + 5) {
          progress += Math.random() * 0.5; // Slow down at stagger point
        } else if (progress < 100) {
          progress += Math.random() * 4 + 2; // Resume fast progress
        }
        
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
          
          // Wait 1 second then fade out (the CSS transition handles the smooth fade)
          setTimeout(() => {
            setShowLoadingScreen(false);
          }, 3000); // Give time for the fade transition to complete
        }
        
        setLoadingProgress(Math.min(progress, 100));
      }, 50);
    };
    
    // Start loading animation immediately
    animateProgress();
    
    return () => {
      clearInterval(progressInterval);
    };
  }, []);

  // Calculate map offset based on panel width
  useEffect(() => {
    const handleResize = () => {
      // Tailwind's 'md' breakpoint is 768px.
      // Panel widths are 500px and 550px. We offset by a fraction of this to feel natural.
      if (window.innerWidth >= 768) {
        setMapOffset([180, 0]); // Reduced from 275
      } else {
        setMapOffset([165, 0]); // Reduced from 250
      }
    };

    handleResize(); // Set initial offset on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

    // Store map instance globally for money animation coordinate conversion
    (window as WindowWithGeoJSON).mapInstance = map.current;

    map.current.on('load', async () => {
      setMapLoaded(true);
      
      if (!map.current) return;
      
      // Load and add boundary data
      try {
        const response = await fetch(BOUNDARIES_GEOJSON_URL);
        const boundariesData = await response.json();
        
        // Filter for B6-related boundaries only
        const b6Boundaries = (boundariesData as GeoJSONData).features.filter((feature: GeoJSONFeature) => 
          feature.properties.Boundary_n && feature.properties.Boundary_n.includes('B6')
        );

        if (b6Boundaries.length > 0) {
          // Add B6 boundary source
          map.current!.addSource('b6-boundary', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: b6Boundaries
            }
          });

          // Add B6 boundary line layer (initially hidden)
          map.current!.addLayer({
            id: 'b6-boundary-line',
            type: 'line',
            source: 'b6-boundary',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
              'visibility': 'none'
            },
            paint: {
              'line-color': '#ff4444',
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                3, 2,    // At zoom 3, width is 2px
                6, 4,    // At zoom 6, width is 4px
                10, 6    // At zoom 10, width is 6px
              ],
              'line-opacity': 0.9
            },
            filter: ['in', '$type', 'LineString'],
            minzoom: 3  // Show from zoom level 3
          });

          // Add B6 boundary labels
          map.current!.addLayer({
            id: 'b6-boundary-labels',
            type: 'symbol',
            source: 'b6-boundary',
            layout: {
              'text-field': ['concat', ['get', 'Boundary_n'], ' (', ['get', 'Capability'], ')'],
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-size': 14,
              'text-anchor': 'center',
              'symbol-placement': 'line',
              'text-rotation-alignment': 'map'
            },
            paint: {
              'text-color': '#ffffff',
              'text-halo-color': '#ff4444',
              'text-halo-width': 2
            }
          });
        }
      } catch (error) {
        console.error('Error loading boundary data:', error);
      }

      // Load and add circuit lines data
      try {
        const response = await fetch(CIRCUIT_LINES_GEOJSON_URL);
        const circuitLinesData = await response.json();
        
        // Add circuit lines source
        map.current!.addSource('circuit-lines', {
          type: 'geojson',
          data: circuitLinesData
        });

        // Add circuit lines layer - only 275kV and 400kV transmission lines
        map.current!.addLayer({
          id: 'circuit-lines',
          type: 'line',
          source: 'circuit-lines',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': [
              'case',
              ['==', ['get', 'Capacity'], '275kV'], '#1d4ed8',  // Brighter blue for 275kV
              ['==', ['get', 'Capacity'], '400kV'], '#9333ea',  // Brighter purple for 400kV
              '#9333ea'  // Default to brighter purple (shouldn't be used due to filter)
            ],
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              4, [
                'case',
                ['==', ['get', 'Capacity'], '400kV'], 1.5,  // 400kV slightly thicker
                1.2  // 275kV
              ],
              8, [
                'case',
                ['==', ['get', 'Capacity'], '400kV'], 2.5,  // 400kV thicker at high zoom
                2    // 275kV
              ]
            ],
            'line-opacity': 0.8
          },
          filter: [
            'any',
            ['==', ['get', 'Capacity'], '275kV'],
            ['==', ['get', 'Capacity'], '400kV']
          ],
          minzoom: 4  // Show from zoom level 4
        });

        // Add circuit lines labels for major transmission lines
        map.current!.addLayer({
          id: 'circuit-lines-labels',
          type: 'symbol',
          source: 'circuit-lines',
          layout: {
            'text-field': ['get', 'Capacity'],
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-size': 10,
            'text-anchor': 'center',
            'symbol-placement': 'line',
            'text-rotation-alignment': 'map',
            'text-pitch-alignment': 'viewport'
          },
          paint: {
            'text-color': [
              'case',
              ['==', ['get', 'Capacity'], '275kV'], '#1d4ed8',  // Brighter blue text for 275kV
              ['==', ['get', 'Capacity'], '400kV'], '#9333ea',  // Brighter purple text for 400kV
              '#ffffff'  // Default white (shouldn't be used)
            ],
            'text-halo-color': '#ffffff',  // White halo instead of black
            'text-halo-width': 2
          },
          filter: [
            'any',
            ['==', ['get', 'Capacity'], '275kV'],
            ['==', ['get', 'Capacity'], '400kV']
          ],
          minzoom: 6  // Show labels at higher zoom to avoid clutter
        });

      } catch (error) {
        console.error('Error loading circuit lines data:', error);
      }

      // Load and add wind turbine data from GeoJSON
      try {
        const response = await fetch(REPD_GEOJSON_URL);
        const repdData = await response.json();
        
        // Filter for operational onshore wind turbines over 20MW (excluding Northern Ireland)
        const windTurbineFeatures = (repdData as GeoJSONData).features.filter((feature: GeoJSONFeature) => {
          const props = feature.properties;
          const capacity = parseFloat(props['Installed Capacity (MWelec)']) || 0;
          const technologyType = props['Technology Type']?.toLowerCase() || '';
          const status = props['Development Status (short)']?.toLowerCase() || '';
          const country = props['Country']?.toLowerCase() || '';
          
          const isOnshoreWind = technologyType === 'wind onshore';
          const isOperational = status === 'operational' || status === 'under construction';
          const isOver20MW = capacity >= 20;
          const hasCoordinates = feature.geometry && feature.geometry.coordinates;
          const isNotNorthernIreland = country !== 'northern ireland';
          
          return isOnshoreWind && isOperational && isOver20MW && hasCoordinates && isNotNorthernIreland;
        });

        console.log('=== REPD GEOJSON FILTERING DEBUG ===');
        console.log(`Total features in GeoJSON: ${repdData.features.length}`);
        console.log(`Wind onshore projects: ${(repdData as GeoJSONData).features.filter((f: GeoJSONFeature) => f.properties['Technology Type']?.toLowerCase() === 'wind onshore').length}`);
        console.log(`Operational + Under Construction: ${(repdData as GeoJSONData).features.filter((f: GeoJSONFeature) => {
          const status = f.properties['Development Status (short)']?.toLowerCase();
          return status === 'operational' || status === 'under construction';
        }).length}`);
        
        // Check Northern Ireland exclusion
        const northernIrelandWindFarms = (repdData as GeoJSONData).features.filter((f: GeoJSONFeature) => {
          const props = f.properties;
          const technologyType = props['Technology Type']?.toLowerCase() || '';
          const country = props['Country']?.toLowerCase() || '';
          return technologyType === 'wind onshore' && country === 'northern ireland';
        });
        console.log(`Northern Ireland wind farms excluded: ${northernIrelandWindFarms.length}`);
        
        console.log(`Final wind turbines (excluding NI): ${windTurbineFeatures.length}`);
        console.log('===================================');

        if (windTurbineFeatures.length > 0) {
          // Create GeoJSON with filtered features
          const windTurbineGeoJSON = {
            type: 'FeatureCollection',
            features: windTurbineFeatures.map((feature: GeoJSONFeature) => ({
              ...feature,
              properties: {
                ...feature.properties,
                name: feature.properties['Site Name'] || 'Wind Farm',
                capacity: parseFloat(feature.properties['Installed Capacity (MWelec)']),
                operator: feature.properties['Operator (or Applicant)'] || 'Unknown'
              }
            }))
          };

          // Add wind turbine source with rotation property
          const windTurbineGeoJSONWithRotation = {
            ...windTurbineGeoJSON,
            features: windTurbineGeoJSON.features.map((feature: GeoJSONFeature) => ({
              ...feature,
              properties: {
                ...feature.properties,
                rotation: 0 // Initial rotation
              }
            }))
          };

          map.current!.addSource('wind-turbines', {
            type: 'geojson',
            data: windTurbineGeoJSONWithRotation
          });

          // Add wind turbine poles (bottom layer) - initially hidden
          map.current!.addLayer({
            id: 'wind-turbine-poles',
            type: 'symbol',
            source: 'wind-turbines',
            layout: {
              'text-field': '|', // Vertical line for the pole
              'visibility': 'none',
              'text-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                4, 8,    // 8px at zoom 4 (much smaller)
                8, 10,   // 10px at zoom 8
                12, 12   // 12px at zoom 12+
              ],
              'text-allow-overlap': true,
              'text-ignore-placement': true,
              'text-offset': [0, 0.8] // Offset down to position under the turbine
            },
            paint: {
              'text-color': '#6b7280', // Gray color for the pole
              'text-halo-color': '#ffffff',
              'text-halo-width': 1,
              'text-opacity': 0.8
            },
            minzoom: 4
          });

          // Add wind turbine fan symbols (top layer) - initially hidden
          map.current!.addLayer({
            id: 'wind-turbines',
            type: 'symbol',
            source: 'wind-turbines',
            layout: {
              'text-field': '❋', // Fan-like symbol that looks like turbine blades
              'visibility': 'none',
              'text-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                4, 14,   // 14px at zoom 4
                8, 18,   // 18px at zoom 8
                12, 22   // 22px at zoom 12+
              ],
              'text-allow-overlap': true,
              'text-ignore-placement': true,
              'text-rotate': ['get', 'rotation']
            },
            paint: {
              'text-color': '#6b7280', // Gray color for the turbines
              'text-halo-color': '#ffffff',
              'text-halo-width': 2,
              'text-opacity': 0.9
            },
            minzoom: 4
          });

          // Create spinning animation
          let rotationAngle = 0;
          const animateWindTurbines = () => {
            if (!map.current || !map.current.getSource('wind-turbines')) return;
            
            rotationAngle += 0.5; // Increase rotation by 0.5 degrees each frame (slower spin)
            if (rotationAngle >= 360) rotationAngle = 0;
            
            // Update the rotation property for all features
            const updatedGeoJSON = {
              ...windTurbineGeoJSONWithRotation,
              features: windTurbineGeoJSONWithRotation.features.map((feature: GeoJSONFeature) => ({
                ...feature,
                properties: {
                  ...feature.properties,
                  rotation: rotationAngle
                }
              }))
            };
            
            const source = map.current!.getSource('wind-turbines') as mapboxgl.GeoJSONSource;
            source.setData(updatedGeoJSON);
            
            animationFrameRef.current = requestAnimationFrame(animateWindTurbines);
          };
          
          // Start the animation
          animateWindTurbines();

          console.log(`✅ Loaded ${windTurbineFeatures.length} operational + under construction onshore wind farms over 20MW`);
          
          // Debug: Log sample wind farms
          windTurbineFeatures.slice(0, 5).forEach((feature: GeoJSONFeature, index: number) => {
            const props = feature.properties;
            const [lon, lat] = feature.geometry.coordinates;
            console.log(`${index + 1}. ${props['Site Name']}: (${lon.toFixed(4)}, ${lat.toFixed(4)}) [${props['Installed Capacity (MWelec)']}MW]`);
          });
        }

      } catch (error) {
        console.error('Error loading wind turbine GeoJSON data:', error);
      }

      // Load and add landfill gas facilities
      try {
        const response = await fetch(GAS_GEOJSON_URL);
        if (!response.ok) {
          throw new Error(`Failed to fetch gas data: ${response.status} ${response.statusText}`);
        }
        
        const gasData = await response.json();
        
        // Validate GeoJSON structure
        if (!gasData || !gasData.features || !Array.isArray(gasData.features)) {
          console.warn('Invalid or empty gas GeoJSON data structure:', gasData);
          throw new Error('Invalid GeoJSON structure for gas facilities');
        }
        
        // Filter for operational landfill gas facilities over 5MW
        const gasFacilityFeatures = gasData.features.filter((feature: GeoJSONFeature) => {
          // Validate feature structure
          if (!feature || !feature.properties || !feature.geometry) {
            return false;
          }
          
          const props = feature.properties;
          const capacity = parseFloat(props['Installed Capacity (MWelec)']) || 0;
          const technologyType = props['Technology Type']?.toLowerCase() || '';
          const status = props['Development Status (short)']?.toLowerCase() || '';
          
          return capacity >= 5 && 
                 technologyType.includes('landfill gas') && 
                 status === 'operational';
        });

        console.log('===== Gas Facilities Debug =====');
        console.log(`Total gas features: ${gasData.features.length}`);
        console.log(`Valid features with properties: ${gasData.features.filter((f: GeoJSONFeature) => f && f.properties && f.geometry).length}`);
        
        // Debug technology types in the data
        const techTypes = gasData.features
          .filter((f: GeoJSONFeature) => f && f.properties)
          .map((f: GeoJSONFeature) => f.properties['Technology Type'])
          .filter((tech: string | undefined) => tech)
          .slice(0, 10);
        console.log('Sample technology types:', techTypes);
        
        // Debug landfill gas specifically
        const landfillGasFeatures = gasData.features.filter((f: GeoJSONFeature) => {
          const tech = f.properties?.['Technology Type']?.toLowerCase() || '';
          return tech.includes('landfill') || tech.includes('gas');
        });
        console.log(`Features with 'landfill' or 'gas' in technology: ${landfillGasFeatures.length}`);
        
        console.log(`Operational landfill gas facilities ≥5MW: ${gasFacilityFeatures.length}`);
        console.log('===================================');

        if (gasFacilityFeatures.length > 0) {
          // Create GeoJSON with filtered features
          const gasFacilityGeoJSON = {
            type: 'FeatureCollection',
            features: gasFacilityFeatures.map((feature: GeoJSONFeature) => ({
              ...feature,
              properties: {
                ...feature.properties,
                name: feature.properties['Site Name'] || 'Gas Facility',
                capacity: parseFloat(feature.properties['Installed Capacity (MWelec)']),
                operator: feature.properties['Operator (or Applicant)'] || 'Unknown'
              }
            }))
          };

          // Store gas facility data for later layer creation
          window.gasFacilityGeoJSON = gasFacilityGeoJSON;

          console.log(`✅ Loaded ${gasFacilityFeatures.length} operational landfill gas facilities over 5MW`);
          
          // Debug: Log sample gas facilities
          gasFacilityFeatures.slice(0, 5).forEach((feature: GeoJSONFeature, index: number) => {
            const props = feature.properties;
            const [lon, lat] = feature.geometry.coordinates;
            console.log(`${index + 1}. ${props['Site Name']}: (${lon.toFixed(4)}, ${lat.toFixed(4)}) [${props['Installed Capacity (MWelec)']}MW]`);
          });
        }

      } catch (error) {
        console.error('Error loading gas facility GeoJSON data:', error);
        console.warn('Gas facilities layer will not be displayed. App will continue without gas data.');
        // App continues to function without gas facilities
      }

      // Load and add Eastern Green Link 2 transmission line
      try {
        const egl2Response = await fetch(EGL2_GEOJSON_URL);
        if (!egl2Response.ok) {
          throw new Error(`Failed to fetch EGL2 data: ${egl2Response.status} ${egl2Response.statusText}`);
        }
        
        const egl2Data = await egl2Response.json();
        
        // Validate GeoJSON structure
        if (!egl2Data || !egl2Data.features || !Array.isArray(egl2Data.features)) {
          console.warn('Invalid EGL2 GeoJSON data structure:', egl2Data);
          throw new Error('Invalid GeoJSON structure for EGL2');
        }
        
        map.current!.addSource('egl2-line', {
          type: 'geojson',
          data: egl2Data
        });

        // Add EGL2 transmission line layer (initially hidden)
        map.current!.addLayer({
          id: 'egl2-line',
          type: 'line',
          source: 'egl2-line',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
            'visibility': 'none'
          },
          paint: {
            'line-color': '#10b981', // Green color for Eastern Green Link
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              3, 2,    // 2px at low zoom
              6, 3,    // 3px at mid zoom
              10, 4    // 4px at high zoom
            ],
            'line-opacity': 0.8
          },
          minzoom: 3
        });

        // Add EGL2 label layer (initially hidden)
        map.current!.addLayer({
          id: 'egl2-labels',
          type: 'symbol',
          source: 'egl2-line',
          layout: {
            'text-field': 'Eastern Green Link 2',
            'visibility': 'none',
            'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
            'text-size': 11,
            'text-anchor': 'center',
            'symbol-placement': 'line',
            'text-rotation-alignment': 'map',
            'text-allow-overlap': false,
            'text-ignore-placement': false
          },
          paint: {
            'text-color': '#10b981',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2
          },
          minzoom: 5
        });

        console.log(`✅ Loaded Eastern Green Link 2 transmission line with ${egl2Data.features.length} features`);
        
      } catch (error) {
        console.error('Error loading EGL2 transmission line data:', error);
        console.warn('EGL2 transmission line will not be displayed. App will continue without EGL2 data.');
      }

      // Load and add countries with pricing zone labels
      try {
        const countriesResponse = await fetch(COUNTRIES_GEOJSON_URL);
        if (!countriesResponse.ok) {
          throw new Error(`Failed to fetch countries data: ${countriesResponse.status} ${countriesResponse.statusText}`);
        }
        
        const countriesData = await countriesResponse.json();
        
        // Validate GeoJSON structure
        if (!countriesData || !countriesData.features || !Array.isArray(countriesData.features)) {
          console.warn('Invalid countries GeoJSON data structure:', countriesData);
          throw new Error('Invalid GeoJSON structure for countries');
        }

        // Transform features to add pricing zone labels
        const transformedCountriesData = {
          ...countriesData,
          features: (countriesData as GeoJSONData).features.map((feature: GeoJSONFeature) => {
            const countryName = feature.properties?.CTRY21NM || '';
            let pricingZoneLabel = '';
            
            if (countryName.toLowerCase().includes('england') || countryName.toLowerCase().includes('wales')) {
              pricingZoneLabel = 'English Pricing Zone';
            } else if (countryName.toLowerCase().includes('scotland')) {
              pricingZoneLabel = 'Scottish Pricing Zone';
            } else {
              pricingZoneLabel = countryName; // Fallback to original name
            }
            
            return {
              ...feature,
              properties: {
                ...feature.properties,
                pricingZone: pricingZoneLabel
              }
            };
          })
        };
        
        map.current!.addSource('countries', {
          type: 'geojson',
          data: transformedCountriesData
        });

        // Add countries fill layer (subtle background) - initially hidden
        map.current!.addLayer({
          id: 'countries-fill',
          type: 'fill',
          source: 'countries',
          layout: {
            'visibility': 'none'
          },
          paint: {
            'fill-color': [
              'case',
              ['==', ['get', 'pricingZone'], 'English Pricing Zone'], '#e0f2fe', // Light blue for English zone
              ['==', ['get', 'pricingZone'], 'Scottish Pricing Zone'], '#f3e5f5', // Light purple for Scottish zone
              '#f5f5f5' // Light gray fallback
            ],
            'fill-opacity': 0.1
          },
          minzoom: 3
        });

        // Add countries outline (initially hidden)
        map.current!.addLayer({
          id: 'countries-outline',
          type: 'line',
          source: 'countries',
          layout: {
            'visibility': 'none'
          },
          paint: {
            'line-color': [
              'case',
              ['==', ['get', 'pricingZone'], 'English Pricing Zone'], '#0277bd', // Blue for English zone
              ['==', ['get', 'pricingZone'], 'Scottish Pricing Zone'], '#7b1fa2', // Purple for Scottish zone
              '#757575' // Gray fallback
            ],
            'line-width': 2,
            'line-opacity': 0.6
          },
          minzoom: 3
        });

        // Add pricing zone labels (initially hidden)
        map.current!.addLayer({
          id: 'pricing-zone-labels',
          type: 'symbol',
          source: 'countries',
          layout: {
            'text-field': ['get', 'pricingZone'],
            'visibility': 'none',
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              3, 14,   // 14px at zoom 3
              6, 18,   // 18px at zoom 6
              10, 22   // 22px at zoom 10+
            ],
            'text-anchor': 'center',
            'text-allow-overlap': false,
            'text-ignore-placement': false
          },
          paint: {
            'text-color': [
              'case',
              ['==', ['get', 'pricingZone'], 'English Pricing Zone'], '#0277bd', // Blue for English zone
              ['==', ['get', 'pricingZone'], 'Scottish Pricing Zone'], '#7b1fa2', // Purple for Scottish zone
              '#424242' // Dark gray fallback
            ],
            'text-halo-color': '#ffffff',
            'text-halo-width': 2,
            'text-opacity': 0.8
          },
          minzoom: 4
        });

        console.log(`✅ Loaded countries with ${countriesData.features.length} features and pricing zone labels`);
        
      } catch (error) {
        console.error('Error loading countries data:', error);
        console.warn('Countries layer will not be displayed. App will continue without countries data.');
      }

      // Store Constantine customer data for later creation (after images load) - 24 customers (20% reduction)
      const constantineCustomerData = {
        type: 'FeatureCollection',
        features: [
          // Major cities and population centers (keeping key locations)
          { type: 'Feature', geometry: { type: 'Point', coordinates: [-0.1276, 51.5074] }, properties: { name: 'London' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [-1.9026, 52.4797] }, properties: { name: 'Birmingham' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [-2.2426, 53.4808] }, properties: { name: 'Manchester' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [-1.5491, 53.3811] }, properties: { name: 'Sheffield' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [-3.1883, 55.9533] }, properties: { name: 'Edinburgh' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [-4.2518, 55.8642] }, properties: { name: 'Glasgow' } }, // Kept as requested
          { type: 'Feature', geometry: { type: 'Point', coordinates: [-1.6131, 54.9783] }, properties: { name: 'Newcastle' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [-2.9916, 53.4084] }, properties: { name: 'Liverpool' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [-1.0873, 51.4545] }, properties: { name: 'Reading' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [-2.5879, 51.4543] }, properties: { name: 'Bristol' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [-1.1398, 52.6369] }, properties: { name: 'Leicester' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [-1.8904, 52.8007] }, properties: { name: 'Stoke' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [0.7158, 52.3676] }, properties: { name: 'Norwich (East England)' } }, // East England as requested
          { type: 'Feature', geometry: { type: 'Point', coordinates: [-1.2577, 51.7520] }, properties: { name: 'Luton' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [-0.5792, 51.4816] }, properties: { name: 'Slough' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [-2.7916, 53.2611] }, properties: { name: 'Warrington' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [-1.4659, 50.9097] }, properties: { name: 'Southampton' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [-3.5339, 50.7236] }, properties: { name: 'Exeter' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [-2.1269, 52.2068] }, properties: { name: 'Worcester' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [-0.9781, 52.4058] }, properties: { name: 'Northampton' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [-1.0832, 51.2802] }, properties: { name: 'Basingstoke' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [-3.2017, 51.4816] }, properties: { name: 'Cardiff' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [-4.4802, 51.6214] }, properties: { name: 'Swansea' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [-1.2620, 54.5429] }, properties: { name: 'Middlesbrough' } }
        ]
      };
      
      // Store data globally for later use (similar to gas facilities)
      (window as WindowWithGeoJSON).constantineCustomerData = constantineCustomerData;

      // Load and add protected areas
      try {
        // Load National Parks
        const nationalParksResponse = await fetch(NATIONAL_PARKS_GEOJSON_URL);
        const nationalParksData = await nationalParksResponse.json();
        
        map.current!.addSource('national-parks', {
          type: 'geojson',
          data: nationalParksData
        });

        // National Parks fill layer (initially hidden)
        map.current!.addLayer({
          id: 'national-parks-fill',
          type: 'fill',
          source: 'national-parks',
          layout: {
            'visibility': 'none'
          },
          paint: {
            'fill-color': '#22c55e',
            'fill-opacity': 0.15
          },
          minzoom: 5
        });

        // National Parks outline (initially hidden)
        map.current!.addLayer({
          id: 'national-parks-outline',
          type: 'line',
          source: 'national-parks',
          layout: {
            'visibility': 'none'
          },
          paint: {
            'line-color': '#22c55e',
            'line-width': 2,
            'line-opacity': 0.6
          },
          minzoom: 5
        });

        // National Parks labels
        map.current!.addLayer({
          id: 'national-parks-labels',
          type: 'symbol',
          source: 'national-parks',
          layout: {
            'text-field': 'National Park',
            'text-size': 12,
            'text-allow-overlap': false,
            'text-ignore-placement': false
          },
          paint: {
            'text-color': '#166534',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2
          },
          minzoom: 7
        });

        // Load Green Belt
        const greenBeltResponse = await fetch(GREEN_BELT_GEOJSON_URL);
        const greenBeltData = await greenBeltResponse.json();
        
        map.current!.addSource('green-belt', {
          type: 'geojson',
          data: greenBeltData
        });

        // Green Belt fill layer
        map.current!.addLayer({
          id: 'green-belt-fill',
          type: 'fill',
          source: 'green-belt',
          paint: {
            'fill-color': '#84cc16',
            'fill-opacity': 0.1
          },
          minzoom: 6
        });

        // Green Belt outline
        map.current!.addLayer({
          id: 'green-belt-outline',
          type: 'line',
          source: 'green-belt',
          paint: {
            'line-color': '#84cc16',
            'line-width': 1,
            'line-opacity': 0.4
          },
          minzoom: 6
        });

        // Green Belt labels
        map.current!.addLayer({
          id: 'green-belt-labels',
          type: 'symbol',
          source: 'green-belt',
          layout: {
            'text-field': 'Green Belt',
            'text-size': 10,
            'text-allow-overlap': false,
            'text-ignore-placement': false
          },
          paint: {
            'text-color': '#365314',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2
          },
          minzoom: 8
        });

        // Load Areas of Outstanding Natural Beauty
        const aonbResponse = await fetch(AONB_GEOJSON_URL);
        const aonbData = await aonbResponse.json();
        
        map.current!.addSource('aonb', {
          type: 'geojson',
          data: aonbData
        });

        // AONB fill layer
        map.current!.addLayer({
          id: 'aonb-fill',
          type: 'fill',
          source: 'aonb',
          paint: {
            'fill-color': '#0ea5e9',
            'fill-opacity': 0.12
          },
          minzoom: 6
        });

        // AONB outline
        map.current!.addLayer({
          id: 'aonb-outline',
          type: 'line',
          source: 'aonb',
          paint: {
            'line-color': '#0ea5e9',
            'line-width': 1.5,
            'line-opacity': 0.5
          },
          minzoom: 6
        });

        // AONB labels
        map.current!.addLayer({
          id: 'aonb-labels',
          type: 'symbol',
          source: 'aonb',
          layout: {
            'text-field': 'Area of Outstanding Natural Beauty',
            'text-size': 11,
            'text-allow-overlap': false,
            'text-ignore-placement': false
          },
          paint: {
            'text-color': '#0c4a6e',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2
          },
          minzoom: 8
        });

        console.log('✅ Loaded protected areas: National Parks, Green Belt, and AONBs');

      } catch (error) {
        console.error('Error loading protected areas data:', error);
      }

      // Add custom image pin
      try {
        // Load the custom image using Mapbox's loadImage method
        map.current!.loadImage(
          'https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/Google%20Chrome%202025-09-09%2023.54.54.png',
          (error, image) => {
            if (error) {
              console.error('Error loading custom pin image:', error);
              return;
            }

            if (!image || !map.current) return;

            try {
              // Ensure image is properly loaded and has dimensions
              const imgElement = image as HTMLImageElement;
              if (!imgElement.width || !imgElement.height) {
                console.error('Image has invalid dimensions:', imgElement.width, imgElement.height);
                return;
              }

              // Create a canvas to add rounded borders
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              if (!ctx) {
                console.error('Failed to get canvas context');
                return;
              }
              
              const width = 44; // Pin width (20% smaller: 55 * 0.8 = 44)
              const height = 28; // Pin height (20% smaller: 35 * 0.8 = 28)
              const borderRadius = 6; // Rounded corner radius (20% smaller: 8 * 0.8 = 6.4 ≈ 6)
              
              // Set canvas dimensions
              canvas.width = width;
              canvas.height = height;
              
              // Verify canvas has valid dimensions
              if (canvas.width <= 0 || canvas.height <= 0) {
                console.error('Canvas has invalid dimensions:', canvas.width, canvas.height);
                return;
              }
              
              // Clear canvas with transparent background
              ctx.clearRect(0, 0, width, height);
              
              // Create rounded rectangle clipping path using compatible method
              ctx.beginPath();
              const x = 0, y = 0, radius = borderRadius;
              
              // Manual rounded rectangle path for better browser compatibility
              ctx.moveTo(x + radius, y);
              ctx.lineTo(x + width - radius, y);
              ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
              ctx.lineTo(x + width, y + height - radius);
              ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
              ctx.lineTo(x + radius, y + height);
              ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
              ctx.lineTo(x, y + radius);
              ctx.quadraticCurveTo(x, y, x + radius, y);
              ctx.closePath();
              ctx.clip();
              
              // Draw the loaded image onto the canvas
              ctx.drawImage(imgElement, 0, 0, width, height);
              
              // Create ImageData from canvas for Mapbox
              const imageData = ctx.getImageData(0, 0, width, height);
              
              // Verify the canvas has content
              const hasContent = imageData.data.some(pixel => pixel !== 0);
              if (!hasContent) {
                console.error('Canvas appears to be empty after drawing image');
                return;
              }
              
              // Helper function to add map layers
              const addMapLayers = () => {
                if (!map.current) return;
                
                // Add data source for the pin location
                map.current.addSource('custom-pin', {
                  type: 'geojson',
                  data: {
                    type: 'FeatureCollection',
                    features: [{
                      type: 'Feature',
                      geometry: {
                        type: 'Point',
                        coordinates: [-1.5684551896500056, 52.274893556845626]
                      },
                      properties: {
                        name: 'Custom Pin'
                      }
                    }]
                  }
                });
                
                // NESO pin layer will be added at the very end for highest z-index
                // Store the layer config for later use
                (window as WindowWithGeoJSON).nesoPinLayerConfig = {
                  id: 'custom-pin-layer',
                  type: 'symbol',
                  source: 'custom-pin',
                  layout: {
                    'icon-image': 'custom-pin-image',
                    'visibility': 'none',
                    'icon-size': 1,
                    'icon-allow-overlap': true,
                    'icon-ignore-placement': true
                  },
                  paint: {
                    'icon-opacity': 0.9
                  },
                  minzoom: 3
                };
              };

              // Create ImageBitmap for better Mapbox compatibility
              createImageBitmap(canvas).then((imageBitmap) => {
                if (map.current && !map.current.hasImage('custom-pin-image')) {
                  map.current.addImage('custom-pin-image', imageBitmap);
                  addMapLayers();
                  console.log('✅ Successfully added custom pin with rounded borders using ImageBitmap');
                }
              }).catch((bitmapError) => {
                console.error('Error creating ImageBitmap:', bitmapError);
                // Fallback: try with canvas directly
                try {
                  if (map.current && !map.current.hasImage('custom-pin-image')) {
                    map.current.addImage('custom-pin-image', canvas);
                    addMapLayers();
                    console.log('✅ Successfully added custom pin with canvas fallback');
                  }
                } catch (fallbackError) {
                  console.error('Both ImageBitmap and canvas methods failed:', fallbackError);
                }
              });
              
            } catch (canvasError) {
              console.error('Error processing image with canvas:', canvasError);
            }
          }
        );

      } catch (error) {
        console.error('Error adding custom image pin:', error);
      }

      // Load country pin images and gas facility icon
      const loadCountryImages = async () => {
        // Load country flags
        const countryImagePromises = Object.entries(COUNTRY_IMAGES).map(([countryCode, imageUrl]) => {
          return new Promise<void>((resolve) => {
            map.current!.loadImage(imageUrl, (error, image) => {
              if (error) {
                console.warn(`Failed to load ${countryCode} pin image:`, error);
                resolve(); // Continue even if one image fails
                return;
              }
              
              if (image && map.current) {
                map.current.addImage(`country-pin-${countryCode}`, image);
                console.log(`✅ Loaded ${countryCode} pin image`);
              }
              resolve();
            });
          });
        });
        
        // Load gas facility icon
        const gasIconPromise = new Promise<boolean>((resolve) => {
          map.current!.loadImage(GAS_ICON_URL, (error, image) => {
            if (error) {
              console.warn('Failed to load gas facility icon:', error);
              console.warn('Error details:', error);
              resolve(false); // Icon failed to load
              return;
            }
            
            if (image && map.current) {
              try {
                map.current.addImage('gas-facility-icon', image);
                console.log('✅ Loaded gas facility icon successfully');
                resolve(true); // Icon loaded successfully
              } catch (addError) {
                console.warn('Failed to add gas facility icon to map:', addError);
                resolve(false);
              }
            } else {
              console.warn('Gas facility icon or map not available');
              resolve(false);
            }
          });
        });
        
        // Load Constantine figure icon
        const constantineIconPromise = new Promise<boolean>((resolve) => {
          map.current!.loadImage(CONSTANTINE_IMAGE_URL, (error, image) => {
            if (error) {
              console.warn('Failed to load Constantine icon:', error);
              resolve(false);
              return;
            }
            
            if (image && map.current) {
              map.current.addImage('constantine-icon', image);
              console.log('✅ Loaded Constantine icon successfully');
              resolve(true);
            } else {
              resolve(false);
            }
          });
        });

        const results = await Promise.all([...countryImagePromises, gasIconPromise, constantineIconPromise]);
        const gasIconLoaded = results[results.length - 2] as boolean;
        const constantineIconLoaded = results[results.length - 1] as boolean;
        console.log('🏁 All images loaded (countries + gas icon + constantine)');
        
        // Store Constantine icon status for later use
        (window as WindowWithGeoJSON).constantineIconLoaded = constantineIconLoaded;
        
        return gasIconLoaded;
      };

      // Load country images before creating cable routes
      const gasIconLoaded = await loadCountryImages();
      
      // Create gas facilities layer after images are loaded
      if ((window as any).gasFacilityGeoJSON) {
        const gasFacilityGeoJSON = (window as any).gasFacilityGeoJSON;
        
        map.current!.addSource('gas-facilities', {
          type: 'geojson',
          data: gasFacilityGeoJSON
        });

        // Add gas facility symbols using PNG icon (initially hidden)
        if (gasIconLoaded && map.current.hasImage('gas-facility-icon')) {
          map.current!.addLayer({
            id: 'gas-facilities',
            type: 'symbol',
            source: 'gas-facilities',
            layout: {
              'icon-image': 'gas-facility-icon',
              'visibility': 'none',
              'icon-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                4, 0.0234,  // 20% larger: 0.0195 * 1.2 = 0.0234
                8, 0.0312,  // 20% larger: 0.026 * 1.2 = 0.0312
                12, 0.039   // 20% larger: 0.0325 * 1.2 = 0.039
              ],
              'icon-anchor': 'center',
              'icon-allow-overlap': true,
              'icon-ignore-placement': true
            },
            paint: {
              'icon-opacity': 0.9
            },
            minzoom: 4
          });
          console.log('✅ Added gas facilities layer with PNG icon');
        } else {
          // Fallback to Unicode symbol if PNG fails (initially hidden)
          console.warn('Gas facility PNG icon not loaded, using Unicode fallback');
          map.current!.addLayer({
            id: 'gas-facilities',
            type: 'symbol',
            source: 'gas-facilities',
            layout: {
              'text-field': '⬢',
              'visibility': 'none',
              'text-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                4, 12,   // 12px at zoom 4
                8, 16,   // 16px at zoom 8
                12, 20   // 20px at zoom 12+
              ],
              'text-allow-overlap': true,
              'text-ignore-placement': true
            },
            paint: {
              'text-color': '#dc2626',
              'text-halo-color': '#ffffff',
              'text-halo-width': 2,
              'text-opacity': 0.9
            },
            minzoom: 4
          });
        }
        
        // Clean up the temporary storage
        delete (window as any).gasFacilityGeoJSON;
      }

      // Create Constantine customer layer after images are loaded
      if ((window as any).constantineCustomerData && (window as any).constantineIconLoaded && map.current.hasImage('constantine-icon')) {
        const constantineCustomerData = (window as any).constantineCustomerData;
        
        map.current!.addSource('constantine-customers', {
          type: 'geojson',
          data: constantineCustomerData
        });

        // Add Constantine customer layer (initially hidden)
        map.current!.addLayer({
          id: 'constantine-customers',
          type: 'symbol',
          source: 'constantine-customers',
          layout: {
            'icon-image': 'constantine-icon',
            'visibility': 'none',
            'icon-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              4, 0.024375, // 30% larger: 0.01875 * 1.3 = 0.024375
              6, 0.040625, // 30% larger: 0.03125 * 1.3 = 0.040625
              8, 0.056875  // 30% larger: 0.04375 * 1.3 = 0.056875
            ],
            'icon-allow-overlap': true,
            'icon-ignore-placement': true
          },
          paint: {
            'icon-opacity': 0.95  // More opaque (less transparent): 0.8 -> 0.95
          },
          minzoom: 4
        });

        console.log('✅ Added Constantine customer figures across the UK');
        
        // Clean up the temporary storage
        delete (window as any).constantineCustomerData;
      } else {
        console.warn('Constantine icon or data not available, skipping customer figures');
      }

      // Add NESO pin layer LAST for highest z-index (above money and Constantine figures)
      if ((window as any).nesoPinLayerConfig && map.current && map.current.hasImage('custom-pin-image')) {
        const layerConfig = (window as any).nesoPinLayerConfig;
        map.current.addLayer(layerConfig);
        console.log('✅ Added NESO pin layer with highest z-index');
        
        // Clean up the temporary storage
        delete (window as any).nesoPinLayerConfig;
      } else {
        console.warn('NESO pin layer config or image not available');
      }
      
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
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              3, Math.max(1.5, width * 0.7),  // Thinner at low zoom
              6, Math.max(2, width),          // Normal at mid zoom
              10, Math.max(3, width * 1.2)   // Thicker at high zoom
            ],
            'line-opacity': 0.8
          },
          minzoom: 3  // Show from zoom level 3
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
                break;
              case 'NSL':
                countryCode = 'NO';
                countryName = 'Norway';
                break;
              case 'VIKING':
                countryCode = 'DK';
                countryName = 'Denmark';
                break;
              case 'GREENLINK':
                countryCode = 'IE';
                countryName = 'Ireland';
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

          if (isUK) {
            // UK endpoints: Simple small dot, no text or flags
          map.current!.addLayer({
              id: `${endpointId}-circle`,
            type: 'circle',
            source: endpointId,
            paint: {
                'circle-radius': 4.8,  // 20% smaller (was 6, now 4.8)
                'circle-color': '#581ec0',
                'circle-stroke-width': 1.6,  // 20% smaller stroke (was 2, now 1.6)
              'circle-stroke-color': '#ffffff',
                'circle-opacity': 0.9
              },
              minzoom: 4
          });
          } else {
            // Foreign country endpoints: Use PNG pin images
            const imageId = `country-pin-${countryCode}`;

            // Check if the country image was loaded successfully
            if (map.current.hasImage(imageId)) {
          map.current!.addLayer({
                id: `${endpointId}-pin`,
            type: 'symbol',
            source: endpointId,
            layout: {
                  'icon-image': imageId,
                  'icon-size': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    4, 0.24,  // 24% size at zoom 4 (20% smaller than 30%)
                    8, 0.4,   // 40% size at zoom 8 (20% smaller than 50%)
                    12, 0.56  // 56% size at zoom 12+ (20% smaller than 70%)
                  ],
                  'icon-anchor': 'center',
                  'icon-allow-overlap': true,
                  'icon-ignore-placement': true
            },
            paint: {
                  'icon-opacity': 0.9
                },
                minzoom: 4
          });
            } else {
              // Fallback to emoji if PNG failed to load
              console.warn(`Country image ${imageId} not loaded, using emoji fallback`);
          map.current!.addLayer({
                id: `${endpointId}-pin`,
            type: 'symbol',
            source: endpointId,
            layout: {
                  'text-field': '📍',
                  'text-size': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    4, 12,   // 12px at zoom 4
                    8, 16,   // 16px at zoom 8
                    12, 20   // 20px at zoom 12+
                  ],
              'text-anchor': 'center',
              'text-allow-overlap': true,
              'text-ignore-placement': true
            },
            paint: {
                  'text-opacity': 0.9,
                  'text-halo-color': '#ffffff',
              'text-halo-width': 1
                },
                minzoom: 4
              });
            }
            }
        });
      });
    });

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      stopFlyingMoneyAnimation();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const flyToCurrentStep = useCallback(() => {
    if (!map.current) return;
    map.current.flyTo({
        center: currentStep.mapCenter,
        zoom: currentStep.mapZoom,
        bearing: currentStep.mapBearing || 0,
        pitch: currentStep.mapPitch || 44.42,
        duration: currentStep.duration,
      essential: true,
      offset: mapOffset
      });

      if (onStepComplete) {
        setTimeout(() => {
          onStepComplete();
        }, currentStep.duration + 500);
      }
    }, [currentStep, mapOffset, onStepComplete]);

  // Expose imperative handle to recenter map
  useImperativeHandle(ref, () => ({
    recenter: () => flyToCurrentStep()
  }), [flyToCurrentStep]);

  // Control layer visibility based on current step
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    // Control B6 boundary layer visibility
    const showB6Boundary = currentStep.layers?.includes('b6-boundary') || currentStep.layers?.includes('b6-boundary-line');
    
    // Control circuit lines layer visibility (always visible)
    const showCircuitLines = true; // Always show circuit lines
    
    // Control wind turbines layer visibility
    const showWindTurbines = currentStep.layers?.includes('wind-turbines') || currentStep.layers?.includes('wind-north') || currentStep.layers?.includes('wind-curtailment-icons');
    
    // Control gas facilities layer visibility
    const showGasFacilities = currentStep.layers?.includes('gas-facilities') || currentStep.layers?.includes('landfill-gas');
    
    // Hide interconnector cables and endpoints during gas and wind payment steps to reduce confusion
    const hideInterconnectorsForPayments = currentStep.title?.includes('NESO Pays Wind') || currentStep.title?.includes('NESO Pays Gas');
    
    // Control EGL2 transmission line visibility
    const showEGL2 = currentStep.layers?.includes('egl2-line') || currentStep.layers?.includes('eastern-green-link-2') || currentStep.layers?.includes('egl2');
    
    // Control countries/pricing zones visibility
    const showCountries = currentStep.layers?.includes('countries') || currentStep.layers?.includes('pricing-zones') || currentStep.layers?.includes('zones');
    
    // Debug: Log countries visibility state
    if (showCountries) {
      console.log(`🗺️ Step ${currentStep.id}: Showing countries/pricing zones`, {
        stepTitle: currentStep.title,
        layers: currentStep.layers,
        showCountries
      });
    }
    
    // Control NESO pin visibility (only when NESO is mentioned in title)
    const showNESO = currentStep.title?.includes('NESO') || false;
    
    // Control Constantine customers visibility
    const showConstantineCustomers = currentStep.layers?.includes('constantine-customers') || false;
    
    // Control protected areas layer visibility
    const showProtectedAreas = currentStep.layers?.includes('protected-areas') || currentStep.layers?.includes('national-parks') || currentStep.layers?.includes('green-belt') || currentStep.layers?.includes('aonb');
    
    try {
      if (map.current.getLayer('b6-boundary-line')) {
        map.current.setLayoutProperty('b6-boundary-line', 'visibility', showB6Boundary ? 'visible' : 'none');
      }
      // B6 boundary labels are always visible
      if (map.current.getLayer('b6-boundary-labels')) {
        map.current.setLayoutProperty('b6-boundary-labels', 'visibility', 'visible');
      }
      
      // Control circuit lines visibility
      if (map.current.getLayer('circuit-lines')) {
        map.current.setLayoutProperty('circuit-lines', 'visibility', showCircuitLines ? 'visible' : 'none');
      }
      if (map.current.getLayer('circuit-lines-labels')) {
        map.current.setLayoutProperty('circuit-lines-labels', 'visibility', showCircuitLines ? 'visible' : 'none');
      }
      
      // Control wind turbines visibility (both poles and turbines)
      if (map.current.getLayer('wind-turbine-poles')) {
        map.current.setLayoutProperty('wind-turbine-poles', 'visibility', showWindTurbines ? 'visible' : 'none');
      }
      if (map.current.getLayer('wind-turbines')) {
        map.current.setLayoutProperty('wind-turbines', 'visibility', showWindTurbines ? 'visible' : 'none');
      }
      
      // Control gas facilities visibility
      if (map.current.getLayer('gas-facilities')) {
        map.current.setLayoutProperty('gas-facilities', 'visibility', showGasFacilities ? 'visible' : 'none');
      }
      
      // Control EGL2 transmission line visibility
      if (map.current.getLayer('egl2-line')) {
        map.current.setLayoutProperty('egl2-line', 'visibility', showEGL2 ? 'visible' : 'none');
      }
      if (map.current.getLayer('egl2-labels')) {
        map.current.setLayoutProperty('egl2-labels', 'visibility', showEGL2 ? 'visible' : 'none');
      }
      
      // Hide interconnector cables during gas and wind payment steps
      if (hideInterconnectorsForPayments) {
        Object.keys(CABLE_ROUTES).forEach(cableKey => {
          const cableLayerId = `cable-${cableKey}`;
          if (map.current.getLayer(cableLayerId)) {
            map.current.setLayoutProperty(cableLayerId, 'visibility', 'none');
          }
          // Also hide endpoint layers
          const endpointLayerId = `${cableKey}-endpoints`;
          if (map.current.getLayer(endpointLayerId)) {
            map.current.setLayoutProperty(endpointLayerId, 'visibility', 'none');
          }
          // Hide UK endpoint layers
          const ukEndpointLayerId = `${cableKey}-uk-endpoints`;
          if (map.current.getLayer(ukEndpointLayerId)) {
            map.current.setLayoutProperty(ukEndpointLayerId, 'visibility', 'none');
          }
          // Hide foreign endpoint layers
          const foreignEndpointLayerId = `${cableKey}-foreign-endpoints`;
          if (map.current.getLayer(foreignEndpointLayerId)) {
            map.current.setLayoutProperty(foreignEndpointLayerId, 'visibility', 'none');
          }
        });
        
        if (currentStep.title?.includes('NESO Pays')) {
          console.log('🔇 Hidden interconnector cables for payment step:', currentStep.title);
        }
      } else {
        // Show cables when not in payment steps
        Object.keys(CABLE_ROUTES).forEach(cableKey => {
          const cableLayerId = `cable-${cableKey}`;
          if (map.current.getLayer(cableLayerId)) {
            map.current.setLayoutProperty(cableLayerId, 'visibility', 'visible');
          }
          // Show endpoint layers
          const endpointLayerId = `${cableKey}-endpoints`;
          if (map.current.getLayer(endpointLayerId)) {
            map.current.setLayoutProperty(endpointLayerId, 'visibility', 'visible');
          }
          // Show UK endpoint layers
          const ukEndpointLayerId = `${cableKey}-uk-endpoints`;
          if (map.current.getLayer(ukEndpointLayerId)) {
            map.current.setLayoutProperty(ukEndpointLayerId, 'visibility', 'visible');
          }
          // Show foreign endpoint layers
          const foreignEndpointLayerId = `${cableKey}-foreign-endpoints`;
          if (map.current.getLayer(foreignEndpointLayerId)) {
            map.current.setLayoutProperty(foreignEndpointLayerId, 'visibility', 'visible');
          }
        });
      }
      
      // Control countries/pricing zones visibility
      const countryLayers = ['countries-fill', 'countries-outline', 'pricing-zone-labels'];
      countryLayers.forEach(layerId => {
        if (map.current.getLayer(layerId)) {
          map.current.setLayoutProperty(layerId, 'visibility', showCountries ? 'visible' : 'none');
          if (showCountries) {
            console.log(`✅ Set ${layerId} to visible`);
          }
        } else if (showCountries) {
          console.warn(`❌ Layer ${layerId} not found on map`);
        }
      });
      
      // Control NESO pin visibility
      if (map.current.getLayer('custom-pin-layer')) {
        map.current.setLayoutProperty('custom-pin-layer', 'visibility', showNESO ? 'visible' : 'none');
      }
      
      // Control Constantine customers visibility
      if (map.current.getLayer('constantine-customers')) {
        map.current.setLayoutProperty('constantine-customers', 'visibility', showConstantineCustomers ? 'visible' : 'none');
      }
      
      // Handle flying money animations for NESO steps
      // Only run NESO-to-targets animation if Constantine customers are NOT visible
      console.log('💰 MONEY DEBUG:', {
        showNESO,
        showConstantineCustomers,
        mapLoaded: !!map.current,
        stepTitle: currentStep.title,
        shouldStartNESO: showNESO && !showConstantineCustomers && map.current
      });
      
      if (showNESO && !showConstantineCustomers && map.current) {
        console.log('🎯 Starting NESO-to-targets animation for step:', currentStep.title);
        stopCustomerToNesoAnimation(); // Stop customer animation first
        stopFlyingMoneyAnimation(); // Stop any existing NESO animation first
        startFlyingMoneyAnimation(currentStep);
      } else if (!showNESO || showConstantineCustomers) {
        console.log('🛑 Stopping NESO animation - conditions not met');
        stopFlyingMoneyAnimation();
      }
      
      // Handle customer-to-NESO money animation for cost step
      // Only run customer-to-NESO animation if Constantine customers are visible
      if (showConstantineCustomers && showNESO && map.current) {
        console.log('👥 Starting customer-to-NESO animation for step:', currentStep.title);
        stopFlyingMoneyAnimation(); // Stop NESO animation first
        stopCustomerToNesoAnimation(); // Stop any existing customer animation first
        startCustomerToNesoAnimation();
      } else if (!showConstantineCustomers) {
        stopCustomerToNesoAnimation();
      }
      
      // Control protected areas visibility
      const protectedAreaLayers = [
        'national-parks-fill', 'national-parks-outline', 'national-parks-labels',
        'green-belt-fill', 'green-belt-outline', 'green-belt-labels',
        'aonb-fill', 'aonb-outline', 'aonb-labels'
      ];
      
      protectedAreaLayers.forEach(layerId => {
        if (map.current.getLayer(layerId)) {
          map.current.setLayoutProperty(layerId, 'visibility', showProtectedAreas ? 'visible' : 'none');
        }
      });
    } catch (error) {
      console.error('Error controlling layer visibility:', error);
    }
  }, [currentStep, mapLoaded]);

  // Animate to new step when step changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    flyToCurrentStep();
  }, [currentStep, mapLoaded, mapOffset, flyToCurrentStep]);


  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />
      
      {/* Loading Screen Overlay - Semi-transparent to show map loading behind */}
      {showLoadingScreen && (
        <div className={`absolute inset-0 flex items-center justify-center backdrop-blur-sm z-50 transition-all duration-1000 ease-out ${
               loadingProgress >= 100 ? 'opacity-0' : 'opacity-100'
             }`}
             style={{ 
               background: 'radial-gradient(ellipse at center, rgba(236, 87, 211, 0.15) 0%, rgba(147, 51, 234, 0.2) 40%, rgba(0, 0, 0, 0.3) 100%)' 
             }}>
          <div className="rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl border-4 shadow-purple-500/50" 
               style={{ 
                 backgroundColor: 'rgba(21, 1, 69, 0.85)',
                 borderColor: 'rgb(236, 87, 211)',
                 boxShadow: '0 0 30px rgba(236, 87, 211, 0.5), 0 0 60px rgba(147, 51, 234, 0.3)'
               }}>
            {/* Loading Image */}
            <div className="mb-6">
              <Image 
                src="https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/Google%20Chrome%202025-09-09%2023.45.32.png"
                alt="Loading"
                width={400}
                height={192}
                className="w-full h-48 object-cover rounded-2xl"
              />
    </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-800/50 rounded-full h-4 mb-4 border border-pink-400/30">
              <div 
                className="h-4 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                style={{ 
                  width: `${loadingProgress}%`,
                  background: 'linear-gradient(90deg, #ec57d3, #a855f7, #ec57d3)',
                  boxShadow: '0 0 15px rgba(236, 87, 211, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                }}
              >
                {/* Inner glow effect */}
                <div className="absolute inset-0 rounded-full" 
                     style={{
                       background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                       animation: 'shimmer 2s infinite'
                     }}
                />
              </div>
            </div>
            
            <style jsx>{`
              @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
            `}</style>
            
            {/* Progress Text */}
            <p className="text-white text-sm font-medium">
              Loading Energy Data... {Math.round(loadingProgress)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
});
