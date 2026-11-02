import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Rocket,
  Trophy,
  RotateCcw,
  Play,
  Pause,
  ArrowLeft,
  ArrowRight,
  Shield,
  Zap,
  Sparkles,
  ChevronRight,
  Crosshair,
} from 'lucide-react';

interface Props {
  isDark: boolean;
}

interface Star {
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isEnemy?: boolean;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  width: number;
  height: number;
  color: string;
  isBoss?: boolean;
  shootCooldown: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
}

const STORAGE_KEY_LEVEL = 'era9999_space_unlocked_level';
const STORAGE_KEY_HIGH_SCORE = 'era9999_space_high_score';

export const SpaceShooterGame: React.FC<Props> = ({ isDark }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Unlocked level (1 to 50)
  const [unlockedLevel, setUnlockedLevel] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LEVEL);
    return Math.max(1, Math.min(50, parseInt(saved || '1', 10)));
  });
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HIGH_SCORE);
    return parseInt(saved || '0', 10);
  });

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'level_cleared' | 'game_over' | 'victory'>('idle');
  const [lastFailedLevel, setLastFailedLevel] = useState<number>(1);
  const [enemiesRemaining, setEnemiesRemaining] = useState(10);
  const [autoFire, setAutoFire] = useState(true);

  // Game internal refs for 60fps loop
  const playerRef = useRef({
    x: 180,
    y: 360,
    width: 32,
    height: 36,
    speed: 5.5,
    movingLeft: false,
    movingRight: false,
    invulnerableTimer: 0,
  });

  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const lastShotTimeRef = useRef(0);
  const enemiesSpawnedCountRef = useRef(0);
  const totalEnemiesForLevelRef = useRef(10);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize stars background
  useEffect(() => {
    const stars: Star[] = [];
    for (let i = 0; i < 45; i++) {
      stars.push({
        x: Math.random() * 380,
        y: Math.random() * 440,
        speed: 0.5 + Math.random() * 1.8,
        size: 1 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.7,
      });
    }
    starsRef.current = stars;
  }, []);

  // Compute level parameters (Levels 1 to 50)
  const getLevelConfig = useCallback((lvl: number) => {
    const isBossLevel = lvl % 5 === 0;
    const enemyCount = isBossLevel ? 8 + Math.floor(lvl * 0.6) : 10 + Math.floor(lvl * 0.9);
    const enemySpeed = 1.0 + (lvl * 0.045);
    const enemyHp = 1 + Math.floor(lvl / 7);
    const shootChance = Math.min(0.025, 0.003 + (lvl * 0.0006));

    return {
      enemyCount,
      enemySpeed,
      enemyHp,
      isBossLevel,
      shootChance,
    };
  }, []);

  // Spawn an explosion
  const createExplosion = (x: number, y: number, color: string, count = 14) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1,
        size: 2 + Math.random() * 3,
      });
    }
  };

  // Start specific level
  const startLevel = useCallback((lvl: number) => {
    const config = getLevelConfig(lvl);
    setCurrentLevel(lvl);
    totalEnemiesForLevelRef.current = config.enemyCount;
    enemiesSpawnedCountRef.current = 0;
    setEnemiesRemaining(config.enemyCount);

    playerRef.current.x = 190;
    playerRef.current.y = 370;
    playerRef.current.movingLeft = false;
    playerRef.current.movingRight = false;
    playerRef.current.invulnerableTimer = 60; // 1 second protection

    bulletsRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];
    setGameState('playing');
  }, [getLevelConfig]);

  // Trigger Game Over and reset progress completely back to Level 1
  const triggerGameOver = useCallback((failedAtLevel: number) => {
    setLastFailedLevel(failedAtLevel);
    setGameState('game_over');
    setUnlockedLevel(1);
    localStorage.setItem(STORAGE_KEY_LEVEL, '1');
    setCurrentLevel(1);
  }, []);

  // Start / Restart game from level 1 with 3 hearts
  const startNewGame = useCallback(() => {
    setLives(3);
    setScore(0);
    setUnlockedLevel(1);
    localStorage.setItem(STORAGE_KEY_LEVEL, '1');
    startLevel(1);
  }, [startLevel]);

  // Fire laser
  const firePlayerBullet = useCallback(() => {
    const now = Date.now();
    if (now - lastShotTimeRef.current < 160) return; // rate of fire cap
    lastShotTimeRef.current = now;

    const p = playerRef.current;
    // Dual plasma lasers
    bulletsRef.current.push(
      { x: p.x - 8, y: p.y - 12, vx: 0, vy: -9, isEnemy: false },
      { x: p.x + 8, y: p.y - 12, vx: 0, vy: -9, isEnemy: false }
    );
  }, []);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'a', 'd', ' ', 'w'].includes(key)) {
        if (gameState === 'playing') e.preventDefault();
      }

      if (key === 'arrowleft' || key === 'a') playerRef.current.movingLeft = true;
      if (key === 'arrowright' || key === 'd') playerRef.current.movingRight = true;
      if (key === ' ' || key === 'arrowup' || key === 'w') {
        if (gameState === 'playing') firePlayerBullet();
        else if (gameState === 'idle' || gameState === 'game_over') startNewGame();
      }
      if (key === 'p') {
        setGameState((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') playerRef.current.movingLeft = false;
      if (key === 'arrowright' || key === 'd') playerRef.current.movingRight = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [firePlayerBullet, gameState, startNewGame]);

  // Main game tick & render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let enemySpawnTimer = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // 1. Draw Space background & scrolling stars
      ctx.fillStyle = isDark ? '#050711' : '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Stars
      ctx.fillStyle = '#ffffff';
      starsRef.current.forEach((star) => {
        if (gameState === 'playing') {
          star.y += star.speed;
          if (star.y > height) {
            star.y = 0;
            star.x = Math.random() * width;
          }
        }
        ctx.globalAlpha = star.opacity;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });
      ctx.globalAlpha = 1;

      // If Playing: Update Logic
      if (gameState === 'playing') {
        const p = playerRef.current;
        const config = getLevelConfig(currentLevel);

        // Move Player
        if (p.movingLeft && p.x > p.width / 2 + 6) p.x -= p.speed;
        if (p.movingRight && p.x < width - p.width / 2 - 6) p.x += p.speed;

        // Auto fire
        if (autoFire && Date.now() - lastShotTimeRef.current >= 200) {
          firePlayerBullet();
        }

        if (p.invulnerableTimer > 0) p.invulnerableTimer--;

        // Spawn Enemies
        enemySpawnTimer++;
        if (
          enemySpawnTimer % Math.max(35, 75 - Math.floor(currentLevel * 0.8)) === 0 &&
          enemiesSpawnedCountRef.current < totalEnemiesForLevelRef.current
        ) {
          enemiesSpawnedCountRef.current++;
          const isBoss = config.isBossLevel && enemiesSpawnedCountRef.current === totalEnemiesForLevelRef.current;
          const eWidth = isBoss ? 56 : 28;
          const eHeight = isBoss ? 48 : 24;
          const hp = isBoss ? config.enemyHp * 6 : config.enemyHp;

          enemiesRef.current.push({
            id: Date.now() + Math.random(),
            x: 20 + Math.random() * (width - 40 - eWidth),
            y: -30,
            vx: (Math.random() - 0.5) * (0.8 + currentLevel * 0.05),
            vy: config.enemySpeed * (isBoss ? 0.6 : 0.9 + Math.random() * 0.3),
            hp,
            maxHp: hp,
            width: eWidth,
            height: eHeight,
            color: isBoss ? '#f43f5e' : currentLevel > 30 ? '#a855f7' : currentLevel > 15 ? '#f97316' : '#06b6d4',
            isBoss,
            shootCooldown: Math.floor(Math.random() * 60),
          });
        }

        // Update Bullets
        bulletsRef.current.forEach((b) => {
          b.x += b.vx;
          b.y += b.vy;
        });
        bulletsRef.current = bulletsRef.current.filter((b) => b.y > -20 && b.y < height + 20);

        // Update Enemies
        enemiesRef.current.forEach((enemy) => {
          enemy.x += enemy.vx;
          enemy.y += enemy.vy;

          if (enemy.x <= 10 || enemy.x >= width - enemy.width - 10) {
            enemy.vx *= -1; // bounce off walls
          }

          // Enemy shooting
          enemy.shootCooldown++;
          if (enemy.shootCooldown > 90 && Math.random() < config.shootChance) {
            enemy.shootCooldown = 0;
            bulletsRef.current.push({
              x: enemy.x + enemy.width / 2,
              y: enemy.y + enemy.height,
              vx: 0,
              vy: 3.5 + currentLevel * 0.05,
              isEnemy: true,
            });
          }

          // Enemy reached bottom: penalty to player
          if (enemy.y > height) {
            enemy.hp = 0;
            setLives((l) => {
              const next = l - 1;
              if (next <= 0) {
                triggerGameOver(currentLevel);
              }
              return Math.max(0, next);
            });
          }
        });

        // Bullet vs Enemy Collisions
        bulletsRef.current.forEach((bullet) => {
          if (bullet.isEnemy) {
            // Check collision with player
            if (p.invulnerableTimer <= 0) {
              const dx = Math.abs(bullet.x - p.x);
              const dy = Math.abs(bullet.y - p.y);
              if (dx < p.width / 2 + 4 && dy < p.height / 2 + 4) {
                bullet.y = height + 100; // destroy bullet
                createExplosion(p.x, p.y, '#38bdf8', 12);
                p.invulnerableTimer = 60; // 1s invulnerability
                setLives((l) => {
                  const next = l - 1;
                  if (next <= 0) {
                    triggerGameOver(currentLevel);
                  }
                  return Math.max(0, next);
                });
              }
            }
          } else {
            // Player bullet vs Enemy
            enemiesRef.current.forEach((enemy) => {
              if (
                bullet.x > enemy.x &&
                bullet.x < enemy.x + enemy.width &&
                bullet.y > enemy.y &&
                bullet.y < enemy.y + enemy.height
              ) {
                bullet.y = -100; // destroy bullet
                enemy.hp--;
                createExplosion(bullet.x, bullet.y, enemy.color, 4);

                if (enemy.hp <= 0) {
                  createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color, enemy.isBoss ? 28 : 14);
                  setScore((s) => {
                    const added = enemy.isBoss ? 500 : 50 + currentLevel * 10;
                    const next = s + added;
                    if (next > highScore) {
                      setHighScore(next);
                      localStorage.setItem(STORAGE_KEY_HIGH_SCORE, String(next));
                    }
                    return next;
                  });
                }
              }
            });
          }
        });

        // Remove dead enemies
        const aliveEnemies = enemiesRef.current.filter((e) => e.hp > 0);
        enemiesRef.current = aliveEnemies;

        const remainingTotal = totalEnemiesForLevelRef.current - enemiesSpawnedCountRef.current + aliveEnemies.length;
        setEnemiesRemaining(remainingTotal);

        // Check Level Win
        if (enemiesSpawnedCountRef.current >= totalEnemiesForLevelRef.current && aliveEnemies.length === 0) {
          if (currentLevel >= 50) {
            setGameState('victory');
          } else {
            setGameState('level_cleared');
            const nextLvl = currentLevel + 1;
            if (nextLvl > unlockedLevel) {
              setUnlockedLevel(nextLvl);
              localStorage.setItem(STORAGE_KEY_LEVEL, String(nextLvl));
            }
          }
        }
      }

      // 2. Draw Bullets
      bulletsRef.current.forEach((b) => {
        ctx.save();
        if (b.isEnemy) {
          ctx.fillStyle = '#f43f5e';
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(b.x, b.y, 3.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#22d3ee';
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 10;
          ctx.fillRect(b.x - 1.5, b.y, 3, 11);
        }
        ctx.restore();
      });

      // 3. Draw Enemies
      enemiesRef.current.forEach((enemy) => {
        ctx.save();
        ctx.fillStyle = enemy.color;
        ctx.shadowColor = enemy.color;
        ctx.shadowBlur = 10;

        // Draw futuristic enemy ship
        ctx.beginPath();
        if (enemy.isBoss) {
          // Boss Ship
          ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
          ctx.lineTo(enemy.x + enemy.width, enemy.y + 10);
          ctx.lineTo(enemy.x + enemy.width - 10, enemy.y);
          ctx.lineTo(enemy.x + 10, enemy.y);
          ctx.lineTo(enemy.x, enemy.y + 10);
          ctx.closePath();
          ctx.fill();

          // Boss Core
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 7, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Standard Scout/Fighter
          ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
          ctx.lineTo(enemy.x + enemy.width, enemy.y);
          ctx.lineTo(enemy.x + enemy.width / 2, enemy.y + 6);
          ctx.lineTo(enemy.x, enemy.y);
          ctx.closePath();
          ctx.fill();
        }

        // HP bar if damaged
        if (enemy.hp < enemy.maxHp) {
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.fillRect(enemy.x, enemy.y - 8, enemy.width, 3);
          ctx.fillStyle = '#10b981';
          ctx.fillRect(enemy.x, enemy.y - 8, (enemy.width * enemy.hp) / enemy.maxHp, 3);
        }
        ctx.restore();
      });

      // 4. Draw Particles
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.025;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.restore();
      });
      particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0);

      // 5. Draw Player Spaceship
      const p = playerRef.current;
      ctx.save();

      // Invulnerable flicker
      if (p.invulnerableTimer > 0 && Math.floor(p.invulnerableTimer / 4) % 2 === 0) {
        ctx.globalAlpha = 0.4;
      }

      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 14;

      // Draw Jet Body
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - p.height / 2); // Nose
      ctx.lineTo(p.x + p.width / 2, p.y + p.height / 2); // Right wing tip
      ctx.lineTo(p.x + p.width / 4, p.y + p.height / 3); // Wing recess
      ctx.lineTo(p.x - p.width / 4, p.y + p.height / 3); // Wing recess
      ctx.lineTo(p.x - p.width / 2, p.y + p.height / 2); // Left wing tip
      ctx.closePath();
      ctx.fill();

      // Cockpit Glow
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y - 2, 4, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Thruster Flame
      ctx.fillStyle = '#f97316';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(p.x - 5, p.y + p.height / 3);
      ctx.lineTo(p.x, p.y + p.height / 2 + 10 + Math.random() * 5);
      ctx.lineTo(p.x + 5, p.y + p.height / 3);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [autoFire, currentLevel, firePlayerBullet, gameState, getLevelConfig, highScore, isDark, triggerGameOver]);

  return (
    <section
      id="space-shooter"
      className={`rounded-3xl transition-all duration-300 p-4 sm:p-8 border relative overflow-hidden max-w-full ${
        isDark
          ? 'glass-panel-dark border-indigo-500/30 shadow-[0_0_45px_rgba(99,102,241,0.12)]'
          : 'glass-panel-light border-slate-300 shadow-xl'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-indigo-500/20">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              isDark
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
            }`}
          >
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2
                className={`text-xl sm:text-2xl font-bold font-cyber tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                حرب الفضاء · 50 مستوى
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-mono-num bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                50 LEVELS
              </span>
            </div>
            <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              أطلق صواريخ البلازما، دمّر أساطيل العدو، وتدرّج في 50 مستوى تزداد صعوبة وسرعة!
            </p>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="flex items-center gap-2.5 flex-wrap self-end sm:self-center">
          {/* Current Level Pill */}
          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-white border-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <div className="text-right">
              <span className="block text-[9px] text-slate-400">المستوى</span>
              <span className="font-mono-num font-bold text-sm text-cyan-300">
                LVL {currentLevel} / 50
              </span>
            </div>
          </div>

          {/* Shields / Lives */}
          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-white border-slate-200'
            }`}
          >
            <Shield className="w-4 h-4 text-rose-400" />
            <div className="text-right">
              <span className="block text-[9px] text-slate-400">الدروع</span>
              <div className="flex items-center gap-0.5 text-xs text-rose-400">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className={i < lives ? 'opacity-100' : 'opacity-20'}>
                    ❤️
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Score & Best */}
          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-white border-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <div className="text-right">
              <span className="block text-[9px] text-slate-400">النقاط</span>
              <span className="font-mono-num font-bold text-sm text-amber-400">
                {score}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Level Selector Bar (1 to 50) */}
      <div className="mt-4 pt-2 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <span className={`text-[11px] font-semibold shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          اختر مستوى متاح:
        </span>
        {Array.from({ length: Math.min(50, unlockedLevel + 2) }).map((_, idx) => {
          const lvl = idx + 1;
          const isUnlocked = lvl <= unlockedLevel;
          const isCurrent = lvl === currentLevel;
          const isBoss = lvl % 5 === 0;

          return (
            <button
              key={lvl}
              type="button"
              disabled={!isUnlocked}
              onClick={() => startLevel(lvl)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono-num shrink-0 transition-all ${
                isCurrent
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_#06b6d4]'
                  : isUnlocked
                  ? isBoss
                    ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                    : isDark
                    ? 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-cyan-400'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  : 'opacity-30 border border-transparent cursor-not-allowed text-slate-500'
              }`}
            >
              {isBoss ? `★ L${lvl}` : `L${lvl}`}
            </button>
          );
        })}
      </div>

      {/* Main Game Arena */}
      <div className="mt-5 flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-full overflow-hidden">
        {/* Canvas Display with Game Overlays */}
        <div className="relative w-full max-w-[340px] sm:max-w-[380px] mx-auto overflow-hidden">
          <div
            className={`p-2 rounded-2xl border transition-all ${
              isDark
                ? 'bg-slate-950/90 border-indigo-500/40 shadow-[0_0_35px_rgba(99,102,241,0.2)]'
                : 'bg-slate-900 border-slate-400 shadow-xl'
            }`}
          >
            <canvas
              ref={canvasRef}
              width={380}
              height={420}
              className="rounded-xl block w-full h-auto max-w-full aspect-[38/42] touch-none"
            />
          </div>

          {/* Overlays */}
          {gameState !== 'playing' && (
            <div className="absolute inset-0 rounded-2xl bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
              {gameState === 'idle' && (
                <>
                  <Rocket className="w-14 h-14 text-cyan-400 mb-3 animate-pulse" />
                  <h3 className="font-bold text-xl text-white font-cyber">حرب الفضاء</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
                    50 مستوى قتالي متدرج. تحكم في المقاتلة الفضائية وأسقط جميع طائرات الغزاة!
                  </p>
                  <button
                    type="button"
                    onClick={startNewGame}
                    className="mt-5 px-8 py-3 rounded-xl font-black text-sm bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>انطلاق (Level {unlockedLevel})</span>
                  </button>
                </>
              )}

              {gameState === 'paused' && (
                <>
                  <Pause className="w-12 h-12 text-amber-400 mb-3" />
                  <h3 className="font-bold text-lg text-white font-cyber">المعركة متوقفة مؤقتًا</h3>
                  <button
                    type="button"
                    onClick={() => setGameState('playing')}
                    className="mt-4 px-6 py-2.5 rounded-xl font-bold text-sm bg-amber-500 text-slate-950 shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>متابعة القتال</span>
                  </button>
                </>
              )}

              {gameState === 'level_cleared' && (
                <>
                  <Sparkles className="w-14 h-14 text-emerald-400 mb-2 animate-bounce" />
                  <h3 className="font-bold text-2xl text-emerald-300 font-cyber">تم اجتياز المستوى {currentLevel}!</h3>
                  <p className="text-xs text-slate-200 mt-1">
                    أحسنت! فُتح لك المستوى <strong className="text-cyan-400">{currentLevel + 1}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => startLevel(currentLevel + 1)}
                    className="mt-5 px-8 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>المستوى التالي ({currentLevel + 1})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {gameState === 'game_over' && (
                <>
                  <span className="text-4xl mb-2">💔</span>
                  <h3 className="font-bold text-2xl text-rose-400 font-cyber">استُنزفت القلوب الثلاثة!</h3>
                  <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xs leading-relaxed">
                    لقد خسرت قلوبك الثلاثة في المستوى <strong className="text-rose-400">{lastFailedLevel}</strong>، وتمت إعادتك للمستوى 1 للبدء من جديد.
                  </p>
                  <p className="text-xs font-mono-num text-cyan-300 mt-2">
                    النقاط المسجلة: <strong>{score}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={startNewGame}
                    className="mt-5 px-7 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>بدء اللعب من المستوى 1</span>
                  </button>
                </>
              )}

              {gameState === 'victory' && (
                <>
                  <Trophy className="w-16 h-16 text-amber-400 mb-2 animate-bounce" />
                  <h3 className="font-black text-2xl text-amber-300 font-cyber">نصر أسطوري!</h3>
                  <p className="text-xs text-slate-200 mt-1 max-w-xs">
                    لقد أكملت جميع الـ 50 مستوى في سنة 9999 وطهرت المجرة بالكامل!
                  </p>
                  <button
                    type="button"
                    onClick={startNewGame}
                    className="mt-5 px-8 py-3 rounded-xl font-bold text-sm bg-amber-400 text-slate-950 shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>لعب من جديد</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Controls Column (Touch D-Pad, Auto-Fire, Keys Info) */}
        <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
          {/* Action buttons (Pause, Restart, Auto-Fire Toggle) */}
          <div className="flex items-center gap-2.5 w-full justify-center flex-wrap">
            <button
              type="button"
              onClick={() => setAutoFire(!autoFire)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                autoFire
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-400'
                  : 'bg-white border-slate-300 text-slate-600'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>الإطلاق التلقائي: {autoFire ? 'مفعل ✓' : 'يدوي'}</span>
            </button>

            {gameState === 'playing' ? (
              <button
                type="button"
                onClick={() => setGameState('paused')}
                className={`p-2 rounded-xl border text-xs transition-colors ${
                  isDark
                    ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
                title="إيقاف مؤقت (P)"
              >
                <Pause className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => (gameState === 'paused' ? setGameState('playing') : startLevel(currentLevel))}
                className={`p-2 rounded-xl border text-xs text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/10 transition-colors`}
                title="استئناف / بدء"
              >
                <Play className="w-4 h-4 fill-current" />
              </button>
            )}

            <button
              type="button"
              onClick={() => startLevel(currentLevel)}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                isDark
                  ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-100'
              }`}
              title="إعادة بدء المستوى"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Touch Controls for Mobile (Dir=LTR so Left is Left and Right is Right) */}
          <div dir="ltr" className="flex flex-col items-center gap-2 pt-2">
            <span dir="rtl" className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              أزرار التحكم بالطائرة (للموبايل أو الأسهم):
            </span>

            <div dir="ltr" className="flex items-center gap-3">
              {/* LEFT BUTTON */}
              <button
                type="button"
                aria-label="Move Left (يسار)"
                title="يسار (Left)"
                onPointerDown={() => {
                  playerRef.current.movingLeft = true;
                }}
                onPointerUp={() => {
                  playerRef.current.movingLeft = false;
                }}
                onPointerLeave={() => {
                  playerRef.current.movingLeft = false;
                }}
                className={`w-16 h-14 rounded-2xl border flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-700 text-cyan-400 hover:border-cyan-400 hover:bg-slate-800 shadow-md'
                    : 'bg-white border-slate-300 text-cyan-700 hover:bg-slate-100 shadow-sm'
                }`}
              >
                <ArrowLeft className="w-7 h-7 stroke-[2.5]" />
              </button>

              {/* MANUAL FIRE BUTTON */}
              <button
                type="button"
                aria-label="Fire Lasers (إطلاق)"
                title="إطلاق ليزر (Shoot)"
                onClick={firePlayerBullet}
                className="w-16 h-14 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-bold flex flex-col items-center justify-center shadow-lg active:scale-90 cursor-pointer"
              >
                <Rocket className="w-5 h-5 fill-current" />
                <span className="text-[9px] mt-0.5">إطلاق</span>
              </button>

              {/* RIGHT BUTTON */}
              <button
                type="button"
                aria-label="Move Right (يمين)"
                title="يمين (Right)"
                onPointerDown={() => {
                  playerRef.current.movingRight = true;
                }}
                onPointerUp={() => {
                  playerRef.current.movingRight = false;
                }}
                onPointerLeave={() => {
                  playerRef.current.movingRight = false;
                }}
                className={`w-16 h-14 rounded-2xl border flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-700 text-cyan-400 hover:border-cyan-400 hover:bg-slate-800 shadow-md'
                    : 'bg-white border-slate-300 text-cyan-700 hover:bg-slate-100 shadow-sm'
                }`}
              >
                <ArrowRight className="w-7 h-7 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Quick instructions / tips */}
          <div
            className={`p-3 rounded-xl border text-[11px] max-w-xs text-center ${
              isDark
                ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            🚀 استخدم <strong>الأسهم ◄ ►</strong> أو <strong>A / D</strong> للتحرك. اضغط <strong>المسافة (Space)</strong> للإطلاق اليدوي.
          </div>
        </div>
      </div>
    </section>
  );
};
