# Last Brain Standing - Tech Stack (LOCKED)

## Frontend
- **React** (Vite) - UI framework with fast dev server
- **Three.js** - 3D WebGL rendering engine
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful Three.js helpers and prebuilt components
- **Postprocessing** - Bloom effects and post-FX pipeline
- ~~Phaser~~ NOT used - fully 3D architecture

## Rendering
- **Isometric/Tilted Camera** - Fixed viewpoint (LOCKED)
- **Low-poly Meshes** - Performance-optimized geometry
- **InstancedMesh** - GPU-instanced rendering for zombies & archers

## Game Logic
- **Deterministic Simulation** - Seeded RNG for consistency
- **Fixed Timestep Loop** - 10 ticks/second server tick rate
- **Client-side Prediction** - Optimistic updates with reconciliation

## Backend
- **Devvit** - Reddit interactive post framework
- **Simple Database** - Stores:
  - Rooks (tower placements)
  - Attacks (spell/projectile data)
  - Players (user scores, state)
  - Wave configurations (NOT video storage)

## Game Mechanics (Confirmed Support)
- Tower/chess defense hybrid
- Wave-based zombie/archer spawning
- Deterministic tower combat
- Real-time multiplayer over Reddit
