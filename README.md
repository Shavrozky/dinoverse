# DinoVerse

DinoVerse is an interactive, educational prehistoric web application designed to bring dinosaurs to life through interactive 3D visualizations, geological timelines, fossil explorations, and scientific encyclopedic data.

---

## Phase 2 — Dinosaur Encyclopedia

Phase 2 builds upon the Phase 1 foundation by introducing the **Dinosaur Encyclopedia & Data Layer**:

- **Structured Dinosaur Dataset**: 20 curated dinosaur species across the Triassic, Jurassic, and Cretaceous periods and all major dietary guilds (`carnivore`, `herbivore`, `omnivore`, `piscivore`).
- **Interactive Catalog (`/explore`)**: Real-time client-side search, geological period filtering, diet filtering, sorting, active filter chips, and empty state recovery.
- **URL State Synchronization**: Search, filter, and sort selections are synchronized with URL query parameters for shareable and bookmarkable views.
- **Specimen Detail View (`/dinosaur/:slug`)**: Scientific profile, taxonomy, geological formations, 3D viewport placeholder, specimen pagination, and related dinosaur recommendations.

### Filter URL Syntax

All catalog filters are stored in the URL query string on `/explore`:

- `/explore?q=rex` — Search by common name, scientific name, alias, clade, or location
- `/explore?period=cretaceous` — Filter by geological period (`triassic`, `jurassic`, `cretaceous`)
- `/explore?diet=herbivore` — Filter by diet (`carnivore`, `herbivore`, `omnivore`, `piscivore`)
- `/explore?sort=largest` — Sort catalog (`name-asc`, `name-desc`, `largest`, `smallest`, `oldest`, `youngest`)
- `/explore?q=rex&period=cretaceous&diet=carnivore&sort=name-asc` — Combined query

Invalid query parameters are safely validated at runtime and fall back to default values without crashing the application.

### Dinosaur Data Location & Adding a New Dinosaur

Dinosaur records live in `src/data/dinosaurs/`:

```text
src/data/dinosaurs/
├── tyrannosaurus-rex.ts
├── triceratops-horridus.ts
├── velociraptor-mongoliensis.ts
├── ...
└── index.ts
```

To add a new dinosaur specimen:

1. Create a new record file in `src/data/dinosaurs/<slug>.ts` typed with `Dinosaur` from `@/types`.
2. Import and append the record to the `dinosaurs` array in `src/data/dinosaurs/index.ts`.

No changes to the router, filter utilities, card components, or detail pages are required.

---

## Tech Stack

- **Framework**: React 18 & TypeScript
- **Bundler**: Vite
- **Routing**: React Router 6
- **3D & WebGL**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Global State**: Zustand
- **Animation**: Framer Motion
- **Code Quality**: ESLint 9 (Flat Config), Prettier

---

## Getting Started

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Runs the application locally at `http://localhost:3000`.

---

## Validation & Code Quality

Validate the project before committing changes:

```bash
# Check code style and linting
npm run lint

# Check TypeScript types
npm run typecheck

# Run unit tests for domain & query utilities
npm run test

# Production build test
npm run build
```

---

## Project Structure

```text
src/
├── app/          # App bootstrap, router definition, and root providers
├── assets/       # Static assets (images, icons, textures, sounds)
├── components/   # Shared, domain-agnostic UI (layout, buttons, error boundaries)
│   ├── common/   # ErrorBoundary, LoadingScreen
│   ├── layout/   # AppLayout, Navbar, Footer
│   └── ui/       # Button, Container
├── data/         # Domain datasets (dinosaurs, geological periods)
│   ├── dinosaurs/
│   └── periods/
├── features/     # Feature modules
│   └── dinosaurs/
│       ├── components/
│       ├── hooks/
│       ├── types/
│       └── utils/
├── hooks/        # Generic, reusable application-level hooks
├── lib/          # External library configurations and adapters
├── pages/        # Lazy-loaded route views
├── store/        # Zustand global state (application & UI settings)
├── styles/       # CSS tokens and global stylesheets
├── three/        # WebGL / React Three Fiber scenes, canvas abstractions, lighting
├── types/        # Global TypeScript domain definitions
├── utils/        # Pure generic utility functions
└── main.tsx      # Application entrypoint
```

3D models are organized in `public/models/dinosaurs/<slug>/model.glb`.
