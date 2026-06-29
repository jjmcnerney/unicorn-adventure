import { PALETTE, PLAYER_W, PLAYER_H } from './config';

// Draw pixel art sprites using a context positioned at (ox, oy)
// Each pixel drawn at scale `s`

// Pink Unicorn sprite (16x20 grid, drawn at 2x scale = 32x40)
// isMoving: true when the player has horizontal input
export const drawUnicorn = (ctx, ox, oy, s, frame, isMoving) => {
  const x = (i) => ox + i * s;
  const y = (j) => oy + j * s;
  const px = (i, j, c) => { ctx.fillStyle = PALETTE[c]; ctx.fillRect(x(i), y(j), s, s); };

  // Slow gentle idle bob (~12 fps cycle)
  const bob = isMoving
    ? (frame % 8 === 0 ? 0 : 1)    // faster when moving
    : (frame % 24 === 0 ? 0 : 1);  // slow gentle bob when idle

  // Horn (gold)
  px(3, 0 - bob, 10); px(4, 0 - bob, 10);
  px(3, 1 - bob, 10); px(4, 1 - bob, 10); px(5, 1 - bob, 10);
  px(2, 2 - bob, 10); px(3, 2 - bob, 10); px(4, 2 - bob, 10); px(5, 2 - bob, 10); px(6, 2 - bob, 10);

  // Head (pink)
  px(1, 3 - bob, 6); px(2, 3 - bob, 6); px(3, 3 - bob, 7); px(4, 3 - bob, 7); px(5, 3 - bob, 6);
  px(0, 4 - bob, 6); px(1, 4 - bob, 6); px(2, 4 - bob, 7); px(3, 4 - bob, 7); px(4, 4 - bob, 6); px(5, 4 - bob, 6); px(6, 4 - bob, 6);
  px(0, 5 - bob, 6); px(1, 5 - bob, 6); px(2, 5 - bob, 7); px(3, 5 - bob, 7); px(4, 5 - bob, 6); px(5, 5 - bob, 6); px(6, 5 - bob, 6);

  // Eye — slow blink (closes every ~3 seconds)
  const blinkCycle = frame % 180;
  const isBlinking = blinkCycle < 6;
  if (isBlinking) {
    px(2, 4 - bob, 6); px(3, 4 - bob, 7); // closed eye
  } else {
    px(2, 4 - bob, 13); // open pupil
    px(3, 4 - bob, 3);  // eye shine
  }

  // Mane (white flowing) — very slow sway
  const maneOffset = frame % 36 < 18 ? 0 : 1;
  px(5, 2 - bob, 9); px(6, 2 - bob, 9);
  px(6 + maneOffset, 3 - bob, 9); px(7 + maneOffset, 3 - bob, 9);
  px(7 + maneOffset, 4 - bob, 9); px(8 + maneOffset, 4 - bob, 9);

  // Neck
  px(4, 6 - bob, 6); px(5, 6 - bob, 6); px(6, 6 - bob, 6);

  // Body
  px(3, 7 - bob, 7); px(4, 7 - bob, 7); px(5, 7 - bob, 7); px(6, 7 - bob, 7); px(7, 7 - bob, 7); px(8, 7 - bob, 6); px(9, 7 - bob, 6);
  px(2, 8 - bob, 6); px(3, 8 - bob, 7); px(4, 8 - bob, 7); px(5, 8 - bob, 7); px(6, 8 - bob, 7); px(7, 8 - bob, 7); px(8, 8 - bob, 7); px(9, 8 - bob, 6); px(10, 8 - bob, 6);
  px(2, 9 - bob, 6); px(3, 9 - bob, 7); px(4, 9 - bob, 8); px(5, 9 - bob, 7); px(6, 9 - bob, 7); px(7, 9 - bob, 8); px(8, 9 - bob, 7); px(9, 9 - bob, 6); px(10, 9 - bob, 6);
  px(2, 10 - bob, 6); px(3, 10 - bob, 7); px(4, 10 - bob, 7); px(5, 10 - bob, 7); px(6, 10 - bob, 7); px(7, 10 - bob, 7); px(8, 10 - bob, 7); px(9, 10 - bob, 6);

  // Tail (flowing white) — slow sway
  const tailOffset = frame % 30 < 15 ? 0 : 1;
  px(10, 6 - bob + tailOffset, 9); px(11, 6 - bob + tailOffset, 9);
  px(10, 7 - bob, 9);
  px(9, 8 - bob, 9); px(10, 8 - bob, 9);
  px(8, 9 - bob, 9); px(9, 9 - bob, 9);

  // Legs
  const legFrame = isMoving ? frame % 16 : frame % 48; // slow walk cycle / almost-still idle
  if (legFrame < 8) {
    // Standing/stride 1
    px(3, 11 - bob, 6); px(4, 11 - bob, 6);
    px(3, 12 - bob, 6); px(4, 12 - bob, 6);
    px(7, 11 - bob, 6); px(8, 11 - bob, 6);
    px(7, 12 - bob, 6); px(8, 12 - bob, 6);
  } else {
    // Stride 2
    px(2, 11 - bob, 6); px(5, 11 - bob, 6);
    px(2, 12 - bob, 6); px(5, 12 - bob, 6);
    px(6, 11 - bob, 6); px(9, 11 - bob, 6);
    px(6, 12 - bob, 6); px(9, 12 - bob, 6);
  }

  // Hooves
  px(3, 13 - bob, 8); px(4, 13 - bob, 8);
  px(7, 13 - bob, 8); px(8, 13 - bob, 8);
};

