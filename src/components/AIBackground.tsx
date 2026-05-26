import { useEffect, useRef, useState } from 'react';

export default function AIBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Track page-level coordinates for smooth mouse interaction with visual wave centers
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, init: false });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      mouseRef.current.init = true;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Handle ResizeObserver to maintain full screen width and height
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Simplified and Elegant Fluid Signal Waves Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Razor-sharp Canvas resolution scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    // Dynamic wave settings
    interface Wave {
      radius: number;
      maxRadius: number;
      speed: number;
      opacity: number;
      color: string;
      pulseStyle: 'dashed' | 'solid';
      width: number;
    }

    let wavesList: Wave[] = [];
    let lastWaveSpawn = 0;

    const centerX = dimensions.width * 0.5;
    const centerY = dimensions.height * 0.48;
    const maxGlobalRadius = Math.max(dimensions.width, dimensions.height) * 0.8;

    let animId: number;

    const render = () => {
      // Light-themed elegant flat canvas clearing
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Smooth custom cursor tracking
      const m = mouseRef.current;
      if (m.init) {
        m.x += (m.targetX - m.x) * 0.08;
        m.y += (m.targetY - m.y) * 0.08;
      } else {
        m.x = dimensions.width / 2;
        m.y = dimensions.height / 2;
      }

      // Parallax offset for the waves' center point
      const pushX = (m.x - dimensions.width / 2) * 0.05;
      const pushY = (m.y - dimensions.height / 2) * 0.05;
      const activeCenterX = centerX + pushX;
      const activeCenterY = centerY + pushY;

      // Spawn new wave automatically at clean intervals
      const now = Date.now();
      if (now - lastWaveSpawn > 2200) {
        // Emit primary Cyan wave
        wavesList.push({
          radius: 10,
          maxRadius: maxGlobalRadius,
          speed: 0.95,
          opacity: 0.45,
          color: 'rgba(6, 182, 212, ', // Cyan prefix
          pulseStyle: 'dashed',
          width: 1.2
        });
        
        // Emit secondary Indigo wave
        wavesList.push({
          radius: 40,
          maxRadius: maxGlobalRadius * 0.85,
          speed: 1.15,
          opacity: 0.35,
          color: 'rgba(99, 102, 241, ', // Indigo prefix
          pulseStyle: 'solid',
          width: 0.8
        });

        lastWaveSpawn = now;
      }

      // Render concentric waves
      wavesList = wavesList.filter((wave) => {
        wave.radius += wave.speed;
        
        // Dynamic fading ratio as it approaches outer bounds
        const progress = wave.radius / wave.maxRadius;
        wave.opacity = Math.max(0, (1 - progress) * 0.35);

        if (wave.radius < wave.maxRadius && wave.opacity > 0.005) {
          ctx.save();
          
          // Draw wave path
          ctx.strokeStyle = wave.color + `${wave.opacity})`;
          ctx.lineWidth = wave.width;

          if (wave.pulseStyle === 'dashed') {
            ctx.setLineDash([8, 16]);
          } else {
            ctx.setLineDash([]);
          }

          ctx.beginPath();
          ctx.arc(activeCenterX, activeCenterY, wave.radius, 0, Math.PI * 2);
          ctx.stroke();

          // Render micro orbital satellite accents on waves to look incredibly elegant & high tech
          ctx.fillStyle = wave.color + `${wave.opacity * 1.5})`;
          ctx.setLineDash([]);
          const rotationAngle = (now / 4000) * (wave.pulseStyle === 'dashed' ? 0.35 : -0.22);
          
          const accentCount = wave.pulseStyle === 'dashed' ? 3 : 2;
          for (let i = 0; i < accentCount; i++) {
            const angle = rotationAngle + (i * Math.PI * 2) / accentCount;
            const ax = activeCenterX + Math.cos(angle) * wave.radius;
            const ay = activeCenterY + Math.sin(angle) * wave.radius;
            
            ctx.beginPath();
            ctx.arc(ax, ay, 2, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
          return true;
        }
        return false;
      });

      // Centered decorative focal ring
      ctx.save();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(activeCenterX, activeCenterY, 32, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(6, 182, 212, 0.04)';
      ctx.beginPath();
      ctx.arc(activeCenterX, activeCenterY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [dimensions]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none select-none"
      id="ai-signals-background-container"
    >
      {/* 2D elegant signal wave perspective canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full opacity-100 pointer-events-none"
        id="ai-3d-constellation-canvas"
        style={{ width: '100%', height: '100%', display: 'block' }}
      />

      {/* Atmospheric modern visual gradients to guarantee beautiful high-end style */}
      <div className="absolute top-[12%] left-[10%] w-[500px] h-[500px] rounded-full bg-cyan-300/[0.12] blur-[150px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[20%] right-[10%] w-[550px] h-[550px] rounded-full bg-indigo-300/[0.10] blur-[160px] pointer-events-none animate-pulse duration-[10000ms]" />
    </div>
  );
}
