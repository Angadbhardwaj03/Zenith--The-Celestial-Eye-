import { useMemo } from 'react';

export default function StarField() {
  const stars = useMemo(() => {
    return Array.from({ length: 200 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.5 + Math.random() * 1.5,
      opacity: 0.1 + Math.random() * 0.6,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 4,
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-void via-void-light to-void opacity-90" />
      
      {/* Stars */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {stars.map(star => (
          <circle
            key={star.id}
            cx={`${star.x}%`}
            cy={`${star.y}%`}
            r={star.size}
            fill="white"
            opacity={star.opacity}
          >
            <animate
              attributeName="opacity"
              values={`${star.opacity * 0.3};${star.opacity};${star.opacity * 0.3}`}
              dur={`${star.duration}s`}
              begin={`${star.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>

      {/* Nebula accents */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.03]"
        style={{
          top: '10%',
          right: '-10%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.4), transparent 60%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.03]"
        style={{
          bottom: '5%',
          left: '-5%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.4), transparent 60%)',
          filter: 'blur(80px)',
        }}
      />
    </div>
  );
}
