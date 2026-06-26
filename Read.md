# 🌌 Project Zenith: The Celestial Eye

> A real-time, interactive cosmic radar that calculates and visualizes celestial bodies passing through the zenith of any geographic coordinate on Earth.

[![Demo Video](link-to-youtube-demo)] [![Live Deployment](link-to-vercel-deployment)]

## 🚀 The Vision
Project Zenith bridges the gap between raw astrophysical telemetry and intuitive UX design. By integrating real-time data from NASA Horizons and CelesTrak with a high-performance 3D geospatial engine, we transform any browser into a localized space observatory.

## 🛠 Tech Stack
* **Frontend:** Next.js (React), Tailwind CSS, Framer Motion (for cinematic UI)
* **Geospatial Engine:** CesiumJS / Leaflet
* **Orbital Mechanics:** satellite.js (TLE parsing & coordinate conversion)
* **APIs:** OpenNotify (ISS), CelesTrak (Active Satellites), NASA Horizons

## ✨ Key Features
* **Interactive Zenith Calculation:** Select any Lat/Lon to calculate the sky directly overhead.
* **Live Telemetry Synchronization:** Real-time altitude, velocity, and trajectory mapping.
* **Responsive Glassmorphic UI:** Optimized for Mobile, Tablet, and Desktop using advanced CSS Grid architectures.
* **Orbit Path Visualization:** Dynamic polyline rendering for future trajectory prediction.

## 📂 Architecture & Code Structure
To ensure maintainability, we strictly separated our UI components from our orbital mathematics:
* `/lib/math` - Pure functions handling TLE parsing and Lat/Lon to Right Ascension conversions.
* `/app/api` - Backend-for-Frontend (BFF) routes protecting our API keys and circumventing CORS.
* `/components` - Modular, reusable UI elements.

## ⚙️ Local Setup
1. Clone the repo: `git clone https://github.com/your-repo/project-zenith.git`
2. Install dependencies: `npm install`
3. Add your API keys to `.env.local` (See `.env.example`)
4. Run the development server: `npm run dev`