import { useRef, useMemo, useEffect, forwardRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useCursor } from '@react-three/drei';
import * as THREE from 'three';
import type { SceneObject } from '../../types';

interface Props {
  object: SceneObject;
  isSelected: boolean;
  onClick: (id: string) => void;
}

function BoxGeom() {
  return <boxGeometry args={[1, 1, 1]} />;
}
function SphereGeom() {
  return <sphereGeometry args={[0.5, 32, 32]} />;
}
function CylinderGeom() {
  return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
}
function ConeGeom() {
  return <coneGeometry args={[0.5, 1, 32]} />;
}
function TorusGeom() {
  return <torusGeometry args={[0.5, 0.2, 16, 32]} />;
}

function CompoundObject({ kind, color }: { kind: string; color: string }) {
  const c = new THREE.Color(color);
  switch (kind) {
    case 'person': return (
      <group>
        <mesh position={[0, 1.4, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
          <meshStandardMaterial color={c.clone().multiplyScalar(0.7)} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.4, 0.6, 0.2]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[-0.22, 0.0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.8, 8]} />
          <meshStandardMaterial color={c.clone().multiplyScalar(0.7)} />
        </mesh>
        <mesh position={[0.22, 0.0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.8, 8]} />
          <meshStandardMaterial color={c.clone().multiplyScalar(0.7)} />
        </mesh>
      </group>
    );
    case 'house': return (
      <group>
        {/* Main body */}
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[1.2, 1.6, 0.9]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* Roof */}
        <mesh position={[0, 1.7, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.9, 0.7, 4]} />
          <meshStandardMaterial color={c.clone().multiplyScalar(0.55)} />
        </mesh>
        {/* Door */}
        <mesh position={[0, 0.3, 0.46]}>
          <boxGeometry args={[0.18, 0.6, 0.05]} />
          <meshStandardMaterial color="#6B3A2A" />
        </mesh>
        {/* Door knob */}
        <mesh position={[0.06, 0.32, 0.49]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#DAA520" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Left window */}
        <mesh position={[-0.3, 0.85, 0.46]}>
          <boxGeometry args={[0.22, 0.28, 0.04]} />
          <meshStandardMaterial color="#87CEEB" emissive="#87CEEB" emissiveIntensity={0.2} />
        </mesh>
        {/* Left window frame - cross */}
        <mesh position={[-0.3, 0.85, 0.48]}>
          <boxGeometry args={[0.24, 0.03, 0.01]} />
          <meshStandardMaterial color="#E8E0D8" />
        </mesh>
        <mesh position={[-0.3, 0.85, 0.48]}>
          <boxGeometry args={[0.03, 0.30, 0.01]} />
          <meshStandardMaterial color="#E8E0D8" />
        </mesh>
        {/* Right window */}
        <mesh position={[0.3, 0.85, 0.46]}>
          <boxGeometry args={[0.22, 0.28, 0.04]} />
          <meshStandardMaterial color="#87CEEB" emissive="#87CEEB" emissiveIntensity={0.2} />
        </mesh>
        {/* Right window frame - cross */}
        <mesh position={[0.3, 0.85, 0.48]}>
          <boxGeometry args={[0.24, 0.03, 0.01]} />
          <meshStandardMaterial color="#E8E0D8" />
        </mesh>
        <mesh position={[0.3, 0.85, 0.48]}>
          <boxGeometry args={[0.03, 0.30, 0.01]} />
          <meshStandardMaterial color="#E8E0D8" />
        </mesh>
        {/* Chimney */}
        <mesh position={[0.3, 1.9, -0.15]}>
          <boxGeometry args={[0.14, 0.45, 0.14]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
        {/* Roof ridge */}
        <mesh position={[0, 2.05, 0]}>
          <boxGeometry args={[0.06, 0.08, 1.1]} />
          <meshStandardMaterial color={c.clone().multiplyScalar(0.45)} />
        </mesh>
      </group>
    );
    case 'table': return (
      <group>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.2, 0.1, 0.8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[-0.5, 0.25, -0.3]}>
          <cylinderGeometry args={[0.06, 0.06, 0.5, 8]} />
          <meshStandardMaterial color={c.clone().multiplyScalar(0.5)} />
        </mesh>
        <mesh position={[0.5, 0.25, -0.3]}>
          <cylinderGeometry args={[0.06, 0.06, 0.5, 8]} />
          <meshStandardMaterial color={c.clone().multiplyScalar(0.5)} />
        </mesh>
        <mesh position={[-0.5, 0.25, 0.3]}>
          <cylinderGeometry args={[0.06, 0.06, 0.5, 8]} />
          <meshStandardMaterial color={c.clone().multiplyScalar(0.5)} />
        </mesh>
        <mesh position={[0.5, 0.25, 0.3]}>
          <cylinderGeometry args={[0.06, 0.06, 0.5, 8]} />
          <meshStandardMaterial color={c.clone().multiplyScalar(0.5)} />
        </mesh>
      </group>
    );
    case 'chair': return (
      <group>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.4, 0.05, 0.4]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 0.3, -0.18]}>
          <boxGeometry args={[0.35, 0.5, 0.04]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[-0.15, 0.2, 0.15]}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
          <meshStandardMaterial color={c.clone().multiplyScalar(0.5)} />
        </mesh>
        <mesh position={[0.15, 0.2, 0.15]}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
          <meshStandardMaterial color={c.clone().multiplyScalar(0.5)} />
        </mesh>
      </group>
    );
    case 'cup': return (
      <group>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.15, 0.12, 0.6, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0.18, 0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.08, 0.02, 8, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    );
    case 'tree': return (
      <group>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 0.8, 8]} />
          <meshStandardMaterial color="#8B6914" />
        </mesh>
        <mesh position={[0, 1.0, 0]}>
          <coneGeometry args={[0.5, 1, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <coneGeometry args={[0.35, 0.7, 8]} />
          <meshStandardMaterial color={c.clone().multiplyScalar(0.8)} />
        </mesh>
      </group>
    );
    case 'car': return (
      <group>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[1.5, 0.4, 0.8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 0.6, 0.1]}>
          <boxGeometry args={[0.7, 0.25, 0.6]} />
          <meshStandardMaterial color={c.clone().multiplyScalar(0.85)} />
        </mesh>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh position={[-0.5, 0.12, 0.35]}>
            <cylinderGeometry args={[0.18, 0.18, 0.1, 16]} />
            <meshStandardMaterial color="#222222" />
          </mesh>
          <mesh position={[0.5, 0.12, 0.35]}>
            <cylinderGeometry args={[0.18, 0.18, 0.1, 16]} />
            <meshStandardMaterial color="#222222" />
          </mesh>
          <mesh position={[-0.5, 0.12, -0.35]}>
            <cylinderGeometry args={[0.18, 0.18, 0.1, 16]} />
            <meshStandardMaterial color="#222222" />
          </mesh>
          <mesh position={[0.5, 0.12, -0.35]}>
            <cylinderGeometry args={[0.18, 0.18, 0.1, 16]} />
            <meshStandardMaterial color="#222222" />
          </mesh>
        </group>
      </group>
    );
    case 'sofa': return (
      <group>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[2.5, 0.4, 0.8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 0.7, -0.35]}>
          <boxGeometry args={[2.3, 0.4, 0.1]} />
          <meshStandardMaterial color={c.clone().multiplyScalar(0.85)} />
        </mesh>
        <mesh position={[-1.1, 0.5, 0.35]}>
          <boxGeometry args={[0.2, 0.4, 0.1]} />
          <meshStandardMaterial color={c.clone().multiplyScalar(0.85)} />
        </mesh>
        <mesh position={[1.1, 0.5, 0.35]}>
          <boxGeometry args={[0.2, 0.4, 0.1]} />
          <meshStandardMaterial color={c.clone().multiplyScalar(0.85)} />
        </mesh>
      </group>
    );
    case 'bed': return (
      <group>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[2, 0.3, 1.5]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[1.8, 0.15, 1.3]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, 0.7, -0.7]}>
          <boxGeometry args={[1.9, 0.5, 0.1]} />
          <meshStandardMaterial color={c.clone().multiplyScalar(0.7)} />
        </mesh>
      </group>
    );
    case 'fence': return (
      <group>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[2, 0.5, 0.05]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[-0.8, 0.5, 0]}>
          <boxGeometry args={[0.06, 0.5, 0.05]} />
          <meshStandardMaterial color={c.clone().multiplyScalar(0.7)} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.06, 0.5, 0.05]} />
          <meshStandardMaterial color={c.clone().multiplyScalar(0.7)} />
        </mesh>
        <mesh position={[0.8, 0.5, 0]}>
          <boxGeometry args={[0.06, 0.5, 0.05]} />
          <meshStandardMaterial color={c.clone().multiplyScalar(0.7)} />
        </mesh>
      </group>
    );
    default: return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    );
  }
}

