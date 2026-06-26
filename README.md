<div align="center">
  <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/satellite-dish.svg" width="80" alt="Zenith Logo" />
  <h1 align="center">Project Zenith</h1>
  <p align="center">
    <strong>Real-Time Space Domain Awareness & Orbital Telemetry</strong>
  </p>
  <p align="center">
    Built for civilian stargazers, amateur astronomers, and space enthusiasts.
  </p>
</div>

---

## 🌌 The Problem
Space domain awareness is typically restricted to clunky academic software or overly simplified mobile applications that lack live orbital mechanics. Tracking a satellite visually, predicting when it will fly over your exact location, and ensuring the local cloud cover will permit a viewing is a tedious, multi-step process utilizing disconnected tools.

## 🚀 The Solution
**Project Zenith** bridges this gap. By combining real-time TLE (Two-Line Element) astrophysical data, live global cloud analysis, and advanced orbital mechanic trajectory parsers, Zenith delivers a breathtaking, highly-styled unified dashboard. 

It tells you exactly *what* is flying above you right now, *where* to look, and exactly *when* the International Space Station or the next Falcon Heavy rocket will slice across your horizon.

---

## ✨ Outstanding Features (Hackathon Highlights)

- **Real-Time Orbital Mechanics Engine:** We don't use fake, randomized data. Zenith sequentially parses live global telemetry datasets (TLEs) from CelesTrak and leverages `satellite.js` to calculate raw geodetic math, computing the latitude, longitude, altitude, and velocity of thousands of active satellites globally in real-time.
- **Pass Prediction Algorithms:** Clicking a satellite dynamically calculates the next 3 days of visible orbital passes over your specific GPS coordinates using local nautical twilights from `suncalc` (telling you the precise Minute and Peak Elevation to grab your telescope).
- **Live Atmosphere & Weather Sync:** To prevent you from looking at a cloudy sky, Zenith hooks into the unauthenticated Open-Meteo API to read the dense cloud-cover percentages exactly above your location, grading your visibility conditions.
- **Imminent Rocket Launches:** Integration with The Space Devs LL2 API to dynamically fetch and display rocket launches occurring globally, counting down to T-0 with precise launch pad telemetry.
- **Premium Glassmorphic UI:** Built with Framer Motion, Tailwind CSS, and a bespoke design system that prioritizes micro-animations and a dark-mode "Space" aesthetic, making the application look and feel like a modern aerospace startup.

---

## 🛠️ Technical Stack
- **Frontend Framework:** React 18 / TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + Vanilla CSS (Glassmorphism + UI micro-animations)
- **Map Renderer:** Leaflet.js / React-Leaflet
- **Astrophysics Library:** Satellite.js (SGP4/SDP4 propagation), Suncalc
- **State Management:** Zustand
- **APIs:** CelesTrak (Satellites), Open-Meteo (Weather), The Space Devs (Rocket Launches)

---

## ⚙️ Getting Started

Running Project Zenith locally is incredibly fast and requires **NO API KEYS**.

### Prerequisites
- Node.js (v18+)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/project-zenith.git
   cd project-zenith
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Boot the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔭 Future Roadmap (Phase 5+)
- **Augmented Reality Sky View:** Hooking into mobile `DeviceOrientation` APIs to allow users to hold their phones up to the sky and overlay satellite trajectories on their camera feed.
- **Push Notification Subscriptions:** Utilizing Service Workers to push native browser notifications to the user 5 minutes before the ISS flies directly over their house.
- **Space Debris Mapping:** Tracking dense clusters of retired payload fragments to visualize crowded orbital paths.

---

<div align="center">
  <i>"Look up at the stars and not down at your feet." – Stephen Hawking</i>
</div>
