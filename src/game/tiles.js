import { TILE, PALETTE } from './config';

// Draw a pixel at grid position (gx, gy) on a canvas context
function drawPixel(ctx, gx, gy, colorIdx, pixelSize) {
  if (!PALETTE[colorIdx]) return;
  ctx.fillStyle = PALETTE[colorIdx];
  ctx.fillRect(gx * pixelSize, gy * pixelSize, pixelSize, pixelSize);
}

// Sky tile (background)
export const drawSkyTile = (ctx, x, y) => {
  const p = 2; // pixel size within tile
  ctx.fillStyle = PALETTE[1];
  ctx.fillRect(x, y, TILE, TILE);
  // occasional light cloud wisps
  const hash = ((x ^ y) * 7) & 0xFF;
  if (hash < 30) {
    ctx.fillStyle = PALETTE[2];
    for (let i = 0; i < 6; i++) {
      drawPixel(ctx, Math.abs(hash + i * 3) % 12, Math.abs(hash + i * 5) % 12, 2, p);
    }
  }
};

// Cloud ground tile
export const drawCloudTile = (ctx, x, y) => {
  const p = 2;
  // Base cloud color
  ctx.fillStyle = PALETTE[4];
  ctx.fillRect(x, y, TILE, TILE);
  // Fluffy top bumps
  ctx.fillStyle = PALETTE[3];
  ctx.fillRect(x + 4, y, TILE - 8, 6);
  ctx.fillRect(x + 8, y - 2, TILE - 16, 4);
  // Bottom shadow
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(x + 2, y + TILE - 4, TILE - 4, 4);
  // Puffy circles
  ctx.fillStyle = PALETTE[3];
  const circleSize = 8;
  for (let i = 0; i < 4; i++) {
    const cx = x + 6 + i * 8;
    const cy = y + 4;
    ctx.beginPath();
    ctx.arc(cx, cy, circleSize, 0, Math.PI * 2);
    ctx.fill();
  }
  // Highlight dots
  ctx.fillStyle = PALETTE[2];
  for (let i = 0; i < 3; i++) {
    drawPixel(ctx, 1 + i * 4, 3, 2, p);
  }
};

// Rainbow platform tile (top surface)
export const drawRainbowTile = (ctx, x, y) => {
  const p = 2;
  // Draw arched rainbow pattern
  const colors = [14, 15, 16, 17, 18, 19]; // ROYGBV
  const stripH = Math.ceil(TILE / colors.length);
  colors.forEach((c, i) => {
    ctx.fillStyle = PALETTE[c];
    const sy = y + i * stripH;
    const sh = Math.ceil(stripH) + (i === colors.length - 1 ? 1 : 0);
    ctx.fillRect(x, sy, TILE, sh);
  });
  // Shimmer highlight on top
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(x, y, TILE, 3);
};

// Rainbow platform bottom (continues rainbow)
export const drawRainbowBottom = (ctx, x, y) => {
  const p = 2;
  const colors = [19, 18, 17, 16, 15, 14]; // reversed
  const stripH = Math.ceil(TILE / colors.length);
  colors.forEach((c, i) => {
    ctx.fillStyle = PALETTE[c];
    const sy = y + i * stripH;
    const sh = Math.ceil(stripH) + (i === colors.length - 1 ? 1 : 0);
    ctx.fillRect(x, sy, TILE, sh);
  });
};

// Draw a full rainbow platform block
export const drawRainbowBlock = (ctx, x, y, height) => {
  height = height || 2;
  for (let row = 0; row < height; row++) {
    if (row === 0) {
      drawRainbowTile(ctx, x, y + row * TILE);
    } else {
      drawRainbowBottom(ctx, x, y + row * TILE);
    }
  }
};
