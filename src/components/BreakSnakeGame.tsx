import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Gamepad2,
  Trophy,
  RotateCcw,
  Play,
  Pause,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Coffee,
} from 'lucide-react';

interface Props {
  isDark: boolean;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
interface Point {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const INITIAL_SPEED = 110; // ms per tick

const STORAGE_KEY_HIGH_SCORE = 'era9999_snake_high_score';

export const BreakSnakeGame: React.FC<Props> = ({ isDark }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'game_over'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HIGH_SCORE);
    return parseInt(saved || '0', 10);
  });

  const snakeRef = useRef<Point[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const directionRef = useRef<Direction>('UP');
  const nextDirectionRef = useRef<Direction>('UP');
  const appleRef = useRef<Point>({ x: 10, y: 5 });
  const gameLoopRef = useRef<number | null>(null);

  // Spawn apple in empty grid cell
  const spawnApple = useCallback((currentSnake: Point[]) => {
    let newApple: Point;
    let collision: boolean;
    do {
      newApple = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      collision = currentSnake.some((seg) => seg.x === newApple.x && seg.y === newApple.y);
    } while (collision);
    appleRef.current = newApple;
  }, []);

  // Reset and start new game
  const startGame = useCallback(() => {
    const initSnake: Point[] = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ];
    snakeRef.current = initSnake;
    directionRef.current = 'UP';
    nextDirectionRef.current = 'UP';
    setScore(0);
    spawnApple(initSnake);
    setGameState('playing');
  }, [spawnApple]);

  // Pause or Resume
  const togglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  };

  // Change direction safely
  const changeDirection = useCallback(
    (newDir: Direction) => {
      if (gameState !== 'playing') {
        if (gameState === 'idle' || gameState === 'game_over') {
          startGame();
        } else if (gameState === 'paused') {
          setGameState('playing');
        }
      }

      const cur = directionRef.current;
      if (newDir === 'UP' && cur !== 'DOWN') nextDirectionRef.current = 'UP';
      else if (newDir === 'DOWN' && cur !== 'UP') nextDirectionRef.current = 'DOWN';
      else if (newDir === 'LEFT' && cur !== 'RIGHT') nextDirectionRef.current = 'LEFT';
      else if (newDir === 'RIGHT' && cur !== 'LEFT') nextDirectionRef.current = 'RIGHT';
    },
    [gameState, startGame]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 's', 'a', 'd', ' '].includes(key)) {
        // Prevent window scrolling while playing
        if (gameState === 'playing') {
          e.preventDefault();
        }
      }

      if (key === 'arrowup' || key === 'w') changeDirection('UP');
      else if (key === 'arrowdown' || key === 's') changeDirection('DOWN');
      else if (key === 'arrowleft' || key === 'a') changeDirection('LEFT');
      else if (key === 'arrowright' || key === 'd') changeDirection('RIGHT');
      else if (key === ' ' || key === 'p') {
        e.preventDefault();
        if (gameState === 'playing' || gameState === 'paused') {
          togglePause();
        } else {
          startGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection, gameState, startGame]);

  // Game loop tick
  useEffect(() => {
    if (gameState !== 'playing') {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      return;
    }

    const interval = setInterval(() => {
      const snake = [...snakeRef.current];
      const curDir = nextDirectionRef.current;
      directionRef.current = curDir;

      const head = { ...snake[0] };
      if (curDir === 'UP') head.y -= 1;
      else if (curDir === 'DOWN') head.y += 1;
      else if (curDir === 'LEFT') head.x -= 1;
      else if (curDir === 'RIGHT') head.x += 1;

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameState('game_over');
        return;
      }

      // Check self collision
      if (snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
        setGameState('game_over');
        return;
      }

      snake.unshift(head);

      // Check apple eaten
      if (head.x === appleRef.current.x && head.y === appleRef.current.y) {
        setScore((prev) => {
          const next = prev + 10;
          if (next > highScore) {
            setHighScore(next);
            localStorage.setItem(STORAGE_KEY_HIGH_SCORE, String(next));
          }
          return next;
        });
        spawnApple(snake);
      } else {
        snake.pop();
      }

      snakeRef.current = snake;
    }, INITIAL_SPEED);

    gameLoopRef.current = interval as unknown as number;

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState, highScore, spawnApple]);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cellSize = width / GRID_SIZE;

      // Background
      ctx.fillStyle = isDark ? '#070b14' : '#f1f5f9';
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.05)' : 'rgba(100, 116, 139, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(width, i * cellSize);
        ctx.stroke();
      }

      // Draw Apple 🍎 (glowing pulse)
      const apple = appleRef.current;
      const appleCenterX = apple.x * cellSize + cellSize / 2;
      const appleCenterY = apple.y * cellSize + cellSize / 2;
      const appleRadius = cellSize * 0.4;

      ctx.save();
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = isDark ? 16 : 8;

      ctx.beginPath();
      ctx.arc(appleCenterX, appleCenterY, appleRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#f43f5e';
      ctx.fill();

      // Apple leaf / stem
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#10b981';
      ctx.fillRect(appleCenterX - 1, appleCenterY - appleRadius - 2, 2.5, 4);
      ctx.restore();

      // Draw Snake
      const snake = snakeRef.current;
      snake.forEach((seg, idx) => {
        const isHead = idx === 0;
        const x = seg.x * cellSize + 1.5;
        const y = seg.y * cellSize + 1.5;
        const size = cellSize - 3;
        const radius = isHead ? 6 : 4;

        ctx.save();
        if (isHead) {
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = isDark ? 14 : 6;
          ctx.fillStyle = '#22d3ee';
        } else {
          // Gradient from cyan to purple down the body
          const progress = idx / Math.max(1, snake.length);
          ctx.fillStyle = progress < 0.5 ? '#06b6d4' : '#8b5cf6';
        }

        // Draw rounded rectangle
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, radius);
        ctx.fill();

        // Draw eyes on head
        if (isHead) {
          ctx.fillStyle = '#020617';
          const dir = directionRef.current;
          let eye1 = { x: x + 4, y: y + 4 };
          let eye2 = { x: x + size - 6, y: y + 4 };

          if (dir === 'DOWN') {
            eye1 = { x: x + 4, y: y + size - 6 };
            eye2 = { x: x + size - 6, y: y + size - 6 };
          } else if (dir === 'LEFT') {
            eye1 = { x: x + 4, y: y + 4 };
            eye2 = { x: x + 4, y: y + size - 6 };
          } else if (dir === 'RIGHT') {
            eye1 = { x: x + size - 6, y: y + 4 };
            eye2 = { x: x + size - 6, y: y + size - 6 };
          }

          ctx.beginPath();
          ctx.arc(eye1.x, eye1.y, 1.8, 0, Math.PI * 2);
          ctx.arc(eye2.x, eye2.y, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isDark]);

  return (
    <section
      id="break-game"
      className={`rounded-3xl transition-all duration-300 p-4 sm:p-8 border relative overflow-hidden max-w-full ${
        isDark
          ? 'glass-panel-dark border-cyan-500/25 shadow-[0_0_40px_rgba(6,182,212,0.1)]'
          : 'glass-panel-light border-slate-300 shadow-lg'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cyan-500/15">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              isDark
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            }`}
          >
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2
                className={`text-xl sm:text-2xl font-bold font-cyber tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                منطقة الاستراحة · لعبة الثعبان والتفاحة
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-mono-num bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                BREAK ARCADE
              </span>
            </div>
            <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              العب جولة سريعة لتنشيط ذهنك والاستمتاع خلال فترات الراحة بين جلسات المذاكرة
            </p>
          </div>
        </div>

        {/* Score & High Score */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div
            className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-2 ${
              isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-white border-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <div className="text-right">
              <span className="block text-[10px] text-slate-400">النقاط</span>
              <span className="font-mono-num font-bold text-base text-cyan-400">
                {score}
              </span>
            </div>
          </div>

          <div
            className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-2 ${
              isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-white border-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <div className="text-right">
              <span className="block text-[10px] text-slate-400">أعلى نتيجة</span>
              <span className="font-mono-num font-bold text-base text-amber-400">
                {highScore}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Arena */}
      <div className="mt-6 flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-full overflow-hidden">
        {/* Canvas Display with Overlays */}
        <div className="relative w-full max-w-[340px] sm:max-w-[360px] mx-auto overflow-hidden">
          <div
            className={`p-2 rounded-2xl border transition-all ${
              isDark
                ? 'bg-slate-950/80 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]'
                : 'bg-slate-200/80 border-slate-300 shadow-md'
            }`}
          >
            <canvas
              ref={canvasRef}
              width={360}
              height={360}
              className="rounded-xl block w-full h-auto max-w-full aspect-square touch-none"
            />
          </div>

          {/* Overlay when Idle, Paused, or Game Over */}
          {gameState !== 'playing' && (
            <div className="absolute inset-0 rounded-2xl bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              {gameState === 'idle' && (
                <>
                  <Coffee className="w-12 h-12 text-cyan-400 mb-3 animate-bounce" />
                  <h3 className="font-bold text-lg text-white font-cyber">جاهز للاستراحة؟</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xs">
                    استخدم الأسهم لتحريك الثعبان وأكل التفاح
                  </p>
                  <button
                    type="button"
                    onClick={startGame}
                    className="mt-4 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>ابدأ اللعب الآن</span>
                  </button>
                </>
              )}

              {gameState === 'paused' && (
                <>
                  <Pause className="w-12 h-12 text-amber-400 mb-3" />
                  <h3 className="font-bold text-lg text-white font-cyber">اللعبة متوقفة مؤقتًا</h3>
                  <button
                    type="button"
                    onClick={togglePause}
                    className="mt-4 px-6 py-2.5 rounded-xl font-bold text-sm bg-amber-500 text-slate-950 shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>استئناف اللعب</span>
                  </button>
                </>
              )}

              {gameState === 'game_over' && (
                <>
                  <span className="text-4xl mb-2">💥</span>
                  <h3 className="font-bold text-xl text-rose-400 font-cyber">انتهت اللعبة!</h3>
                  <p className="text-sm font-mono-num text-slate-200 mt-1">
                    نتيجتك: <strong className="text-cyan-400">{score}</strong> نقطة
                  </p>
                  <button
                    type="button"
                    onClick={startGame}
                    className="mt-4 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>العب مجددًا</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Controls Column (Buttons & Touch D-Pad for Mobile) */}
        <div className="flex flex-col items-center gap-5 w-full sm:w-auto">
          {/* Action buttons (Play, Pause, Restart) */}
          <div className="flex items-center gap-3 w-full justify-center">
            {gameState === 'playing' ? (
              <button
                type="button"
                onClick={togglePause}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Pause className="w-4 h-4" />
                <span>إيقاف مؤقت (P)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={gameState === 'paused' ? togglePause : startGame}
                className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${
                  isDark
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 hover:bg-cyan-500/30'
                    : 'bg-cyan-100 border-cyan-400 text-cyan-800 hover:bg-cyan-200'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{gameState === 'paused' ? 'متابعة' : 'بدء اللعب'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={startGame}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                isDark
                  ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-100'
              }`}
              title="إعادة بدء اللعبة"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Touch D-Pad for Mobile & Tablet - Forced dir="ltr" so Left is on Left and Right is on Right in RTL documents */}
          <div dir="ltr" className="flex flex-col items-center gap-2 pt-2">
            <span dir="rtl" className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              أزرار التحكم (الأسهم):
            </span>

            {/* UP */}
            <button
              type="button"
              aria-label="Move Up (أعلى)"
              title="أعلى (Up)"
              onClick={() => changeDirection('UP')}
              className={`w-14 h-12 rounded-xl border flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                isDark
                  ? 'bg-slate-900/90 border-slate-700 text-cyan-400 hover:border-cyan-400 hover:bg-slate-800 shadow-sm'
                  : 'bg-white border-slate-300 text-cyan-700 hover:bg-slate-100 shadow-xs'
              }`}
            >
              <ArrowUp className="w-6 h-6 stroke-[2.5]" />
            </button>

            {/* LEFT / DOWN / RIGHT in strict LTR order */}
            <div dir="ltr" className="flex items-center gap-2">
              {/* LEFT */}
              <button
                type="button"
                aria-label="Move Left (يسار)"
                title="يسار (Left)"
                onClick={() => changeDirection('LEFT')}
                className={`w-14 h-12 rounded-xl border flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-700 text-cyan-400 hover:border-cyan-400 hover:bg-slate-800 shadow-sm'
                    : 'bg-white border-slate-300 text-cyan-700 hover:bg-slate-100 shadow-xs'
                }`}
              >
                <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
              </button>

              {/* DOWN */}
              <button
                type="button"
                aria-label="Move Down (أسفل)"
                title="أسفل (Down)"
                onClick={() => changeDirection('DOWN')}
                className={`w-14 h-12 rounded-xl border flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-700 text-cyan-400 hover:border-cyan-400 hover:bg-slate-800 shadow-sm'
                    : 'bg-white border-slate-300 text-cyan-700 hover:bg-slate-100 shadow-xs'
                }`}
              >
                <ArrowDown className="w-6 h-6 stroke-[2.5]" />
              </button>

              {/* RIGHT */}
              <button
                type="button"
                aria-label="Move Right (يمين)"
                title="يمين (Right)"
                onClick={() => changeDirection('RIGHT')}
                className={`w-14 h-12 rounded-xl border flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-700 text-cyan-400 hover:border-cyan-400 hover:bg-slate-800 shadow-sm'
                    : 'bg-white border-slate-300 text-cyan-700 hover:bg-slate-100 shadow-xs'
                }`}
              >
                <ArrowRight className="w-6 h-6 stroke-[2.5]" />
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
            💡 اضغط مفاتيح <strong>W A S D</strong> أو <strong>الأسهم</strong> أو أزرار اللمس. اضغط <strong>المسافة (Space)</strong> للإيقاف المؤقت.
          </div>
        </div>
      </div>
    </section>
  );
};
