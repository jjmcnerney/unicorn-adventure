import { useState, useEffect, useRef, useCallback } from 'react';
import { TILE, CANVAS_W, CANVAS_H, LEVEL_W, GRAVITY, JUMP_FORCE, MOVE_SPEED, PLAYER_W, PLAYER_H, PALETTE } from './config';
import { drawSkyTile, drawCloudTile, drawRainbowBlock } from './tiles';
import { drawUnicorn, drawFish, drawCrown, drawCookie, drawSprinkle, drawSparkle } from './sprites';
import { platforms, initialEnemies, initialCrowns, cookie, clouds } from './level';

const SPRINKLE_COLORS = [23, 24, 25, 26, 27, 6, 16, 19];
const COYOTE_FRAMES = 8; // ~133ms of grace period after leaving a ledge

function initGameState() {
  return {
    player: {
      x: 2 * TILE,
      y: CANVAS_H - TILE * 2 - PLAYER_H,
      vx: 0,
      vy: 0,
      w: PLAYER_W,
      h: PLAYER_H,
      grounded: false,
      facing: 1, // 1 = right, -1 = left
      coyoteTimer: 0, // frames of coyote time remaining after leaving a ledge
    },
    camera: { x: 0 },
    enemies: initialEnemies.map(e => ({ ...e })),
    crowns: initialCrowns.map(c => ({ ...c })),
    cookie: { ...cookie },
    sprinkles: [], // particles
    sparkles: [], // collect sparkles
    score: 0,
    gameOver: false,
    gameWon: false,
    frame: 0,
  };
}

