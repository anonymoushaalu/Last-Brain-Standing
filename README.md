# Last Brain Standing

A tower defense game built with React, Three.js, and deterministic game simulation. Play in real-time on Reddit via Devvit.

## Quick Start

```bash
npm install
npm run dev
```

Browse to `http://localhost:5173`

## Tech Stack (LOCKED)

See [TECH_STACK.md](./TECH_STACK.md) for the definitive technology choices.

### Key Constraints
- **3D Rendering**: Isometric/tilted camera fixed viewpoint
- **Performance**: InstancedMesh for zombie/archer batching
- **Game Logic**: 10 ticks/second deterministic simulation with seeded RNG
- **Backend**: Devvit (Reddit), simple DB (rooks, attacks, players)
- **No Phaser** - fully 3D architecture with Three.js

## Project Structure

```
src/
├── components/       # React Three.js components
├── engine/          # GameEngine with fixed timestep loop
├── types/           # TypeScript interfaces
├── assets/          # 3D models (low-poly meshes)
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## Architecture

### GameEngine (10 ticks/sec)
- Seeded RNG for deterministic behavior
- Fixed timestep loop (`dt = 0.1s`)
- Handles entity updates, collisions, spawning

### Rendering
- React Three.js with Postprocessing (bloom)
- Instancedmesh for efficient zombie/archer rendering
- Isometric camera view

### Game State
- Towers (rooks) placement
- Wave configurations
- Player scores

## Development

- `npm run dev` - Start dev server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
