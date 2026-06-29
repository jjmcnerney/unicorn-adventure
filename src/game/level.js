import { TILE, LEVEL_W, CANVAS_H } from './config';

const GROUND_Y = CANVAS_H - TILE * 2; // ground is 2 tiles tall

// Rainbow platforms: { x, y, w (in tiles), h (in tiles) }
export const platforms = [
  // Starting platform (ground begins here)
  { x: 0, y: GROUND_Y, w: 8, h: 2 },

  // Gap, then floating rainbow platforms
  { x: 12, y: GROUND_Y - TILE * 2, w: 4, h: 1 },
  { x: 18, y: GROUND_Y - TILE * 3, w: 3, h: 1 },

  // Ground section
  { x: 24, y: GROUND_Y, w: 10, h: 2 },

  // Floating rainbows above ground section
  { x: 26, y: GROUND_Y - TILE * 4, w: 3, h: 1 },
  { x: 31, y: GROUND_Y - TILE * 5, w: 2, h: 1 },

  // Gap, stepping stone rainbows
  { x: 38, y: GROUND_Y - TILE, w: 2, h: 1 },
  { x: 42, y: GROUND_Y - TILE * 2, w: 2, h: 1 },
  { x: 46, y: GROUND_Y - TILE * 3, w: 2, h: 1 },

  // Big ground section
  { x: 52, y: GROUND_Y, w: 15, h: 2 },

  // High platforms
  { x: 56, y: GROUND_Y - TILE * 4, w: 3, h: 1 },
  { x: 62, y: GROUND_Y - TILE * 5, w: 4, h: 1 },

  // Final approach
  { x: 70, y: GROUND_Y, w: 8, h: 2 },
  { x: 80, y: GROUND_Y, w: 10, h: 2 },
];

// Enemies: ugly blue fish
export const initialEnemies = [
  { x: 26 * TILE, y: GROUND_Y - TILE * 2, w: 42, h: 30, alive: true, dir: 1, speed: 1.5, patrolStart: 24 * TILE, patrolEnd: 33 * TILE },
  { x: 40 * TILE, y: GROUND_Y - TILE, w: 42, h: 30, alive: true, dir: -1, speed: 1.8, patrolStart: 38 * TILE, patrolEnd: 48 * TILE },
  { x: 56 * TILE, y: GROUND_Y - TILE * 2, w: 42, h: 30, alive: true, dir: 1, speed: 1.2, patrolStart: 52 * TILE, patrolEnd: 66 * TILE },
  { x: 63 * TILE, y: GROUND_Y - TILE * 6, w: 42, h: 30, alive: true, dir: -1, speed: 1.5, patrolStart: 62 * TILE, patrolEnd: 66 * TILE },
  { x: 74 * TILE, y: GROUND_Y - TILE * 2, w: 42, h: 30, alive: true, dir: 1, speed: 2, patrolStart: 70 * TILE, patrolEnd: 77 * TILE },
];

// Crowns to collect
export const initialCrowns = [
  { x: 13 * TILE, y: GROUND_Y - TILE * 4, w: 30, h: 24, collected: false },
  { x: 19 * TILE, y: GROUND_Y - TILE * 5, w: 30, h: 24, collected: false },
  { x: 27 * TILE, y: GROUND_Y - TILE * 6, w: 30, h: 24, collected: false },
  { x: 32 * TILE, y: GROUND_Y - TILE * 7, w: 30, h: 24, collected: false },
  { x: 43 * TILE, y: GROUND_Y - TILE * 4, w: 30, h: 24, collected: false },
  { x: 47 * TILE, y: GROUND_Y - TILE * 5, w: 30, h: 24, collected: false },
  { x: 57 * TILE, y: GROUND_Y - TILE * 6, w: 30, h: 24, collected: false },
  { x: 64 * TILE, y: GROUND_Y - TILE * 7, w: 30, h: 24, collected: false },
];

// Jumbo chocolate chip cookie (goal!) — centered on the final platform
export const cookie = { x: 83 * TILE, y: GROUND_Y - TILE * 3, w: 48, h: 48, reached: false };

// Cloud decorations (non-solid)
export const clouds = [];
for (let i = 0; i < 40; i++) {
  clouds.push({
    x: i * 90 + (i * 37 % 50),
    y: 20 + (i * 53 % 100),
    w: 60 + (i * 29 % 60),
    h: 30 + (i * 17 % 20),
  });
}
