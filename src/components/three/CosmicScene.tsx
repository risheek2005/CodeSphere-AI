/* ============================================
   CosmicScene — Stunning 3D background
   React Three Fiber + custom shaders
   Stars, nebula, floating cubes, aurora, grid
   ============================================ */
import { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

/* ---- Animated Stars Background ---- */
function StarField() {
  return (
    <Stars
      radius={100}
      depth={80}
      count={3000}
      factor={4}
      saturation={0.2}
      fade
      speed={0.5}
    />
  );
}

/* ---- Floating Glowing Cubes ---- */
function FloatingCubes() {
  const count = 15;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const cubeData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20 - 5,
      ] as [number, number, number],
      rotation: Math.random() * Math.PI * 2,
      speed: 0.2 + Math.random() * 0.5,
      scale: 0.1 + Math.random() * 0.25,
      floatSpeed: 0.5 + Math.random() * 1.5,
    }));
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    cubeData.forEach((cube, i) => {
      dummy.position.set(
        cube.position[0] + Math.sin(t * cube.floatSpeed * 0.3) * 0.5,
        cube.position[1] + Math.sin(t * cube.floatSpeed) * 0.8,
        cube.position[2] + Math.cos(t * cube.floatSpeed * 0.5) * 0.3,
      );
      dummy.rotation.set(
        t * cube.speed * 0.5 + cube.rotation,
        t * cube.speed * 0.3,
        t * cube.speed * 0.2,
      );
      dummy.scale.setScalar(cube.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="#6366F1"
        emissive="#6366F1"
        emissiveIntensity={0.5}
        transparent
        opacity={0.4}
        wireframe
      />
    </instancedMesh>
  );
}

/* ---- Nebula Clouds ---- */
function NebulaClouds() {
  const groupRef = useRef<THREE.Group>(null);

  const clouds = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 15 + 3,
        -15 - Math.random() * 15,
      ] as [number, number, number],
      scale: 3 + Math.random() * 5,
      color: i % 3 === 0 ? '#6366F1' : i % 3 === 1 ? '#8B5CF6' : '#06B6D4',
      opacity: 0.04 + Math.random() * 0.06,
    }));
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      {clouds.map((cloud, i) => (
        <mesh key={i} position={cloud.position}>
          <sphereGeometry args={[cloud.scale, 16, 16]} />
          <meshBasicMaterial
            color={cloud.color}
            transparent
            opacity={cloud.opacity}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ---- Digital Grid Floor ---- */
function DigitalGrid() {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame(({ clock }) => {
    if (gridRef.current) {
      gridRef.current.position.z = (clock.getElapsedTime() * 0.5) % 2;
    }
  });

  return (
    <group position={[0, -6, 0]} rotation={[0, 0, 0]}>
      <gridHelper
        ref={gridRef}
        args={[60, 60, '#6366F1', '#1a1f4e']}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial
          color="#050816"
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

/* ---- Binary Particles ---- */
function BinaryParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 200;

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;
      vel[i * 3] = (Math.random() - 0.5) * 0.002;
      vel[i * 3 + 1] = -0.005 - Math.random() * 0.01;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    return [pos, vel];
  }, []);

  useFrame(() => {
    if (!particlesRef.current) return;
    const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3] += velocities[i * 3];
      pos[i * 3 + 1] += velocities[i * 3 + 1];
      pos[i * 3 + 2] += velocities[i * 3 + 2];
      // Reset particles that fall below
      if (pos[i * 3 + 1] < -15) {
        pos[i * 3 + 1] = 15;
        pos[i * 3] = (Math.random() - 0.5) * 40;
      }
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#06B6D4"
        size={0.06}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

/* ---- Aurora / Light Ribbons ---- */
function Aurora() {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(30, 4, 64, 1);
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const pos = meshRef.current.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, Math.sin(x * 0.5 + t * 0.8) * 0.5 + Math.sin(x * 0.3 + t * 0.5) * 0.3);
      pos.setY(
        i,
        pos.getY(i) > 0
          ? 2 + Math.sin(x * 0.4 + t) * 0.3
          : -2 + Math.sin(x * 0.4 + t) * 0.3,
      );
    }
    pos.needsUpdate = true;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, 8, -15]} rotation={[0.2, 0, 0]}>
      <meshBasicMaterial
        color="#8B5CF6"
        transparent
        opacity={0.08}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ---- Floating Holographic Rings ---- */
function NeonRings() {
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <Float key={i} speed={1 + i * 0.5} rotationIntensity={0.5} floatIntensity={1}>
          <mesh
            position={[
              -8 + i * 8,
              2 + i * 1.5,
              -10 - i * 3,
            ]}
            rotation={[Math.PI / 4 + i * 0.3, i * 0.5, 0]}
          >
            <torusGeometry args={[1.5 + i * 0.5, 0.02, 16, 64]} />
            <meshBasicMaterial
              color={i === 0 ? '#6366F1' : i === 1 ? '#8B5CF6' : '#06B6D4'}
              transparent
              opacity={0.3}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/* ---- Mouse-reactive camera ---- */
function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, []);

  useMemo(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  useFrame(() => {
    camera.position.x += (mouse.current.x * 1.5 - camera.position.x) * 0.02;
    camera.position.y += (-mouse.current.y * 0.8 + 1 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, -5);
  });

  return null;
}

/* ---- Main Scene Export ---- */
export default function CosmicScene({ className = '' }: { className?: string }) {
  return (
    <div className={`cosmic-scene ${className}`} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      pointerEvents: 'none',
    }}>
      <Canvas
        camera={{ position: [0, 1, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ pointerEvents: 'auto' }}
      >
        <fog attach="fog" args={['#050816', 15, 40]} />
        <ambientLight intensity={0.15} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#6366F1" />
        <pointLight position={[-10, 5, -10]} intensity={0.3} color="#8B5CF6" />
        <pointLight position={[0, -5, 5]} intensity={0.2} color="#06B6D4" />

        <StarField />
        <FloatingCubes />
        <NebulaClouds />
        <DigitalGrid />
        <BinaryParticles />
        <Aurora />
        <NeonRings />
        <CameraRig />
      </Canvas>
    </div>
  );
}
