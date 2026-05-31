import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Award, Gamepad } from 'lucide-react';

const GRID_SIZE = 20;
const TILE_COUNT = 20;

const Snake: React.FC = () => {
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 5, y: 5 });
  const [dir, setDir] = useState<{ x: number; y: number }>({ x: 0, y: -1 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speedRef = useRef(120);

  // Load High Score from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('snake_highscore');
    if (saved) setHighScore(Number(saved));
  }, []);

  // Audio effects synthesizer using Web Audio API
  const playSound = (type: 'eat' | 'gameover' | 'start') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'eat') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'start') {
        osc.frequency.setValueAtTime(329.63, ctx.currentTime); // E4
        osc.frequency.setValueAtTime(392.00, ctx.currentTime + 0.1); // G4
        osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.2); // C5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      console.warn('Web Audio API not supported or blocked.', e);
    }
  };

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;
      
      // Prevent scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        setIsPaused(p => !p);
        return;
      }

      if (isPaused) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (dir.y === 0) setDir({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (dir.y === 0) setDir({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (dir.x === 0) setDir({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (dir.x === 0) setDir({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dir, isPaused, isGameOver]);

  // Main Game Loop
  useEffect(() => {
    if (isPaused || isGameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        head.x += dir.x;
        head.y += dir.y;

        // Wall collision
        if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
          handleGameOver();
          return prevSnake;
        }

        // Self collision
        for (let cell of prevSnake) {
          if (cell.x === head.x && cell.y === head.y) {
            handleGameOver();
            return prevSnake;
          }
        }

        const newSnake = [head, ...prevSnake];

        // Food collision
        if (head.x === food.x && head.y === food.y) {
          setScore(s => {
            const nextScore = s + 10;
            if (nextScore > highScore) {
              setHighScore(nextScore);
              localStorage.setItem('snake_highscore', String(nextScore));
            }
            return nextScore;
          });
          playSound('eat');
          generateFood(newSnake);
          // Increase speed slowly
          speedRef.current = Math.max(70, 120 - Math.floor(newSnake.length / 3) * 5);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const intervalId = setInterval(moveSnake, speedRef.current);
    return () => clearInterval(intervalId);
  }, [dir, food, isPaused, isGameOver, highScore]);

  // Generate food position
  const generateFood = (currentSnake: { x: number; y: number }[]) => {
    let newFood;
    let onSnake = true;
    while (onSnake) {
      newFood = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT),
      };
      onSnake = currentSnake.some(cell => cell.x === newFood!.x && cell.y === newFood!.y);
    }
    setFood(newFood!);
  };

  const handleGameOver = () => {
    setIsGameOver(true);
    playSound('gameover');
  };

  const startGame = () => {
    playSound('start');
    setSnake([
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ]);
    setDir({ x: 0, y: -1 });
    setScore(0);
    speedRef.current = 120;
    generateFood([{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]);
    setIsGameOver(false);
    setIsPaused(false);
  };

  // Canvas Drawing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fetch theme accent colors dynamically from CSS variables
    const style = getComputedStyle(document.documentElement);
    const accentColor = style.getPropertyValue('--accent').trim() || '#22c55e';
    const accentColor2 = style.getPropertyValue('--accent-2').trim() || '#a855f7';
    const baseColor = style.getPropertyValue('--base').trim() || '#0f172a';

    // Clear board
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid Lines (Subtle retro feel)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= TILE_COUNT; i++) {
      ctx.beginPath();
      ctx.moveTo(i * GRID_SIZE, 0);
      ctx.lineTo(i * GRID_SIZE, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * GRID_SIZE);
      ctx.lineTo(canvas.width, i * GRID_SIZE);
      ctx.stroke();
    }

    // Draw Food (glowing cherry dot)
    ctx.shadowBlur = 10;
    ctx.shadowColor = accentColor2;
    ctx.fillStyle = accentColor2;
    ctx.beginPath();
    ctx.arc(
      food.x * GRID_SIZE + GRID_SIZE / 2,
      food.y * GRID_SIZE + GRID_SIZE / 2,
      GRID_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw Snake (neon segmented train)
    ctx.shadowBlur = 8;
    ctx.shadowColor = accentColor;
    
    snake.forEach((cell, idx) => {
      // Direct gradient style
      ctx.fillStyle = idx === 0 ? accentColor : `${accentColor}cc`;
      ctx.fillRect(
        cell.x * GRID_SIZE + 1,
        cell.y * GRID_SIZE + 1,
        GRID_SIZE - 2,
        GRID_SIZE - 2
      );

      // Cute snake eyes on head
      if (idx === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 0;
        let eyeX1 = cell.x * GRID_SIZE + 5;
        let eyeY1 = cell.y * GRID_SIZE + 5;
        let eyeX2 = cell.x * GRID_SIZE + 13;
        let eyeY2 = cell.y * GRID_SIZE + 5;

        if (dir.x !== 0) {
          eyeX1 = cell.x * GRID_SIZE + 9;
          eyeY1 = cell.y * GRID_SIZE + 5;
          eyeX2 = cell.x * GRID_SIZE + 9;
          eyeY2 = cell.y * GRID_SIZE + 13;
        }

        ctx.fillRect(eyeX1, eyeY1, 2, 2);
        ctx.fillRect(eyeX2, eyeY2, 2, 2);
      }
    });

    // Reset shadow values for next draw
    ctx.shadowBlur = 0;

  }, [snake, food, dir]);

  return (
    <div className="snake-game-container">
      {/* Game Stats Header */}
      <div className="snake-stats-header">
        <div className="stat-pill">
          <Gamepad size={14} className="stat-icon" />
          <span>Score: <strong>{score}</strong></span>
        </div>
        <div className="stat-pill">
          <Award size={14} className="stat-icon" style={{ color: 'var(--accent-2)' }} />
          <span>Best: <strong>{highScore}</strong></span>
        </div>
        <button 
          className="sound-toggle-btn"
          onClick={() => setSoundEnabled(s => !s)}
          title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      {/* Screen / Canvas Area */}
      <div className="snake-canvas-wrapper" style={{ position: 'relative' }}>
        <canvas 
          ref={canvasRef} 
          width={GRID_SIZE * TILE_COUNT} 
          height={GRID_SIZE * TILE_COUNT}
          className="snake-canvas"
        />

        {/* Start / Pause Screen Overlay */}
        {isPaused && !isGameOver && (
          <div className="snake-screen-overlay">
            <div className="overlay-box glass">
              <h3>Snake Arcade</h3>
              <p>Press ARROWS or WASD to control the snake</p>
              <p>Press SPACE to pause/resume</p>
              <button className="snake-btn" onClick={() => setIsPaused(false)}>
                <Play size={16} />
                <span>Play Game</span>
              </button>
            </div>
          </div>
        )}

        {/* Game Over Screen Overlay */}
        {isGameOver && (
          <div className="snake-screen-overlay">
            <div className="overlay-box glass game-over">
              <h2>GAME OVER</h2>
              <p>You crashed into a boundary or yourself!</p>
              <div className="final-score">Score: {score}</div>
              <button className="snake-btn retry" onClick={startGame}>
                <RotateCcw size={16} />
                <span>Play Again</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="snake-instructions">
        <span>Use Arrow keys / WASD to turn · SPACE to Pause</span>
      </div>
    </div>
  );
};

export default Snake;
