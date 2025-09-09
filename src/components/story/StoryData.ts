export interface StoryStep {
  id: number;
  title: string;
  description: string;
  mapCenter: [number, number];
  mapZoom: number;
  mapBearing?: number;
  mapPitch?: number;
  layers?: string[];
  chartType?: 'demand' | 'interconnector' | 'renewable' | 'flows' | 'constraints';
  duration: number; // Animation duration in ms
}

export const storySteps: StoryStep[] = [
  {
    id: 1,
    title: "Welcome to Britain's Energy Network",
    description: "Great Britain sits at the heart of Europe's interconnected energy system. Our island nation is connected to continental Europe through a network of underwater cables that carry electricity across borders, enabling energy trading and grid stability.",
    mapCenter: [-3.542218, 53.072854],
    mapZoom: 4.74,
    mapBearing: 0.0,
    mapPitch: 44.42,
    layers: ['all-cables'],
    chartType: 'demand',
    duration: 3000
  },
  {
    id: 2,
    title: "The French Connection",
    description: "France is our largest energy trading partner, connected through three major cables. The IFA cable (2000MW) was our first major interconnector, followed by IFA2 (1000MW) and ElecLink (1000MW) through the Channel Tunnel.",
    mapCenter: [1.5, 50.9],
    mapZoom: 7.0,
    mapBearing: 0.0,
    mapPitch: 35.0,
    layers: ['france-cables'],
    chartType: 'interconnector',
    duration: 4000
  },
  {
    id: 3,
    title: "North Sea Power Highway",
    description: "The North Sea has become a superhighway for renewable energy. The Viking Link connects us to Denmark's abundant wind power, while the North Sea Link brings Norwegian hydroelectric power to British homes.",
    mapCenter: [3.0, 56.0],
    mapZoom: 6.0,
    mapBearing: -15.0,
    mapPitch: 40.0,
    layers: ['north-sea-cables'],
    chartType: 'renewable',
    duration: 4000
  },
  {
    id: 4,
    title: "The Low Countries Gateway",
    description: "Belgium and the Netherlands serve as crucial energy gateways. The Nemo Link connects us to Belgium's grid, while BritNed provides a direct route to Dutch energy markets and their extensive gas infrastructure.",
    mapCenter: [3.5, 51.5],
    mapZoom: 7.5,
    mapBearing: 10.0,
    mapPitch: 30.0,
    layers: ['benelux-cables'],
    chartType: 'flows',
    duration: 3500
  },
  {
    id: 5,
    title: "Irish Sea Energy Bridge",
    description: "The Greenlink cable connects Great Britain to Ireland, enabling energy sharing across the Irish Sea. This connection is vital for balancing renewable generation and ensuring energy security for both nations.",
    mapCenter: [-5.5, 52.0],
    mapZoom: 7.0,
    mapBearing: -20.0,
    mapPitch: 25.0,
    layers: ['ireland-cables'],
    chartType: 'demand',
    duration: 3500
  },
  {
    id: 6,
    title: "Southern England Energy Hub",
    description: "The Kent coast is Britain's primary energy gateway to Europe. Multiple submarine cables make landfall here, connecting to converter stations that transform the electricity for the British grid.",
    mapCenter: [1.2, 51.1],
    mapZoom: 9.0,
    mapBearing: 5.0,
    mapPitch: 20.0,
    layers: ['kent-landing-points'],
    chartType: 'interconnector',
    duration: 3000
  },
  {
    id: 7,
    title: "Northern Powerhouse",
    description: "Northern England hosts the landing points for our longest interconnectors. The North Sea Link arrives at Blyth, bringing clean Norwegian hydropower, while other northern connections support Scotland's renewable exports.",
    mapCenter: [-1.5, 55.1],
    mapZoom: 8.0,
    mapBearing: -10.0,
    mapPitch: 35.0,
    layers: ['northern-landing-points'],
    chartType: 'renewable',
    duration: 3500
  },
  {
    id: 8,
    title: "Energy Flows in Real-Time",
    description: "Watch as electricity flows across our interconnectors in real-time. Blue dots show imports flowing into Britain, while orange dots represent exports. The speed indicates the volume of power being traded.",
    mapCenter: [-1.0, 52.0],
    mapZoom: 6.0,
    mapBearing: 0.0,
    mapPitch: 45.0,
    layers: ['animated-flows'],
    chartType: 'flows',
    duration: 5000
  },
  {
    id: 9,
    title: "Grid Constraints and Challenges",
    description: "When demand is high or renewable generation is low, our interconnectors become critical. This view shows potential constraint points and how European connections help maintain grid stability.",
    mapCenter: [-2.0, 54.0],
    mapZoom: 5.5,
    mapBearing: 0.0,
    mapPitch: 40.0,
    layers: ['constraint-analysis'],
    chartType: 'constraints',
    duration: 4000
  },
  {
    id: 10,
    title: "The Future of European Energy",
    description: "Britain's interconnector network continues to grow. Future cables will bring even more renewable energy from across Europe, supporting our net-zero goals and creating a truly integrated European energy system.",
    mapCenter: [-1.0, 53.0],
    mapZoom: 4.5,
    mapBearing: 0.0,
    mapPitch: 50.0,
    layers: ['all-cables', 'future-projects'],
    chartType: 'renewable',
    duration: 4000
  }
];
