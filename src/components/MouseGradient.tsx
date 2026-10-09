import React, { useEffect, useRef } from 'react';

/**
 * MouseGradient
 * Renders a circular radial gradient around the mouse cursor made from
 * small black points arranged in a clean grid pattern (spatial dot matrix).
 *
 * Positioned strictly at z-0 with pointer-events-none so it remains
 * completely behind all UI boxes, cards, and 3D splat previews.
 */
export const MouseGradient: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetRef = useRef<{ x: number; y: number }>({ x: -2000, y: -2000 });
  const currentRef = useRef<{ x: number; y: number }>({ x: -2000, y: -2000 });
  const opacityRef = useRef<number>(0);
  const targetOpacityRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const isRunningRef = useRef<boolean>(false);

  useEffect(() => {
    // Disable on coarse-only touch screens
    const isTouchOnly =
      window.matchMedia('(pointer: coarse)').matches &&
      !window.matchMedia('(pointer: fine)').matches;
    if (isTouchOnly) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPI screen scaling
    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Animation constants
    const GRID_SPACING = 16; // Grid step in pixels
    const RADIUS = 320; // Circular radius of the point gradient field
    const RADIUS_SQ = RADIUS * RADIUS;

    const render = () => {
      // Smooth coordinate interpolation (lerp factor 0.35)
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.35;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.35;

      // Smooth opacity fade
      opacityRef.current += (targetOpacityRef.current - opacityRef.current) * 0.15;

      const currentX = currentRef.current.x;
      const currentY = currentRef.current.y;
      const opacity = opacityRef.current;

      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      if (opacity > 0.005) {
        // Calculate the grid bounds around the cursor
        const minCol = Math.max(0, Math.floor((currentX - RADIUS) / GRID_SPACING));
        const maxCol = Math.min(Math.ceil(width / GRID_SPACING), Math.ceil((currentX + RADIUS) / GRID_SPACING));
        const minRow = Math.max(0, Math.floor((currentY - RADIUS) / GRID_SPACING));
        const maxRow = Math.min(Math.ceil(height / GRID_SPACING), Math.ceil((currentY + RADIUS) / GRID_SPACING));

        for (let col = minCol; col <= maxCol; col++) {
          const gx = col * GRID_SPACING;
          const dx = gx - currentX;

          for (let row = minRow; row <= maxRow; row++) {
            const gy = row * GRID_SPACING;
            const dy = gy - currentY;
            const distSq = dx * dx + dy * dy;

            if (distSq > RADIUS_SQ) continue;

            const dist = Math.sqrt(distSq);
            // Non-linear falloff for a natural radial gradient (further reduced opacity)
            const falloff = 1 - dist / RADIUS;
            const alpha = Math.pow(falloff, 1.35) * 0.212 * opacity;
            const dotRadius = 0.75 + falloff * 1.5; // From ~0.75px at periphery to ~2.25px at core

            ctx.beginPath();
            ctx.arc(gx, gy, dotRadius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha.toFixed(3)})`;
            ctx.fill();
          }
        }
      }

      // Keep running if moving or fading
      const isStillMoving =
        Math.abs(targetRef.current.x - currentRef.current.x) > 0.1 ||
        Math.abs(targetRef.current.y - currentRef.current.y) > 0.1 ||
        Math.abs(targetOpacityRef.current - opacityRef.current) > 0.005;

      if (isStillMoving || opacityRef.current > 0.01) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        isRunningRef.current = false;
      }
    };

    const startLoop = () => {
      if (!isRunningRef.current) {
        isRunningRef.current = true;
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      targetOpacityRef.current = 1;
      startLoop();
    };

    const handleMouseLeave = () => {
      targetOpacityRef.current = 0;
      startLoop();
    };

    const handleMouseEnter = () => {
      targetOpacityRef.current = 1;
      startLoop();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 select-none overflow-hidden block"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};
