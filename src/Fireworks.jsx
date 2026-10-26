import { useEffect, useRef } from 'react';
import { Fireworks as FireworksEngine } from 'fireworks-js';

export const Fireworks = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const fireworks = new FireworksEngine(containerRef.current, {
      autoresize: true,
      opacity: 0.5,
      acceleration: 1.05,
      friction: 0.97,
      gravity: 1.6,
      particles: 60,
      explosion: 6,
      intensity: 35,
      flickering: 50,
      traceLength: 3,
      traceSpeed: 6,
      lineStyle: 'round',
      delay: { min: 30, max: 60 },
      rocketsPoint: { min: 50, max: 50 },
      lineWidth: { explosion: { min: 1, max: 3 }, trace: { min: 1, max: 2 } },
      brightness: { min: 50, max: 80 },
      decay: { min: 0.015, max: 0.03 },
      mouse: { click: false, move: false, max: 1 },
      sound: { enabled: false },
    });
    fireworks.start();

    return () => {
      fireworks.stop(true);
    };
  }, []);

  return <div className="fireworks" ref={containerRef} />;
};
