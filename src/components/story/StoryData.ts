 
export interface StoryStep {
  id: number;
  title: string;
  description: string;
  mapCenter: [number, number];
  mapZoom: number;
  mapBearing?: number;
  mapPitch?: number;
  layers?: string[];
  chartType?: 'demand' | 'interconnector' | 'renewable' | 'flows' | 'constraints' | 'windComparison' | 'image' | 'negativePrice' | 'spending' | 'zonalSavings' | 'eglTimeline';
  imageUrl?: string;
  externalLink?: { label: string; url: string };
  duration: number; // Animation duration in ms
}

export const storySteps: StoryStep[] = [
  {
    id: 0,
    title: "Welcome to the UK's Energy Story",
    description: "This is a guided tour of the challenges and opportunities in Great Britain's electricity grid. We'll explore how geography, weather, and infrastructure create a complex balancing act.",
    mapCenter: [-2.5, 54.5],
    mapZoom: 4,
    mapBearing: 0,
    mapPitch: 20,
    layers: ['all-cables'],
    duration: 2500
  },
  {
    id: 1,
    title: "Wind Generation in Rural Scotland",
    description: "The UK is well known for having a lot of wind generation in the north, in rural Scotland as well as extensive offshore wind farms in the North Sea. Scotland is an ideal location for wind farms due to its consistent and strong North Sea winds and vast open landscape.",
    mapCenter: [-3.5, 56.0],
    mapZoom: 4.5,
    mapBearing: 0,
    mapPitch: 25,
    layers: ['wind-turbines', 'all-cables'],
    chartType: 'windComparison',
    duration: 3000
  },
  {
    id: 2,
    title: "Demand in the South",
    description: "Equally we have a lot of demand in the south with the largest cities being in England, like London, Birmingham, Oxford, Cambridge and the surrounding areas.",
    mapCenter: [-1.0, 52.0],
    mapZoom: 6,
    mapBearing: 0,
    mapPitch: 30,
    layers: ['all-cables'],
    chartType: 'demand',
    duration: 3000
  },
  {
    id: 3,
    title: "Interconnectors Across the UK",
    description: "We have interconnectors though, which is great to support demand across the UK. These cables connect us to Europe - from the south coast to France, Belgium and the Netherlands, to Norway via the North Sea, to Denmark via the Viking Link and to Ireland from Wales.",
    mapCenter: [-1.5, 53.0],
    mapZoom: 4.2,
    mapBearing: 0,
    mapPitch: 25,
    layers: ['all-cables'],
    chartType: 'interconnector',
    duration: 3000
  },
  {
    id: 4,
    title: "The B6 Boundary Bottleneck",
    description: "The north-south divide is caused by problems such as the B6 boundary, which is where in the UK, we only have 2 transmission lines connecting north to south. We've shown how the UK energy system has high intermittent renewable output in the north. Demand is low in the north and high in the south however it’s not possible to transport clean power down south. This bottleneck is highly costly. Above the B6 boundary there is around 12 GW of onshore wind capacity but the network can carry a maximum of roughly 5–6 GW across this section.",
    mapCenter: [-2.2, 54.9],
    mapZoom: 7.5,
    mapBearing: -10,
    mapPitch: 40,
    layers: ['b6-boundary', 'all-cables'],
    chartType: 'renewable',
    duration: 4000
  },
  {
    id: 5,
    title: "Protected Areas Block Expansion",
    description: "The reason why we can't build much more transmission capacity is because of protected woodlands, national parks, and green belt areas that prevent new infrastructure.",
    mapCenter: [-2.2, 54.9],
    mapZoom: 7.5,
    mapBearing: -10,
    mapPitch: 40,
    layers: ['b6-boundary', 'protected-areas', 'all-cables'],
    chartType: 'image',
    imageUrl: 'https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/ANGER-4-WEB.jpg',
    externalLink: { label: 'Further reading: BBC News article', url: 'https://www.bbc.co.uk/news' },
    duration: 3500
  },
  {
    id: 6,
    title: "Windy Days = Low Prices",
    description: "On certain days where it's very windy, day-ahead prices are very low or even negative due to high wind forecasts and abundant cheap renewable energy.",
    mapCenter: [-2.5, 54.5],
    mapZoom: 5,
    mapBearing: 0,
    mapPitch: 25,
    layers: ['wind-turbines', 'all-cables'],
    chartType: 'negativePrice',
    duration: 3500
  },
  {
    id: 7,
    title: "Wind Turbines Spin Up",
    description: "Wind turbines spin up as forecasted, generating lots of power. But the B6 boundary starts flashing as transmission capacity becomes constrained.",
    mapCenter: [-3.0, 56.5],
    mapZoom: 6,
    mapBearing: 0,
    mapPitch: 30,
    layers: ['wind-turbines', 'b6-boundary', 'all-cables'],
    chartType: 'renewable',
    duration: 4000
  },
  {
    id: 8,
    title: "NESO Pays Wind to Curtail",
    description: "On tight days, lack of transmission capacity means NESO must pay to curtail wind in the north so it doesn't blow. Power generators are paid to turn down in the balancing mechanism.",
    mapCenter: [-2.0, 54.5],
    mapZoom: 4.8,
    mapBearing: 0,
    mapPitch: 30,
    layers: ['wind-curtailment-icons', 'b6-boundary', 'all-cables'],
    chartType: 'image',
    imageUrl: 'https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/giphy.gif',
    duration: 4000
  },
  {
    id: 9,
    title: "NESO Pays Gas Plants",
    description: "NESO has to pay gas plants to turn up because there is still demand in the south, in London and other major cities that need reliable power supply.",
    mapCenter: [-1.5, 53.5],
    mapZoom: 5,
    mapBearing: 0,
    mapPitch: 40,
    layers: ['gas-facilities', 'all-cables'],
    chartType: 'image',
    imageUrl: 'https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/giphy.gif',
    duration: 4000
  },
  {
    id: 10,
    title: "NESO Pays to Reverse Wrong Direction Flows",
    description: "Interconnectors are often set to export, due to high power generation, because they want our cheap day-ahead prices. But in the wrong direction as we expected large generation that was curtailed, and NESO must pay to reverse flows.",
    mapCenter: [0.0, 52.0],
    mapZoom: 4.5,
    mapBearing: 0,
    mapPitch: 35,
    layers: ['all-cables'],
    chartType: 'image',
    imageUrl: 'https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/giphy.gif',
    duration: 4000
  },
  {
    id: 11,
    title: "NESO Costs £690 Million - Customers Pay",
    description: "This has so far cost this year £690 million on all of this expensive balancing - money that comes directly from customers' pockets to NESO for managing these constraints.",
    mapCenter: [-2.0, 54.0],
    mapZoom: 5,
    mapBearing: 0,
    mapPitch: 35,
    layers: ['all-cables', 'constantine-customers'],
    chartType: 'spending',
    duration: 3500
  },
  {
    id: 12,
    title: "Solution: Regional Pricing",
    description: "Regional pricing would send more accurate signals to the market, making the system run more efficiently. It would better align generation and demand across zones and reduce costly last‑minute balancing.",
    mapCenter: [-2.0, 54.0],
    mapZoom: 5,
    mapBearing: 0,
    mapPitch: 35,
    layers: ['pricing-zones', 'all-cables'],
    chartType: 'zonalSavings',
    duration: 4000
  },
  {
    id: 13,
    title: "Introduce additional transmission routes (and keep them on time)",
    description: "Reinforcement projects are slipping and that keeps the B6 constraint in place. Eastern Green Link 1 (Torness–Hawthorn Pit) has moved from 2027 to 2030 (delayed), while Eastern Green Link 2 (Peterhead–Drax) is currently planned for 2029. Deliver these links on time—and, with two‑zone pricing, add more north–south routes to move surplus Scottish renewables to English demand more efficiently.",
    mapCenter: [1.0, 55.0],
    mapZoom: 5.5,
    mapBearing: 10,
    mapPitch: 30,
    layers: ['egl2', 'all-cables'],
    chartType: 'eglTimeline',
    duration: 4000
  },
  {
    id: 14,
    title: "Solution: EU Market Coupling",
    description: "We must champion greater coupling of UK to EU markets. A potential UK–EU recoupling of electricity trading would improve cross‑border efficiency, maximize interconnector capacity, and reduce costly last‑minute balancing.",
    mapCenter: [2.0, 52.0],
    mapZoom: 4,
    mapBearing: 0,
    mapPitch: 45,
    layers: ['all-cables'],
    chartType: 'image',
    imageUrl: 'https://kuzgtbnlazsvcjuazowt.supabase.co/storage/v1/object/public/hackathon/hug.gif',
    duration: 4000
  },
  {
    id: 15,
    title: "Working Together for the Greater Good",
    description: "Solutions at a glance to cut costs, move clean power, and speed up the transition.",
    mapCenter: [-1.0, 53.0],
    mapZoom: 4.5,
    mapBearing: 0,
    mapPitch: 50,
    layers: ['egl2', 'pricing-zones', 'all-cables'],
    duration: 4000
  },
  {
    id: 16,
    title: "Build With Us — Open Source",
    description: "This project is open‑source — explore the code!",
    mapCenter: [-1.0, 53.0],
    mapZoom: 4.5,
    mapBearing: 0,
    mapPitch: 50,
    layers: ['all-cables'],
    duration: 4000
  }
];
