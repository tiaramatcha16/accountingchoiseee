import React, { useEffect, useRef } from 'react';

interface SlowMonoGradientProps {
  className?: string;
  children?: React.ReactNode;
}

export const SlowMonoGradient: React.FC<SlowMonoGradientProps> = ({ className = '', children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animId: number;
    const startTime = performance.now();

    // 4 Blobs persis sesuai spek "Slow Mono" murni (Charcoal, White, Lilac, Slate) TANPA HIJAU di background
    const blobs = [
      {
        baseX: 66.94,
        baseY: 46.43,
        p: 0.12,
        p2: 0.85,
        color: 'rgba(25, 25, 25, ',
        stops: '0% 0%, 0.844 19.02%, 0.5 38.05%, 0.156 57.07%, 0 76.1%',
      },
      {
        baseX: 34.69,
        baseY: 66.31,
        p: 1.45,
        p2: 2.12,
        color: 'rgba(250, 250, 250, ',
        stops: '0% 0%, 0.844 17.8%, 0.5 35.6%, 0.156 53.4%, 0 71.2%',
      },
      {
        baseX: 48.93,
        baseY: 19.32,
        p: 2.89,
        p2: 3.44,
        color: 'rgba(138, 138, 138, ',
        stops: '0% 0%, 0.844 11.94%, 0.5 23.88%, 0.156 35.81%, 0 47.75%',
      },
      {
        baseX: 80.23,
        baseY: 87.54,
        p: 4.15,
        p2: 5.02,
        color: 'rgba(74, 74, 74, ',
        stops: '0% 0%, 0.844 10.28%, 0.5 20.55%, 0.156 30.83%, 0 41.1%',
      },
    ];

    const grainUrl =
      "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.160'/></svg>\")";

    const render = (time: number) => {
      const t = (time - startTime) / 1000;
      const ph = t * 1.0;
      const amt = 0.42;

      const radials = blobs.map((b) => {
        const modX = (Math.sin(ph * 0.55 + b.p) - Math.sin(b.p)) * 14 * amt;
        const modY = (Math.sin(ph * 0.43 + b.p2) - Math.sin(b.p2)) * 14 * amt;
        const curX = b.baseX + modX;
        const curY = b.baseY + modY;

        const stopDefs = b.stops.split(', ').map((s) => {
          const [alpha, pos] = s.split(' ');
          return `${b.color}${alpha}) ${pos}`;
        }).join(', ');

        return `radial-gradient(circle at ${curX}% ${curY}%, ${stopDefs})`;
      });

      if (containerRef.current) {
        containerRef.current.style.backgroundImage = `${grainUrl}, ${radials.join(', ')}`;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      style={{
        backgroundColor: '#191919',
        backgroundSize: '120px 120px, auto, auto, auto, auto',
        backgroundBlendMode: 'overlay, normal, normal, normal, normal',
      }}
    >
      {children}
    </div>
  );
};

export default SlowMonoGradient;
