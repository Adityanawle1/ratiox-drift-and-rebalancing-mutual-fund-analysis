import { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
  z: number;
  originalX: number;
  originalY: number;
  originalZ: number;
  isData?: boolean;
  pulse?: number;
  id: string;
}

interface Arc {
  p1: Point;
  p2: Point;
  opacity: number;
}

interface Packet {
  arc: Arc;
  progress: number;
  speed: number;
}

/**
 * AuthGlobe — A centered, larger, calmer variant of the Globe
 * specifically designed for auth page backgrounds.
 * Key differences from landing Globe:
 *   - Always centered (no right-offset)
 *   - Larger radius (0.38 vs 0.32)
 *   - Slower rotation for a calmer, premium feel
 *   - Stronger atmospheric aura
 *   - No starfield (cleaner background for form readability)
 */
const AuthGlobe = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const mouseRef = useRef({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Larger radius for auth pages
    const getRadius = () => {
      const rect = canvas.getBoundingClientRect();
      return Math.min(rect.width, rect.height) * 0.38;
    };

    // Generate globe points (Fibonacci Sphere)
    const points: Point[] = [];
    const radius = getRadius();
    // If canvas isn't laid out yet, radius is 0 — bail and retry
    if (radius < 1) {
      const retryTimer = setTimeout(() => {
        // Force re-run of effect by cleaning up and re-mounting
        updateSize();
      }, 100);
      return () => {
        clearTimeout(retryTimer);
        window.removeEventListener('resize', updateSize);
      };
    }
    const numPoints = 1200;
    const numDataPoints = 50;

    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numPoints);
      const theta = Math.sqrt(numPoints * Math.PI) * phi;
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);
      points.push({ x, y, z, originalX: x, originalY: y, originalZ: z, id: `p-${i}` });
    }

    const dataPoints: Point[] = [];
    for (let i = 0; i < numDataPoints; i++) {
      const phi = Math.acos(-1 + (2 * Math.random()));
      const theta = Math.random() * Math.PI * 2;
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);
      const dp = {
        x, y, z,
        originalX: x, originalY: y, originalZ: z,
        isData: true,
        pulse: Math.random() * Math.PI * 2,
        id: `d-${i}`
      };
      points.push(dp);
      dataPoints.push(dp);
    }

    // Arcs & Packets
    const arcs: Arc[] = [];
    const packets: Packet[] = [];
    for (let i = 0; i < 25; i++) {
      const p1 = dataPoints[Math.floor(Math.random() * dataPoints.length)];
      let p2 = dataPoints[Math.floor(Math.random() * dataPoints.length)];
      while (p1 === p2) p2 = dataPoints[Math.floor(Math.random() * dataPoints.length)];

      const arc = { p1, p2, opacity: 0.1 + Math.random() * 0.2 };
      arcs.push(arc);

      packets.push({
        arc,
        progress: Math.random(),
        speed: 0.001 + Math.random() * 0.004 // Slower, more elegant
      });
    }

    let rotation = 0;
    let rotationVelocity = 0.001; // Slower base rotation
    const axisTilt = { x: 0.1, y: -0.15 };

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      // Skip if canvas has zero dimensions (not yet laid out)
      if (rect.width < 1 || rect.height < 1) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      // ALWAYS CENTERED — the key difference from the landing Globe
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      ctx.clearRect(0, 0, rect.width, rect.height);

      const time = Date.now() * 0.001;
      const breathing = radius * (1 + Math.sin(time * 0.4) * 0.012);

      // --- NEBULA GLOW (stronger for auth ambiance) ---
      const nebula = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 3);
      nebula.addColorStop(0, 'rgba(232, 137, 12, 0.10)');
      nebula.addColorStop(0.3, 'rgba(232, 137, 12, 0.04)');
      nebula.addColorStop(0.6, 'rgba(15, 30, 50, 0.03)');
      nebula.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // --- ATMOSPHERIC AURA (bigger, softer) ---
      const aura = ctx.createRadialGradient(centerX, centerY, breathing * 0.8, centerX, centerY, breathing * 1.8);
      aura.addColorStop(0, 'rgba(232, 137, 12, 0.14)');
      aura.addColorStop(0.5, 'rgba(232, 137, 12, 0.04)');
      aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.beginPath();
      ctx.arc(centerX, centerY, breathing * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = aura;
      ctx.fill();

      // --- ORBITAL RINGS ---
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 2; i++) {
        const ringRadius = radius * (1.15 + i * 0.3) * (breathing / radius);

        ctx.beginPath();
        ctx.ellipse(
          centerX,
          centerY,
          ringRadius,
          ringRadius * 0.25,
          rotation * (0.08 + i * 0.04),
          0,
          Math.PI * 2
        );

        const ringGradient = ctx.createLinearGradient(
          centerX - ringRadius, centerY,
          centerX + ringRadius, centerY
        );
        ringGradient.addColorStop(0, `rgba(232, 147, 16, 0)`);
        ringGradient.addColorStop(0.5, `rgba(232, 147, 16, ${0.12 - i * 0.04})`);
        ringGradient.addColorStop(1, `rgba(232, 147, 16, 0)`);

        ctx.strokeStyle = ringGradient;
        ctx.stroke();
      }

      // --- PHYSICS UPDATE ---
      rotation += rotationVelocity;
      rotationVelocity *= 0.995;
      if (rotationVelocity < 0.001) rotationVelocity = 0.001;

      const targetTiltY = (mouseRef.current.y - centerY) * 0.0003;
      const targetTiltX = (mouseRef.current.x - centerX) * 0.0003;
      axisTilt.y += (targetTiltY - axisTilt.y) * 0.03;
      axisTilt.x += (targetTiltX - axisTilt.x) * 0.03;

      // Project points
      const perspective = 850;
      const projected = points.map(p => {
        const rotated = rotatePoint(p, rotation, axisTilt);
        const scale = perspective / (perspective + rotated.z);
        return {
          ...p,
          projX: centerX + (rotated.x * (breathing / radius)) * scale,
          projY: centerY + (rotated.y * (breathing / radius)) * scale,
          projZ: rotated.z,
          scale,
          rotatedX: rotated.x,
          rotatedY: rotated.y
        };
      }).sort((a, b) => a.projZ - b.projZ);

      // --- NETWORK ARCS & PACKETS ---
      arcs.forEach(arc => {
        const p1 = projected.find(p => p.id === arc.p1.id);
        const p2 = projected.find(p => p.id === arc.p2.id);
        if (!p1 || !p2) return;
        if (p1.projZ < -100 && p2.projZ < -100) return;

        const dist = Math.sqrt(Math.pow(p1.projX - p2.projX, 2) + Math.pow(p1.projY - p2.projY, 2));
        if (dist < 0.1) return; // Skip degenerate arcs
        const lift = dist * 0.35;
        const midX = (p1.projX + p2.projX) / 2;
        const midY = (p1.projY + p2.projY) / 2;
        const mag = Math.sqrt(Math.pow(midX - centerX, 2) + Math.pow(midY - centerY, 2));
        if (mag < 0.1) return; // Avoid division by zero
        const cpX = midX + ((midX - centerX) / mag) * lift;
        const cpY = midY + ((midY - centerY) / mag) * lift;

        const opacity = Math.min(1, Math.max(0, (Math.min(p1.projZ, p2.projZ) + radius) / (radius * 1.5)));

        ctx.beginPath();
        ctx.moveTo(p1.projX, p1.projY);
        ctx.quadraticCurveTo(cpX, cpY, p2.projX, p2.projY);
        ctx.strokeStyle = `rgba(232, 147, 16, ${arc.opacity * opacity * 0.35})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        const packet = packets.find(pk => pk.arc === arc);
        if (packet) {
          packet.progress += packet.speed;
          if (packet.progress > 1) {
            packet.progress = 0;
            packet.speed = 0.001 + Math.random() * 0.004;
          }

          const t = packet.progress;
          const pkX = Math.pow(1 - t, 2) * p1.projX + 2 * (1 - t) * t * cpX + Math.pow(t, 2) * p2.projX;
          const pkY = Math.pow(1 - t, 2) * p1.projY + 2 * (1 - t) * t * cpY + Math.pow(t, 2) * p2.projY;

          const trailT = Math.max(0, t - 0.06);
          const trX = Math.pow(1 - trailT, 2) * p1.projX + 2 * (1 - trailT) * trailT * cpX + Math.pow(trailT, 2) * p2.projX;
          const trY = Math.pow(1 - trailT, 2) * p1.projY + 2 * (1 - trailT) * trailT * cpY + Math.pow(trailT, 2) * p2.projY;

          // Guard against identical points (createLinearGradient crashes on NaN/identical coords)
          const gdx = pkX - trX;
          const gdy = pkY - trY;
          if (Math.abs(gdx) < 0.01 && Math.abs(gdy) < 0.01) return;

          const gradient = ctx.createLinearGradient(trX, trY, pkX, pkY);
          gradient.addColorStop(0, `rgba(232, 147, 16, 0)`);
          gradient.addColorStop(1, `rgba(255, 220, 100, ${opacity * 0.8})`);

          ctx.beginPath();
          ctx.moveTo(trX, trY);
          ctx.lineTo(pkX, pkY);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 3 * p1.scale;
          ctx.lineCap = 'round';
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(pkX, pkY, 2 * p1.scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.9})`;
          ctx.shadowBlur = 12;
          ctx.shadowColor = 'rgba(232, 147, 16, 0.8)';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // --- POINTS ---
      projected.forEach(p => {
        const opacity = Math.max(0, Math.min(1, (p.projZ + radius * 0.8) / (radius * 1.6)));
        if (opacity <= 0) return;

        const distFromCenter = Math.sqrt(p.rotatedX * p.rotatedX + p.rotatedY * p.rotatedY);
        const centerHighlight = Math.max(0, 1 - distFromCenter / (radius * 0.5));

        if (p.isData) {
          const pulse = Math.sin(time * 1.5 + (p.pulse || 0)) * 0.5 + 0.5;
          const size = (2 + pulse * 1.2) * p.scale;

          ctx.beginPath();
          ctx.arc(p.projX, p.projY, size * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(232, 147, 16, ${opacity * 0.35 * pulse})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.projX, p.projY, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * (0.7 + pulse * 0.3)})`;
          ctx.fill();
        } else {
          const tPhase = Math.sin(time + (points.indexOf(p) * 0.1));
          const baseOpacity = opacity * 0.3;
          const highlightOpacity = opacity * centerHighlight * 0.35;
          const finalOpacity = baseOpacity + highlightOpacity + (tPhase * 0.08 * opacity);

          const size = (0.9 + centerHighlight * 0.4) * p.scale;

          ctx.beginPath();
          ctx.arc(p.projX, p.projY, size, 0, Math.PI * 2);

          if (p.projZ > 0) {
            ctx.fillStyle = `rgba(232, 160, 50, ${finalOpacity * 1.1})`;
          } else {
            ctx.fillStyle = `rgba(180, 210, 255, ${finalOpacity * 0.9})`;
          }
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    const rotatePoint = (point: Point, rotation: number, tilt: { x: number; y: number }) => {
      let { x, y, z } = point;

      const cosY = Math.cos(rotation);
      const sinY = Math.sin(rotation);
      const nx = x * cosY - z * sinY;
      const nz = x * sinY + z * cosY;
      x = nx;
      z = nz;

      const cosP = Math.cos(tilt.y);
      const sinP = Math.sin(tilt.y);
      const ny = y * cosP - z * sinP;
      const nz2 = y * sinP + z * cosP;
      y = ny;
      z = nz2;

      const cosW = Math.cos(tilt.x);
      const sinW = Math.sin(tilt.x);
      const nx2 = x * cosW - y * sinW;
      const ny2 = x * sinW + y * cosW;
      x = nx2;
      y = ny2;

      return { x, y, z };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      rotationVelocity += (mouseRef.current.x - rect.width / 2) * 0.0000015;
    };

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className={`absolute inset-0 transition-all duration-[2500ms] ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ filter: 'contrast(1.05) brightness(1.05)' }}
      />
    </div>
  );
};

export default AuthGlobe;
