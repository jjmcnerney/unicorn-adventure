// Game configuration constants
export const TILE = 40;
export const CANVAS_W = 800;
export const CANVAS_H = 500;
export const LEVEL_W = 3600; // total level width in pixels (90 tiles)

export const GRAVITY = 0.6;
export const JUMP_FORCE = -12;
export const MOVE_SPEED = 5;
export const PLAYER_W = 32;
export const PLAYER_H = 40;

// Palette: index -> hex
export const PALETTE = {
  0: null,        // transparent
  1: '#87CEEB',   // sky blue
  2: '#B0E0FF',   // light sky
  3: '#FFFFFF',   // white
  4: '#F0F4FF',   // cloud white
  5: '#D0D8E8',   // cloud shadow
  6: '#FF69B4',   // hot pink
  7: '#FF85C8',   // light pink
  8: '#FFB0DD',   // pale pink
  9: '#FFFFFF',   // unicorn mane/horn white
  10: '#FFD700',  // gold (horn, crown)
  11: '#4169E1',  // royal blue (fish)
  12: '#2E5BBA',  // dark blue (fish belly)
  13: '#1A3D7A',  // very dark blue (fish outline)
  14: '#FF0000',  // red (rainbow)
  15: '#FF7700',  // orange
  16: '#FFFF00',  // yellow
  17: '#00CC00',  // green
  18: '#0066FF',  // blue (rainbow)
  19: '#8B00FF',  // violet
  20: '#8B4513',  // cookie brown
  21: '#6B3410',  // cookie dark brown
  22: '#3B1F0B',  // chocolate chip
  23: '#FF4500',  // sprinkle red
  24: '#FF69B4',  // sprinkle pink
  25: '#FFD700',  // sprinkle gold
  26: '#00FF7F',  // sprinkle green
  27: '#00BFFF',  // sprinkle cyan
  28: '#FF69B4',  // sparkle pink
};
