import React, { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Theme } from '../types';

interface WavePointsProps {
  theme: Theme;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  isInViewRef: React.MutableRefObject<boolean>;
  isMobile: boolean;
}

const WavePoints: React.FC<WavePointsProps> = ({ theme, pointerRef, isInViewRef, isMobile }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const { invalidate } = useThree();
  const timeRef = useRef(0);
  const lastFrameRef = useRef(0);

  const cols = isMobile ? 52 : 100;
  const rows = isMobile ? 28 : 60;
  const count = cols * rows; // 6,000 desktop, ~1,456 mobile

  const { baseX, baseZ, positions } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const bx = new Float32Array(count);
    const bz = new Float32Array(count);

    const width = 22;
    const depth = 13;
    let idx = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c / (cols - 1) - 0.5) * width;
        const z = (r / (rows - 1) - 0.5) * depth;
        bx[idx] = x;
        bz[idx] = z;

        pos[idx * 3] = x;
        pos[idx * 3 + 1] =
          Math.sin(x * 0.42) * 0.45 +
          Math.cos(z * 0.55) * 0.35 +
          Math.sin((x + z) * 0.25) * 0.25;
        pos[idx * 3 + 2] = z;
        idx++;
      }
    }

    return { baseX: bx, baseZ: bz, positions: pos };
  }, [cols, rows, count]);

  useEffect(() => {
    let rafId = 0;
    const INTERVAL_MS = isMobile ? 40 : 32;

    const tick = (now: number) => {
      if (!document.hidden && isInViewRef.current && now - lastFrameRef.current >= INTERVAL_MS) {
        lastFrameRef.current = now;
        invalidate();
      }
      rafId = requestAnimationFrame(tick);
    };

    const handleVisibility = () => {
      if (!document.hidden && isInViewRef.current) {
        lastFrameRef.current = performance.now();
        invalidate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [invalidate, isInViewRef, isMobile]);

  useFrame((_, delta) => {
    if (!pointsRef.current || !isInViewRef.current) return;
    const clampedDelta = Math.min(delta, 0.08);
    timeRef.current += clampedDelta * 0.65;
    const t = timeRef.current;

    const geom = pointsRef.current.geometry;
    const attr = geom.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;

    const px = pointerRef.current.x;
    const py = pointerRef.current.y;

    for (let i = 0; i < count; i++) {
      const x = baseX[i];
      const z = baseZ[i];
      const wave1 = Math.sin(x * 0.42 + t) * 0.48;
      const wave2 = Math.cos(z * 0.55 + t * 0.78) * 0.34;
      const wave3 = Math.sin(x * 0.26 - z * 0.32 + t * 0.55) * 0.26;
      arr[i * 3 + 1] = wave1 + wave2 + wave3;
    }

    attr.needsUpdate = true;

    pointsRef.current.rotation.y = THREE.MathUtils.lerp(
      pointsRef.current.rotation.y,
      px * 0.08,
      0.06
    );
    pointsRef.current.rotation.x = THREE.MathUtils.lerp(
      pointsRef.current.rotation.x,
      0.16 + py * 0.04,
      0.06
    );
  });

  const pointColor = theme === 'dark' ? '#C4AEA5' : '#7A645C';
  const pointOpacity = theme === 'dark' ? 0.42 : 0.48;

  return (
    <points ref={pointsRef} rotation={[0.16, 0, 0]} position={[0, -0.8, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={pointColor}
        size={isMobile ? 0.095 : 0.075}
        sizeAttenuation
        transparent
        opacity={pointOpacity}
        depthWrite={false}
      />
    </points>
  );
};

interface HeroDottedWaveProps {
  theme: Theme;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  isInViewRef: React.MutableRefObject<boolean>;
  isMobile: boolean;
}

export const HeroDottedWave: React.FC<HeroDottedWaveProps> = ({
  theme,
  pointerRef,
  isInViewRef,
  isMobile,
}) => {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop="demand"
      camera={{ position: [0, 3.2, 8.8], fov: 46 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <WavePoints
        theme={theme}
        pointerRef={pointerRef}
        isInViewRef={isInViewRef}
        isMobile={isMobile}
      />
    </Canvas>
  );
};

export default HeroDottedWave;