export default function Game() {
  const canvasRef = useRef(null);
  const gameRef = useRef(initGameState());
  const keysRef = useRef({});
  const animRef = useRef(null);

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
      }
      keysRef.current[e.code] = true;

      // Restart on Enter
      const game = gameRef.current;
      if ((game.gameOver || game.gameWon) && e.code === 'Enter') {
        gameRef.current = initGameState();
        setScore(0);
        setGameOver(false);
        setGameWon(false);
      }
    };
    const handleKeyUp = (e) => {
      keysRef.current[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Collision: AABB
  const overlaps = (a, b) => {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  };

  // Collision: point vs platform list
  const isOnPlatform = (x, y) => {
    return platforms.some(p =>
      x + 2 >= p.x * TILE &&
      x + PLAYER_W - 2 <= (p.x + p.w) * TILE &&
      y >= p.y &&
      y <= p.y + p.h * TILE
    );
  };

  // Main game loop
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const game = gameRef.current;
    const keys = keysRef.current;

    game.frame++;

    if (!game.gameOver && !game.gameWon) {
      // === PLAYER MOVEMENT ===
      const player = game.player;

      // Horizontal
      if (keys['ArrowLeft'] || keys['KeyA']) {
        player.vx = -MOVE_SPEED;
        player.facing = -1;
      } else if (keys['ArrowRight'] || keys['KeyD']) {
        player.vx = MOVE_SPEED;
        player.facing = 1;
      } else {
        player.vx = 0;
      }

      // Coyote time: countdown after leaving a ledge; resets when landing
      if (!player.grounded && player.coyoteTimer > 0) {
        player.coyoteTimer--;
      }

      // Jump — allowed while grounded or during coyote time window
      if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && (player.grounded || player.coyoteTimer > 0)) {
        player.vy = JUMP_FORCE;
        player.grounded = false;
        player.coyoteTimer = 0; // consume coyote time
      }

      // Gravity
      player.vy += GRAVITY;

      // Apply velocity
      player.x += player.vx;
      player.y += player.vy;

      // Clamp left edge
      if (player.x < 0) player.x = 0;

      // Platform collision
      player.grounded = false;

      // Check landing on platforms
      const feetY = player.y + player.h;
      for (const p of platforms) {
        const px1 = p.x * TILE;
        const px2 = (p.x + p.w) * TILE;
        const py1 = p.y;
        const py2 = p.y + p.h * TILE;

        // Landing on top
        if (player.vy >= 0 && // falling or still
            feetY >= py1 && feetY - player.vy <= py1 + 4 && // was above, now at/below
            player.x + player.w > px1 + 4 && player.x < px2 - 4) {
          player.y = py1 - player.h;
          player.vy = 0;
          player.grounded = true;
          player.coyoteTimer = COYOTE_FRAMES; // reset coyote time on landing
        }

        // Hitting bottom of platform
        if (player.vy < 0 &&
            player.y <= py2 && player.y - player.vy >= py2 - 4 &&
            player.x + player.w > px1 + 4 && player.x < px2 - 4) {
          player.y = py2;
          player.vy = 0;
        }

        // Side collision
        if (player.y + player.h > py1 + 4 && player.y < py2 - 4) {
          if (player.vx > 0 && player.x + player.w > px1 && player.x + player.w - player.vx <= px1) {
            player.x = px1 - player.w;
            player.vx = 0;
          } else if (player.vx < 0 && player.x < px2 && player.x - player.vx >= px2) {
            player.x = px2;
            player.vx = 0;
          }
        }
      }

      // Fall off screen = game over
      if (player.y > CANVAS_H + 50) {
        game.gameOver = true;
        setGameOver(true);
      }

      // === CAMERA ===
      const targetCam = player.x - CANVAS_W / 3;
      game.camera.x += (targetCam - game.camera.x) * 0.1;
      game.camera.x = Math.max(0, Math.min(LEVEL_W - CANVAS_W, game.camera.x));

      // === ENEMIES ===
      for (const enemy of game.enemies) {
        if (!enemy.alive) continue;

        // Patrol movement
        enemy.x += enemy.speed * enemy.dir;
        if (enemy.x <= enemy.patrolStart || enemy.x + enemy.w >= enemy.patrolEnd) {
          enemy.dir *= -1;
        }

        // Check collision with player
        const playerHitbox = { x: player.x + 4, y: player.y + 4, w: player.w - 8, h: player.h - 8 };
        const enemyHitbox = { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h };

        if (overlaps(playerHitbox, enemyHitbox)) {
          // Stomping: player is above enemy
          if (player.vy > 0 && player.y + player.h - 4 < enemy.y + enemy.h / 2) {
            enemy.alive = false;
            player.vy = JUMP_FORCE * 0.7;
            game.score += 100;
            setScore(game.score);

            // Create rainbow sprinkle explosion
            for (let i = 0; i < 20; i++) {
              game.sprinkles.push({
                x: enemy.x + enemy.w / 2,
                y: enemy.y + enemy.h / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: -Math.random() * 6 - 2,
                life: 60 + Math.random() * 30,
                maxLife: 60 + Math.random() * 30,
                color: SPRINKLE_COLORS[Math.floor(Math.random() * SPRINKLE_COLORS.length)],
                size: 3 + Math.random() * 4,
              });
            }
          } else {
            // Player hit by enemy = game over
            game.gameOver = true;
            setGameOver(true);
          }
        }
      }

      // === CROWNS ===
      for (const crown of game.crowns) {
        if (crown.collected) continue;
        if (overlaps(
          { x: player.x, y: player.y, w: player.w, h: player.h },
          { x: crown.x, y: crown.y, w: crown.w, h: crown.h }
        )) {
          crown.collected = true;
          game.score += 50;
          setScore(game.score);

          // Sparkle effect
          for (let i = 0; i < 8; i++) {
            game.sparkles.push({
              x: crown.x + crown.w / 2,
              y: crown.y + crown.h / 2,
              vx: (Math.random() - 0.5) * 4,
              vy: -Math.random() * 3 - 1,
              life: 30,
            });
          }
        }
      }

      // === COOKIE GOAL ===
      if (overlaps(
        { x: player.x, y: player.y, w: player.w, h: player.h },
        { x: game.cookie.x, y: game.cookie.y, w: game.cookie.w, h: game.cookie.h }
      )) {
        game.gameWon = true;
        setGameWon(true);
        // Celebration sprinkles
        for (let i = 0; i < 50; i++) {
          game.sprinkles.push({
            x: game.cookie.x + game.cookie.w / 2,
            y: game.cookie.y + game.cookie.h / 2,
            vx: (Math.random() - 0.5) * 12,
            vy: -Math.random() * 10 - 2,
            life: 90 + Math.random() * 30,
            maxLife: 90 + Math.random() * 30,
            color: SPRINKLE_COLORS[Math.floor(Math.random() * SPRINKLE_COLORS.length)],
            size: 3 + Math.random() * 5,
          });
        }
      }
    }

    // === UPDATE PARTICLES ===
    game.sprinkles = game.sprinkles.filter(s => {
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.15; // gravity
      s.life--;
      return s.life > 0;
    });
    game.sparkles = game.sparkles.filter(s => {
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.05;
      s.life--;
      return s.life > 0;
    });

    // === RENDER ===
    const cam = game.camera.x;
    const frame = game.frame;

    // Clear with sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.6, '#B0E0FF');
    gradient.addColorStop(1, '#E0F0FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.save();
    ctx.translate(-Math.round(cam), 0);

    // Background clouds
    for (const cloud of clouds) {
      const sx = cloud.x - cam * 0.3; // parallax
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.ellipse(sx + cam + cloud.w / 2, cloud.y + cloud.h / 2, cloud.w / 2, cloud.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(sx + cam + cloud.w / 3, cloud.y + cloud.h / 3, cloud.w / 3, cloud.h / 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cloud ground (background layer)
    const groundStart = Math.max(0, Math.floor(cam / TILE) - 1);
    const groundEnd = Math.min(Math.floor(LEVEL_W / TILE) + 2, Math.ceil((cam + CANVAS_W) / TILE) + 1);
    for (let gx = groundStart; gx < groundEnd; gx++) {
      drawCloudTile(ctx, gx * TILE, CANVAS_H - TILE);
      drawCloudTile(ctx, gx * TILE, CANVAS_H - TILE * 2);
    }

    // Rainbow platforms
    for (const p of platforms) {
      for (let tx = 0; tx < p.w; tx++) {
        for (let ty = 0; ty < p.h; ty++) {
          drawRainbowBlock(ctx, (p.x + tx) * TILE, p.y + ty * TILE, 1);
        }
      }
    }

    // Crowns
    for (const crown of game.crowns) {
      if (crown.collected) continue;
      const floatY = Math.sin(frame * 0.08) * 3;
      drawCrown(ctx, crown.x, crown.y + floatY, 3, frame);
    }

    // Cookie goal
    const cookieBob = Math.sin(frame * 0.05) * 4;
    const cookieScale = 3;
    drawCookie(ctx, game.cookie.x, game.cookie.y + cookieBob, cookieScale, frame);
    // Glow
    ctx.fillStyle = `rgba(255, 200, 100, ${0.15 + Math.sin(frame * 0.1) * 0.1})`;
    ctx.beginPath();
    ctx.arc(game.cookie.x + game.cookie.w / 2, game.cookie.y + game.cookie.h / 2 + cookieBob, 35, 0, Math.PI * 2);
    ctx.fill();

    // Enemies
    for (const enemy of game.enemies) {
      if (!enemy.alive) continue;
      const fishScale = 3;
      drawFish(ctx, enemy.x, enemy.y, fishScale, frame);
    }

    // Player
    const player = game.player;
    if (!game.gameOver) {
      // Flip context for facing direction
      ctx.save();
      const isMoving = player.vx !== 0;
      if (player.facing === -1) {
        ctx.translate(player.x + player.w, player.y);
        ctx.scale(-1, 1);
        drawUnicorn(ctx, 0, 0, 2, frame, isMoving);
      } else {
        drawUnicorn(ctx, player.x, player.y, 2, frame, isMoving);
      }
      ctx.restore();
    }

    // Sprinkle particles
    for (const s of game.sprinkles) {
      const alpha = s.life / (s.maxLife || 60);
      ctx.globalAlpha = alpha;
      drawSprinkle(ctx, s.x, s.y, s.size, s.color);
    }
    ctx.globalAlpha = 1;

    // Sparkle particles
    for (const s of game.sparkles) {
      const alpha = s.life / 30;
      ctx.globalAlpha = alpha;
      drawSparkle(ctx, s.x - 6, s.y - 6, 2, frame);
    }
    ctx.globalAlpha = 1;

    ctx.restore();

    // === HUD ===
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, CANVAS_W, 40);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`👑 ${game.score}`, 16, 28);

    // Crown count
    const crownsCollected = game.crowns.filter(c => c.collected).length;
    ctx.fillText(`👑 ${crownsCollected}/${game.crowns.length}`, 180, 28);

    // Game over screen
    if (game.gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = '#FF4444';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_W / 2, CANVAS_H / 2 - 20);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '24px monospace';
      ctx.fillText('Press ENTER to restart', CANVAS_W / 2, CANVAS_H / 2 + 30);
    }

    // Win screen
    if (game.gameWon) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🍪 YUM! YOU WIN! 🍪', CANVAS_W / 2, CANVAS_H / 2 - 40);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '24px monospace';
      ctx.fillText(`Score: ${game.score}`, CANVAS_W / 2, CANVAS_H / 2 + 10);
      ctx.fillText('Press ENTER to play again', CANVAS_W / 2, CANVAS_H / 2 + 50);

      // Continuous celebration sprinkles
      if (frame % 5 === 0) {
        for (let i = 0; i < 5; i++) {
          game.sprinkles.push({
            x: Math.random() * CANVAS_W + cam,
            y: -10,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 3 + 1,
            life: 80,
            maxLife: 80,
            color: SPRINKLE_COLORS[Math.floor(Math.random() * SPRINKLE_COLORS.length)],
            size: 3 + Math.random() * 4,
          });
        }
      }
    }

    // Instructions (bottom of screen)
    if (frame < 300) {
      const alpha = frame < 240 ? 1 : (300 - frame) / 60;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(CANVAS_W / 2 - 200, CANVAS_H - 50, 400, 36);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('← → to move  |  ↑ / SPACE to jump', CANVAS_W / 2, CANVAS_H - 28);
      ctx.globalAlpha = 1;
    }

    animRef.current = requestAnimationFrame(gameLoop);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restart handler
  const handleRestart = useCallback(() => {
    gameRef.current = initGameState();
    setScore(0);
    setGameOver(false);
    setGameWon(false);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        tabIndex={0}
        autoFocus
        style={{
          border: '4px solid #FF69B4',
          borderRadius: '8px',
          imageRendering: 'pixelated',
          outline: 'none',
          boxShadow: '0 0 20px rgba(255,105,180,0.4)',
        }}
      />
      {(gameOver || gameWon) && (
        <button
          onClick={handleRestart}
          style={{
            padding: '10px 24px',
            fontSize: '18px',
            fontWeight: 'bold',
            background: '#FF69B4',
            color: '#FFF',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          🦄 Play Again
        </button>
      )}
    </div>
  );
}
