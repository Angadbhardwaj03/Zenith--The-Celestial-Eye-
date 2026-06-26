<div align="center">

<img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/satellite-dish.svg" width="90" alt="Zenith Logo"/>

# 🚀 Project Zenith
### Real-Time Space Domain Awareness & Orbital Intelligence Platform

Track satellites, predict orbital passes, monitor rocket launches, and analyze sky visibility—all from one modern dashboard.

[![React](https://img.shields.io/badge/React-18-blue.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)]()
[![Vite](https://img.shields.io/badge/Vite-7-purple.svg)]()
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38BDF8.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)]()

</div>

---

# 🌌 Overview

Space tracking tools are often either too technical for everyday users or too simplistic to provide meaningful insights.

**Project Zenith** bridges this gap by combining **live satellite telemetry**, **orbital mechanics**, **weather intelligence**, and **rocket launch tracking** into a single elegant web application.

Whether you're a space enthusiast, amateur astronomer, or simply curious about what's flying above your head, Zenith provides accurate and real-time information through an intuitive interface.

---

# ✨ Key Features

## 🛰️ Real-Time Satellite Tracking
- Live satellite positions using orbital propagation
- Supports thousands of active satellites
- Displays latitude, longitude, altitude, and velocity

---

## 🌍 Interactive World Map
- Visualize satellites on a live map
- Smooth tracking updates
- Interactive satellite selection

---

## 📡 Satellite Pass Prediction
- Predict visible passes over your current location
- Peak elevation calculations
- Rise, peak, and set times
- Uses astronomical twilight calculations

---

## ☁️ Live Weather Integration
- Current cloud cover
- Visibility score
- Sky viewing conditions
- Weather-aware observation planning

---

## 🚀 Rocket Launch Dashboard
- Upcoming launches
- Countdown timer
- Launch provider information
- Launch vehicle details

---

## 🌙 Astronomy-Friendly UI
- Glassmorphism design
- Dark space-inspired theme
- Responsive layout
- Smooth Framer Motion animations

---

# ⚙️ How It Works

Zenith combines multiple real-time datasets:

```
Satellite TLE Data
        │
        ▼
 Satellite.js
        │
 Orbital Calculations
        │
        ▼
Interactive Map & Predictions

        +
Weather API
        +
Rocket Launch API
        │
        ▼
Unified Dashboard
```

---

# 🛠️ Tech Stack

## Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion

## Maps & Visualization

- Leaflet
- React Leaflet

## Astronomy Libraries

- satellite.js
- SunCalc

## State Management

- Zustand

---

# 🌍 APIs Used

| API | Purpose | Authentication |
|------|----------|----------------|
| CelesTrak | Live Satellite TLE Data | ❌ Not Required |
| Open-Meteo | Weather & Cloud Cover | ❌ Not Required |
| The Space Devs LL2 | Rocket Launch Data | ❌ Not Required |

---

# 📦 Major Dependencies

```
react
typescript
vite
tailwindcss
framer-motion
leaflet
react-leaflet
satellite.js
suncalc
zustand
```

---

# 🚀 Getting Started

## Prerequisites

- Node.js 18+
- npm

---

## Installation

Clone the repository

```bash
git clone https://github.com/yAngadbhardwaj03/project-zenith.git
```

Move into the project

```bash
cd project-zenith
```

Install dependencies

```bash
npm install
```

Start the development server

```bash
npm run dev
```

Build for production

```bash
npm run build
```

Preview production build

```bash
npm run preview
```

---

# 🌱 Environment Variables

No environment variables are required.

Project Zenith currently uses publicly accessible APIs that do not require authentication.

If authentication becomes necessary in future versions, create a `.env` file:

```env
VITE_API_KEY=your_api_key_here
```

---

# 📂 Project Structure

```
src/
│
├── components/
├── pages/
├── hooks/
├── services/
├── utils/
├── assets/
├── styles/
└── App.tsx
```

---

# 🎯 Why Zenith?

Unlike traditional satellite trackers, Zenith combines multiple real-time services into one experience.

✅ Live Satellite Tracking

✅ Orbital Pass Prediction

✅ Rocket Launch Monitoring

✅ Weather Intelligence

✅ Interactive Maps

✅ Modern Responsive Interface

---

# 🔮 Future Roadmap

- 📱 Augmented Reality Sky View
- 🤖 AI Astronomy Assistant
- 🔔 ISS Pass Notifications
- 🌠 Meteor Shower Predictions
- 🛰️ Space Debris Visualization
- 📷 Constellation Detection using AI
- 🌌 Personalized Stargazing Recommendations

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository

2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push to GitHub

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

<div align="center">

### 🌌 Look up at the stars and not down at your feet.

*"The universe is under no obligation to make sense to you."*  
— **Neil deGrasse Tyson**
live demo link : https://zenith-the-celestial-eye.vercel.app/
Made with ❤️ for space enthusiasts and the open-source community.

⭐ If you enjoyed this project, consider giving it a star!

</div>
