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
  id: string; // Add ID for connection tracking
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

const Globe = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ 
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, 
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use default alpha: true so the canvas background is completely transparent
    const ctx = canvas.getContext('2d'); 
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Dynamic Sizing
    const getRadius = () => {
      const rect = canvas.getBoundingClientRect();
      return Math.min(rect.width, rect.height) * 0.32; // Smaller, sleek and minimal
    };

    // Generate globe points (Fibonacci Sphere for perfect distribution)
    const points: Point[] = [];
    const radius = getRadius();
    const numPoints = 1500; // Increased density for a finer mesh feel
    const numDataPoints = 60; 

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

    // Add Parallax Starfield (Layer 0 Background)
    const starfield: {x: number, y: number, z: number, s: number, color: string}[] = [];
    const starColors = ['#ffffff', '#e8890c', '#1e3c64'];
    for(let i=0; i<300; i++){
      starfield.push({
        x: (Math.random() - 0.5) * 1600, // Widened field
        y: (Math.random() - 0.5) * 1600,
        z: (Math.random() - 0.5) * 1000,
        s: Math.random() * 1.2,
        color: starColors[Math.floor(Math.random() * starColors.length)]
      });
    }

    // Arcs & Packets (More cinematic)
    const arcs: Arc[] = [];
    const packets: Packet[] = [];
    for (let i = 0; i < 35; i++) {
      const p1 = dataPoints[Math.floor(Math.random() * dataPoints.length)];
      let p2 = dataPoints[Math.floor(Math.random() * dataPoints.length)];
      while (p1 === p2) p2 = dataPoints[Math.floor(Math.random() * dataPoints.length)];
      
      const arc = { p1, p2, opacity: 0.15 + Math.random() * 0.3 };
      arcs.push(arc);
      
      packets.push({
        arc,
        progress: Math.random(),
        speed: 0.002 + Math.random() * 0.006 // Slower, more elegant
      });
    }

    let rotation = 0;
    let rotationVelocity = 0.002;
    const axisTilt = { x: 0.1, y: -0.2 }; // Natural earth-like tilt

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      // Shift globe slightly further to the right to balance minimal text
      const centerX = rect.width > 1024 ? rect.width * 0.72 : rect.width / 2;
      // Re-centered vertically
      const centerY = rect.height / 2;

      // Clear the canvas to make it perfectly transparent (removes sharp edges)
      ctx.clearRect(0, 0, rect.width, rect.height);

      // --- BREATHING & PULSE ---
      const time = Date.now() * 0.001;
      const breathing = radius * (1 + Math.sin(time * 0.5) * 0.015); // Subtle expansion

      // --- LAYER 0: NEBULA GLOW (BOUNDLESS) ---
      const nebula = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 3.5);
      nebula.addColorStop(0, 'rgba(232, 137, 12, 0.08)'); // Amber core
      nebula.addColorStop(0.4, 'rgba(15, 30, 50, 0.06)'); // Deep navy transition
      nebula.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // --- LAYER 0.1: DEEP SPACE PARALLAX ---
      starfield.forEach(s => {
        const perspective = 1000;
        const scale = perspective / (perspective + s.z);
        const sx = centerX + s.x * scale;
        const sy = centerY + s.y * scale;
        if(sx < 0 || sx > rect.width || sy < 0 || sy > rect.height) return;
        
        // Twinkle effect
        const twinkle = 0.5 + Math.sin(time * 2 + s.x) * 0.5;
        
        ctx.beginPath();
        ctx.arc(sx, sy, s.s * scale, 0, Math.PI * 2);
        
        ctx.fillStyle = s.color;
        ctx.globalAlpha = 0.2 * scale * twinkle;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        s.z -= 0.8; // Star movement
        if(s.z < -perspective) s.z = 1000; // Reset
      });

      // --- LAYER 0.5: ATMOSPHERIC AURA ---
      const aura = ctx.createRadialGradient(centerX, centerY, breathing * 0.85, centerX, centerY, breathing * 1.6);
      aura.addColorStop(0, 'rgba(232, 137, 12, 0.12)');
      aura.addColorStop(0.6, 'rgba(232, 137, 12, 0.03)');
      aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.beginPath();
      ctx.arc(centerX, centerY, breathing * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = aura;
      ctx.fill();

      // --- LAYER 0.8: ORBITAL RINGS ---
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const ringRadius = radius * (1.2 + i * 0.25) * (breathing / radius);
        const ringTiltX = axisTilt.x * 2;
        const ringTiltY = axisTilt.y * 2 + (i * 0.1);
        
        ctx.beginPath();
        ctx.ellipse(
          centerX, 
          centerY, 
          ringRadius, 
          ringRadius * 0.3, 
          rotation * (0.1 + i*0.05), 
          0, 
          Math.PI * 2
        );
        
        // Gradient stroke for rings
        const ringGradient = ctx.createLinearGradient(
          centerX - ringRadius, centerY, 
          centerX + ringRadius, centerY
        );
        ringGradient.addColorStop(0, `rgba(232, 147, 16, 0)`);
        ringGradient.addColorStop(0.5, `rgba(232, 147, 16, ${0.15 - i*0.04})`);
        ringGradient.addColorStop(1, `rgba(232, 147, 16, 0)`);
        
        ctx.strokeStyle = ringGradient;
        ctx.stroke();
      }

      // --- PHYSICS UPDATE ---
      rotation += rotationVelocity;
      rotationVelocity *= 0.99; // Natural decay
      if (rotationVelocity < 0.0015) rotationVelocity = 0.0015;

      const targetTiltY = (mouseRef.current.y - centerY) * 0.0004;
      const targetTiltX = (mouseRef.current.x - centerX) * 0.0004;
      axisTilt.y += (targetTiltY - axisTilt.y) * 0.05;
      axisTilt.x += (targetTiltX - axisTilt.x) * 0.05;

      // Project points
      const perspective = 850;
      const projected = points.map(p => {
        const rotated = rotatePoint(p, rotation, axisTilt);
        const scale = perspective / (perspective + rotated.z);
        return {
          ...p,
          projX: centerX + (rotated.x * (breathing/radius)) * scale,
          projY: centerY + (rotated.y * (breathing/radius)) * scale,
          projZ: rotated.z,
          scale,
          rotatedX: rotated.x,
          rotatedY: rotated.y
        };
      }).sort((a, b) => a.projZ - b.projZ);

      // --- LAYER 1: NETWORK ARCS & PACKETS ---
      arcs.forEach(arc => {
        const p1 = projected.find(p => p.id === arc.p1.id);
        const p2 = projected.find(p => p.id === arc.p2.id);
        if (!p1 || !p2) return;
        if (p1.projZ < -100 && p2.projZ < -100) return; // Hide arcs strictly behind

        const dist = Math.sqrt(Math.pow(p1.projX - p2.projX, 2) + Math.pow(p1.projY - p2.projY, 2));
        const lift = dist * 0.4;
        const midX = (p1.projX + p2.projX) / 2;
        const midY = (p1.projY + p2.projY) / 2;
        const mag = Math.sqrt(Math.pow(midX - centerX, 2) + Math.pow(midY - centerY, 2));
        const cpX = midX + ((midX - centerX)/mag) * lift;
        const cpY = midY + ((midY - centerY)/mag) * lift;

        const opacity = Math.min(1, Math.max(0, (Math.min(p1.projZ, p2.projZ) + radius) / (radius * 1.5)));

        // Base Arc
        ctx.beginPath();
        ctx.moveTo(p1.projX, p1.projY);
        ctx.quadraticCurveTo(cpX, cpY, p2.projX, p2.projY);
        ctx.strokeStyle = `rgba(232, 147, 16, ${arc.opacity * opacity * 0.4})`;
        ctx.lineWidth = 1.0;
        ctx.stroke();

        // Packet (Comet effect)
        const packet = packets.find(pk => pk.arc === arc);
        if (packet) {
          packet.progress += packet.speed;
          if (packet.progress > 1) {
            packet.progress = 0;
            packet.speed = 0.002 + Math.random() * 0.006;
          }
          
          const t = packet.progress;
          // Calculate current position
          const pkX = Math.pow(1-t, 2)*p1.projX + 2*(1-t)*t*cpX + Math.pow(t, 2)*p2.projX;
          const pkY = Math.pow(1-t, 2)*p1.projY + 2*(1-t)*t*cpY + Math.pow(t, 2)*p2.projY;
          
          // Calculate trail position (slightly behind)
          const trailT = Math.max(0, t - 0.08);
          const trX = Math.pow(1-trailT, 2)*p1.projX + 2*(1-trailT)*trailT*cpX + Math.pow(trailT, 2)*p2.projX;
          const trY = Math.pow(1-trailT, 2)*p1.projY + 2*(1-trailT)*trailT*cpY + Math.pow(trailT, 2)*p2.projY;
          
          // Draw Comet Tail
          const gradient = ctx.createLinearGradient(trX, trY, pkX, pkY);
          gradient.addColorStop(0, `rgba(232, 147, 16, 0)`);
          gradient.addColorStop(1, `rgba(255, 220, 100, ${opacity})`);
          
          ctx.beginPath();
          ctx.moveTo(trX, trY);
          ctx.lineTo(pkX, pkY);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 3.5 * p1.scale;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Draw Comet Head Glow
          ctx.beginPath();
          ctx.arc(pkX, pkY, 2.5 * p1.scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.shadowBlur = 15;
          ctx.shadowColor = 'rgba(232, 147, 16, 1)';
          ctx.fill();
          ctx.shadowBlur = 0; // Reset shadow for performance
        }
      });

      // --- LAYER 2: POINTS ---
      projected.forEach(p => {
        const opacity = Math.max(0, Math.min(1, (p.projZ + radius * 0.8) / (radius * 1.6)));
        if (opacity <= 0) return;
        
        // Highlight logic: points near the center front glow slightly brighter
        const distFromCenter = Math.sqrt(p.rotatedX*p.rotatedX + p.rotatedY*p.rotatedY);
        const centerHighlight = Math.max(0, 1 - distFromCenter / (radius * 0.5));
        
        if (p.isData) {
          const pulse = Math.sin(time * 2 + (p.pulse || 0)) * 0.5 + 0.5;
          const size = (2.5 + pulse * 1.5) * p.scale;
          
          // Outer Glow
          ctx.beginPath();
          ctx.arc(p.projX, p.projY, size * 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(232, 147, 16, ${opacity * 0.4 * pulse})`;
          ctx.fill();

          // Inner Core
          ctx.beginPath();
          ctx.arc(p.projX, p.projY, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * (0.8 + pulse * 0.2)})`;
          ctx.fill();
        } else {
          // Standard mesh points
          const tPhase = Math.sin(time + (points.indexOf(p) * 0.1));
          const baseOpacity = opacity * 0.35;
          const highlightOpacity = opacity * centerHighlight * 0.4;
          const finalOpacity = baseOpacity + highlightOpacity + (tPhase * 0.1 * opacity);
          
          const size = (1.0 + centerHighlight * 0.5) * p.scale;
          
          ctx.beginPath();
          ctx.arc(p.projX, p.projY, size, 0, Math.PI * 2);
          
          // Mix of cool blue and warm amber for depth
          if (p.projZ > 0) {
            ctx.fillStyle = `rgba(232, 160, 50, ${finalOpacity * 1.2})`;
          } else {
            ctx.fillStyle = `rgba(180, 210, 255, ${finalOpacity})`;
          }
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    const rotatePoint = (point: Point, rotation: number, tilt: { x: number; y: number }) => {
      let { x, y, z } = point;
      
      // Rotate Y (Global spin)
      const cosY = Math.cos(rotation);
      const sinY = Math.sin(rotation);
      const nx = x * cosY - z * sinY;
      const nz = x * sinY + z * cosY;
      x = nx;
      z = nz;

      // Rotate Tilt Pitch (Mouse Y)
      const cosP = Math.cos(tilt.y);
      const sinP = Math.sin(tilt.y);
      const ny = y * cosP - z * sinP;
      const nz2 = y * sinP + z * cosP;
      y = ny;
      z = nz2;

      // Rotate Tilt Yaw (Mouse X)
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
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseRef.current = { x, y };
      
      // Add subtle "kick" to rotation velocity when moving mouse horizontally
      rotationVelocity += (x - rect.width/2) * 0.000002;
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
    <div className={`absolute inset-0 transition-all duration-[2000ms] ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full mix-blend-screen"
        style={{ filter: 'contrast(1.1) brightness(1.1)' }}
      />
    </div>
  );
};

export default Globe;