// Ugly Blue Fish sprite (14x10 grid, drawn at ~3x scale)
export const drawFish = (ctx, ox, oy, s, frame) => {
  const x = (i) => ox + i * s;
  const y = (j) => oy + j * s;
  const px = (i, j, c) => { ctx.fillStyle = PALETTE[c]; ctx.fillRect(x(i), y(j), s, s); };

  // Slow, gentle wobble (~3.5s cycle)
  const wobblePhase = (Math.sin(frame * 0.035) * 0.5 + 0.5); // 0..1
  const wobble = wobblePhase > 0.7 ? 1 : wobblePhase < 0.3 ? -1 : 0;

  // Tail fin
  px(0, 3 + wobble, 11); px(0, 4 + wobble, 11); px(0, 5 + wobble, 11);
  px(1, 2 + wobble, 12); px(1, 3 + wobble, 12); px(1, 5 + wobble, 12); px(1, 6 + wobble, 12);

  // Body
  px(2, 2 + wobble, 11); px(3, 2 + wobble, 12); px(4, 2 + wobble, 12); px(5, 2 + wobble, 11); px(6, 2 + wobble, 11);
  px(2, 3 + wobble, 11); px(3, 3 + wobble, 12); px(4, 3 + wobble, 12); px(5, 3 + wobble, 11); px(6, 3 + wobble, 11);
  px(2, 4 + wobble, 11); px(3, 4 + wobble, 12); px(4, 4 + wobble, 12); px(5, 4 + wobble, 11); px(6, 4 + wobble, 11);
  px(2, 5 + wobble, 11); px(3, 5 + wobble, 12); px(4, 5 + wobble, 12); px(5, 5 + wobble, 11); px(6, 5 + wobble, 11);
  px(3, 6 + wobble, 11); px(4, 6 + wobble, 12); px(5, 6 + wobble, 11);

  // Belly line
  px(3, 5 + wobble, 13); px(4, 5 + wobble, 13); px(5, 5 + wobble, 13);

  // Eye (big, ugly, yellow)
  px(5, 2 + wobble, 16);
  // Pupil (cross-eyed)
  px(6, 3 + wobble, 13);
  // Other eye (different size - ugly)
  px(3, 3 + wobble, 16);

  // Mouth (crooked)
  px(6, 4 + wobble, 13); px(7, 4 + wobble, 13);
  // Teeth
  px(7, 3 + wobble, 3);

  // Dorsal fin
  px(4, 1 + wobble, 13); px(5, 1 + wobble, 13);
  px(4, 0 + wobble, 11);

  // Bottom fin
  px(3, 7 + wobble, 11); px(4, 7 + wobble, 11);

  // Extra weird bumps
  px(2, 1 + wobble, 13);
};