function ImportedModel({ modelData }: { modelData: ArrayBuffer }) {
  const blobUrl = useMemo(() => {
    const blob = new Blob([modelData], { type: 'application/octet-stream' });
    return URL.createObjectURL(blob);
  }, [modelData]);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const { scene } = useGLTF(blobUrl);

  return <primitive object={scene} />;
}

const BASIC_GEOMETRIES = new Set(['box', 'sphere', 'cylinder', 'cone', 'torus']);

export default forwardRef<THREE.Group, Props>(function SceneObject3D({ object, isSelected, onClick }, ref) {
  const innerRef = useRef<THREE.Group>(null);
  const groupRef = (ref || innerRef) as React.RefObject<THREE.Group>;
  useCursor(!object.locked);

  return (
    <group
      ref={groupRef}
      position={[object.position.x, object.position.y, object.position.z]}
      rotation={[object.rotation.x, object.rotation.y, object.rotation.z]}
      scale={[object.scale.x, object.scale.y, object.scale.z]}
      visible={object.visible}
      onClick={(e) => {
        e.stopPropagation();
        if (!object.locked) onClick(object.id);
      }}
    >
      {object.modelData ? (
        <ImportedModel modelData={object.modelData} />
      ) : BASIC_GEOMETRIES.has(object.kind) ? (
        <mesh>
          {object.kind === 'box' && <BoxGeom />}
          {object.kind === 'sphere' && <SphereGeom />}
          {object.kind === 'cylinder' && <CylinderGeom />}
          {object.kind === 'cone' && <ConeGeom />}
          {object.kind === 'torus' && <TorusGeom />}
          <meshStandardMaterial
            color={object.color}
            emissive={isSelected ? object.color : '#000000'}
            emissiveIntensity={isSelected ? 0.3 : 0}
          />
        </mesh>
      ) : (
        <CompoundObject kind={object.kind} color={object.color} />
      )}
    </group>
  );
});