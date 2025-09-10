### Notice

This project was built during a hackathon, so there may be a few rough edges. If you have questions or run into any issues, please reach out :)

## Project Overview

An interactive energy story map built with Next.js, Mapbox GL JS, and Recharts. It narrates GB’s grid challenges (wind in the north, demand in the south, B6 bottleneck) and proposed solutions with live-ish visuals.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Mapbox API Setup

The story map uses Mapbox GL JS. You need a Mapbox access token.

1) Create a `.env.local` in the project root and add:

```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_public_token_here
```

2) Restart the dev server after adding the env file.

3) The token is read in `src/components/story/StoryMap.tsx` via `process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`.

If you deploy, also configure this env variable in your hosting provider.

## Tech Stack

- **Framework**: Next.js (App Router), React, TypeScript
- **Map**: Mapbox GL JS (+ custom DOM overlays, animated markers, GeoJSON sources)
- **Charts**: Recharts (Line/Area/Bar, reference lines, custom tooltips)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Data**:
  - NESO API (flows, spend) for live and historical data
  - REPD-derived GeoJSON for wind/gas assets
  - Supabase Storage for GeoJSON layers and images
- **Utilities**: `proj4` for EPSG:27700 → WGS84 conversion

## Hosting & Storage

- Frontend can plug directly into Vercel for hosting (zero-config for Next.js).
- Any blob/object storage works for assets and GeoJSON.
- This project uses Supabase Storage (backed by AWS S3) with a public bucket for convenience.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — type-check and build
- `npm run start` — run production build

## Notes

- Map layers, steps, and charts are driven by:
  - `src/components/story/StoryData.ts` — narrative steps
  - `src/components/story/StoryMap.tsx` — Mapbox layers/logic
  - `src/components/story/StoryPanel.tsx` — panel UI and chart routing
- Some steps use placeholder values or GIFs; wire your own endpoints if needed.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