// Crown sprite (10x8 grid)
export const drawCrown = (ctx, ox, oy, s, frame) => {
  const x = (i) => ox + i * s;
  const y = (j) => oy + j * s;
  const px = (i, j, c) => { ctx.fillStyle = PALETTE[c]; ctx.fillRect(x(i), y(j), s, s); };

  // Gentle gold/yellow shimmer (~2s cycle)
  const shimmerPhase = Math.sin(frame * 0.025);
  const shimmer = shimmerPhase > 0.5 ? 10 : 16; // gold or yellow

  // Points
  px(0, 0, 10); px(4, 0, shimmer); px(8, 0, 10);
  px(0, 1, 10); px(1, 1, shimmer); px(3, 1, shimmer); px(4, 1, shimmer); px(5, 1, shimmer); px(7, 1, shimmer); px(8, 1, 10);
  // Base
  px(0, 2, 10); px(1, 2, 10); px(2, 2, shimmer); px(3, 2, shimmer); px(4, 2, shimmer); px(5, 2, shimmer); px(6, 2, shimmer); px(7, 2, 10); px(8, 2, 10);
  px(0, 3, 10); px(1, 3, shimmer); px(2, 3, shimmer); px(3, 3, shimmer); px(4, 3, shimmer); px(5, 3, shimmer); px(6, 3, shimmer); px(7, 3, shimmer); px(8, 3, 10);
  px(0, 4, 10); px(1, 4, shimmer); px(2, 4, shimmer); px(3, 4, shimmer); px(4, 4, shimmer); px(5, 4, shimmer); px(6, 4, shimmer); px(7, 4, shimmer); px(8, 4, 10);
  // Brim
  px(0, 5, 10); px(1, 5, 10); px(2, 5, 10); px(3, 5, shimmer); px(4, 5, shimmer); px(5, 5, shimmer); px(6, 5, 10); px(7, 5, 10); px(8, 5, 10);
  px(0, 6, 10); px(8, 6, 10);
  px(0, 7, 10); px(1, 7, shimmer); px(2, 7, 10); px(3, 7, shimmer); px(4, 7, shimmer); px(5, 7, shimmer); px(6, 7, 10); px(7, 7, shimmer); px(8, 7, 10);
};

// Jumbo Chocolate Chip Cookie sprite (16x16 grid, drawn at 3x scale = 48x48)
export const drawCookie = (ctx, ox, oy, s, frame) => {
  const size = s;
  // Cookie body — solid circle-ish shape
  const brown = PALETTE[20];   // cookie brown
  const darkBrown = PALETTE[21]; // cookie edge
  const chip = PALETTE[22];    // chocolate chip

  // Draw cookie as a rounded shape using individual pixel rects
  // Row pattern: each entry is [start_col, width] of brown pixels per row
  const rows = [
    { start: 3, w: 10 },  // row 0
    { start: 2, w: 12 },  // row 1
    { start: 1, w: 14 },  // row 2
    { start: 0, w: 16 },  // row 3
    { start: 0, w: 16 },  // row 4
    { start: 0, w: 16 },  // row 5
    { start: 0, w: 16 },  // row 6
    { start: 0, w: 16 },  // row 7
    { start: 0, w: 16 },  // row 8
    { start: 0, w: 16 },  // row 9
    { start: 0, w: 16 },  // row 10
    { start: 0, w: 16 },  // row 11
    { start: 1, w: 14 },  // row 12
    { start: 2, w: 12 },  // row 13
    { start: 3, w: 10 },  // row 14
    { start: 4, w: 8 },   // row 15
  ];

  rows.forEach((row, j) => {
    // Edge pixels (dark brown)
    ctx.fillStyle = darkBrown;
    ctx.fillRect(ox + row.start * size, oy + j * size, size, size);
    ctx.fillRect(ox + (row.start + row.w - 1) * size, oy + j * size, size, size);
    // Inner pixels (brown)
    ctx.fillStyle = brown;
    ctx.fillRect(ox + (row.start + 1) * size, oy + j * size, (row.w - 2) * size, size);
  });

  // Chocolate chips scattered across the cookie
  const chips = [
    [3, 2], [7, 2], [11, 3],
    [2, 5], [8, 5], [13, 5],
    [4, 7], [9, 7],
    [1, 9], [6, 9], [11, 9],
    [3, 11], [8, 11], [12, 11],
    [5, 13], [10, 13],
  ];
  ctx.fillStyle = chip;
  chips.forEach(([cx, cy]) => {
    ctx.fillRect(ox + cx * size, oy + cy * size, size, size);
  });

  // Shine highlight
  ctx.fillStyle = 'rgba(255,255,200,0.35)';
  ctx.beginPath();
  ctx.arc(ox + 5 * size, oy + 3 * size, 3 * size, 0, Math.PI * 2);
  ctx.fill();
};

// Rainbow sprinkle particle (small)
export const drawSprinkle = (ctx, ox, oy, s, colorIdx) => {
  ctx.fillStyle = PALETTE[colorIdx] || '#FF69B4';
  ctx.fillRect(ox, oy, s, s);
};

// Star/sparkle effect
export const drawSparkle = (ctx, ox, oy, s, frame) => {
  const color = frame % 2 === 0 ? 28 : 10;
  const x = (i) => ox + i * s;
  const y = (j) => oy + j * s;
  const px = (i, j) => { ctx.fillStyle = PALETTE[color]; ctx.fillRect(x(i), y(j), s, s); };

  // Cross sparkle
  px(2, 0);
  px(2, 1);
  px(0, 2); px(1, 2); px(2, 2); px(3, 2); px(4, 2);
  px(2, 3);
  px(2, 4);
};
