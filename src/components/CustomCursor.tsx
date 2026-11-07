import { useEffect, useRef, useState } from 'react';

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Position state for smooth lerping
  const mouse = useRef({ x: -100, y: -100 });
  const delayedMouse = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Check if device supports hover (ignores touch devices)
    if (window.matchMedia('(hover: none)').matches || window.innerWidth <= 768) {
      setIsMobile(true);
      return;
    }

    let animationFrameId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('.magnetic') ||
        getComputedStyle(target).cursor === 'pointer'
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const animate = () => {
      // Lerp (linear interpolation) for smooth trailing effect
      delayedMouse.current.x += (mouse.current.x - delayedMouse.current.x) * 0.15;
      delayedMouse.current.y += (mouse.current.y - delayedMouse.current.y) * 0.15;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${delayedMouse.current.x}px, ${delayedMouse.current.y}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (isMobile) return null;

  return (
    <>
      <style>
        {`
          @media (hover: hover) and (pointer: fine) {
            * {
              cursor: none !important;
            }
          }
        `}
      </style>
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 w-4 h-4 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference transition-all duration-300 ease-out -ml-2 -mt-2 flex items-center justify-center ${
          isHovering ? 'scale-[3] opacity-80' : 'scale-100 opacity-100'
        }`}
        style={{
          willChange: 'transform',
        }}
      >
        {/* Optional inner dot for when hovering */}
        <div className={`w-0.5 h-0.5 bg-black rounded-full transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`} />
      </div>
    </>
  );
};

export default CustomCursor;
