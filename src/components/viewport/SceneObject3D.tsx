import { useRef, useCallback, useEffect, useMemo } from 'react';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { useSceneStore } from '../../store/sceneStore';
import type { PrimitiveType } from '../../types';

interface SceneObjectProps {
  id: string;
  gltfUrl: string;
  primitiveType?: PrimitiveType;
  color?: string;
  renderOrder: number;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  visible: boolean;
  locked: boolean;
}

function Part({ geo, pos, color, rot }: { geo: THREE.BufferGeometry; pos: [number, number, number]; color: THREE.Color; rot?: [number, number, number] }) {
  return (
    <mesh geometry={geo} position={pos} rotation={rot ?? [0, 0, 0]}>
      <meshStandardMaterial color={color} transparent opacity={0.85} />
    </mesh>
  );
}

function PrimitiveMesh({ type, color }: { type: PrimitiveType; color: string }) {
  const c = useMemo(() => new THREE.Color(color), [color]);
  const cDark = useMemo(() => new THREE.Color(color).multiplyScalar(0.7), [color]);
  const cLight = useMemo(() => new THREE.Color(color).multiplyScalar(1.3), [color]);

  switch (type) {
    case 'box': {
      const g = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
      return (
        <group>
          <Part geo={g} pos={[0, 0.5, 0]} color={c} />
          <lineSegments geometry={useMemo(() => new THREE.EdgesGeometry(g), [g])} position={[0, 0.5, 0]}>
            <lineBasicMaterial color={cLight} />
          </lineSegments>
        </group>
      );
    }
    case 'sphere': {
      const g = useMemo(() => new THREE.SphereGeometry(0.5, 32, 32), []);
      return (
        <group>
          <Part geo={g} pos={[0, 0.5, 0]} color={c} />
          <lineSegments geometry={useMemo(() => new THREE.EdgesGeometry(g, 30), [g])} position={[0, 0.5, 0]}>
            <lineBasicMaterial color={cLight} />
          </lineSegments>
        </group>
      );
    }
    case 'cylinder': {
      const g = useMemo(() => new THREE.CylinderGeometry(0.5, 0.5, 1, 32), []);
      return (
        <group>
          <Part geo={g} pos={[0, 0.5, 0]} color={c} />
          <lineSegments geometry={useMemo(() => new THREE.EdgesGeometry(g, 30), [g])} position={[0, 0.5, 0]}>
            <lineBasicMaterial color={cLight} />
          </lineSegments>
        </group>
      );
    }
    case 'cone': {
      const g = useMemo(() => new THREE.ConeGeometry(0.5, 1, 32), []);
      return (
        <group>
          <Part geo={g} pos={[0, 0.5, 0]} color={c} />
          <lineSegments geometry={useMemo(() => new THREE.EdgesGeometry(g, 30), [g])} position={[0, 0.5, 0]}>
            <lineBasicMaterial color={cLight} />
          </lineSegments>
        </group>
      );
    }
    case 'torus': {
      const g = useMemo(() => new THREE.TorusGeometry(0.4, 0.15, 16, 48), []);
      return (
        <group>
          <Part geo={g} pos={[0, 0.5, 0]} color={c} />
          <lineSegments geometry={useMemo(() => new THREE.EdgesGeometry(g, 30), [g])} position={[0, 0.5, 0]}>
            <lineBasicMaterial color={cLight} />
          </lineSegments>
        </group>
      );
    }

    case 'person': {
      const bodyG = useMemo(() => new THREE.CylinderGeometry(0.2, 0.25, 1, 16), []);
      const headG = useMemo(() => new THREE.SphereGeometry(0.2, 16, 16), []);
      const legG = useMemo(() => new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8), []);
      const armG = useMemo(() => new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8), []);
      return (
        <group>
          <Part geo={bodyG} pos={[0, 1.1, 0]} color={c} />
          <Part geo={headG} pos={[0, 1.8, 0]} color={cLight} />
          <Part geo={legG} pos={[-0.1, 0.3, 0]} color={cDark} />
          <Part geo={legG} pos={[0.1, 0.3, 0]} color={cDark} />
          <Part geo={armG} pos={[-0.3, 1.2, 0]} color={cDark} rot={[0, 0, 0.3]} />
          <Part geo={armG} pos={[0.3, 1.2, 0]} color={cDark} rot={[0, 0, -0.3]} />
        </group>
      );
    }

    case 'house': {
      const wallG = useMemo(() => new THREE.BoxGeometry(1.6, 1, 1.2), []);
      const roofG = useMemo(() => new THREE.ConeGeometry(1.2, 0.6, 4), []);
      const doorG = useMemo(() => new THREE.BoxGeometry(0.3, 0.5, 0.05), []);
      const windowG = useMemo(() => new THREE.BoxGeometry(0.25, 0.25, 0.05), []);
      return (
        <group>
          <Part geo={wallG} pos={[0, 0.5, 0]} color={c} />
          <Part geo={roofG} pos={[0, 1.3, 0]} color={cDark} rot={[0, Math.PI / 4, 0]} />
          <Part geo={doorG} pos={[0, 0.25, 0.63]} color={cDark} />
          <Part geo={windowG} pos={[-0.4, 0.6, 0.63]} color={cLight} />
          <Part geo={windowG} pos={[0.4, 0.6, 0.63]} color={cLight} />
        </group>
      );
    }

    case 'table': {
      const topG = useMemo(() => new THREE.BoxGeometry(1.2, 0.06, 0.8), []);
      const legG = useMemo(() => new THREE.CylinderGeometry(0.04, 0.04, 0.7, 8), []);
      return (
        <group>
          <Part geo={topG} pos={[0, 0.7, 0]} color={c} />
          <Part geo={legG} pos={[-0.5, 0.35, -0.3]} color={cDark} />
          <Part geo={legG} pos={[0.5, 0.35, -0.3]} color={cDark} />
          <Part geo={legG} pos={[-0.5, 0.35, 0.3]} color={cDark} />
          <Part geo={legG} pos={[0.5, 0.35, 0.3]} color={cDark} />
        </group>
      );
    }

    case 'chair': {
      const seatG = useMemo(() => new THREE.BoxGeometry(0.5, 0.05, 0.5), []);
      const backG = useMemo(() => new THREE.BoxGeometry(0.5, 0.5, 0.05), []);
      const legG = useMemo(() => new THREE.CylinderGeometry(0.03, 0.03, 0.45, 8), []);
      return (
        <group>
          <Part geo={seatG} pos={[0, 0.45, 0]} color={c} />
          <Part geo={backG} pos={[0, 0.72, -0.22]} color={cDark} />
          <Part geo={legG} pos={[-0.2, 0.22, -0.2]} color={cDark} />
          <Part geo={legG} pos={[0.2, 0.22, -0.2]} color={cDark} />
          <Part geo={legG} pos={[-0.2, 0.22, 0.2]} color={cDark} />
          <Part geo={legG} pos={[0.2, 0.22, 0.2]} color={cDark} />
        </group>
      );
    }

    case 'cup': {
      const bodyG = useMemo(() => new THREE.CylinderGeometry(0.15, 0.12, 0.35, 16), []);
      const handleG = useMemo(() => new THREE.TorusGeometry(0.08, 0.02, 8, 16, Math.PI), []);
      return (
        <group>
          <Part geo={bodyG} pos={[0, 0.175, 0]} color={c} />
          <Part geo={handleG} pos={[0.17, 0.2, 0]} color={cDark} rot={[0, 0, Math.PI / 2]} />
        </group>
      );
    }

    case 'tree': {
      const trunkG = useMemo(() => new THREE.CylinderGeometry(0.08, 0.1, 0.8, 8), []);
      const crownG = useMemo(() => new THREE.SphereGeometry(0.4, 16, 16), []);
      const crown2G = useMemo(() => new THREE.SphereGeometry(0.3, 16, 16), []);
      return (
        <group>
          <Part geo={trunkG} pos={[0, 0.4, 0]} color={cDark} />
          <Part geo={crownG} pos={[0, 1.1, 0]} color={c} />
          <Part geo={crown2G} pos={[0.15, 1.35, 0.1]} color={cLight} />
        </group>
      );
    }

    case 'car': {
      const bodyG = useMemo(() => new THREE.BoxGeometry(1.6, 0.35, 0.8), []);
      const cabinG = useMemo(() => new THREE.BoxGeometry(0.8, 0.3, 0.7), []);
      const wheelG = useMemo(() => new THREE.CylinderGeometry(0.15, 0.15, 0.08, 16), []);
      return (
        <group>
          <Part geo={bodyG} pos={[0, 0.3, 0]} color={c} />
          <Part geo={cabinG} pos={[-0.1, 0.62, 0]} color={cLight} />
          <Part geo={wheelG} pos={[-0.45, 0.15, 0.42]} color={cDark} rot={[Math.PI / 2, 0, 0]} />
          <Part geo={wheelG} pos={[0.45, 0.15, 0.42]} color={cDark} rot={[Math.PI / 2, 0, 0]} />
          <Part geo={wheelG} pos={[-0.45, 0.15, -0.42]} color={cDark} rot={[Math.PI / 2, 0, 0]} />
          <Part geo={wheelG} pos={[0.45, 0.15, -0.42]} color={cDark} rot={[Math.PI / 2, 0, 0]} />
        </group>
      );
    }

    case 'sofa': {
      const seatG = useMemo(() => new THREE.BoxGeometry(1.4, 0.25, 0.7), []);
      const backG = useMemo(() => new THREE.BoxGeometry(1.4, 0.45, 0.12), []);
      const armG = useMemo(() => new THREE.BoxGeometry(0.12, 0.3, 0.7), []);
      return (
        <group>
          <Part geo={seatG} pos={[0, 0.3, 0]} color={c} />
          <Part geo={backG} pos={[0, 0.65, -0.29]} color={cDark} />
          <Part geo={armG} pos={[-0.64, 0.42, 0]} color={cDark} />
          <Part geo={armG} pos={[0.64, 0.42, 0]} color={cDark} />
        </group>
      );
    }

    case 'bed': {
      const frameG = useMemo(() => new THREE.BoxGeometry(1.4, 0.2, 2), []);
      const mattressG = useMemo(() => new THREE.BoxGeometry(1.3, 0.15, 1.9), []);
      const headG = useMemo(() => new THREE.BoxGeometry(1.4, 0.6, 0.08), []);
      const pillowG = useMemo(() => new THREE.BoxGeometry(0.5, 0.08, 0.3), []);
      return (
        <group>
          <Part geo={frameG} pos={[0, 0.2, 0]} color={cDark} />
          <Part geo={mattressG} pos={[0, 0.37, 0]} color={cLight} />
          <Part geo={headG} pos={[0, 0.6, -0.96]} color={c} />
          <Part geo={pillowG} pos={[-0.3, 0.48, -0.7]} color={cLight} />
          <Part geo={pillowG} pos={[0.3, 0.48, -0.7]} color={cLight} />
        </group>
      );
    }

    case 'fence': {
      const postG = useMemo(() => new THREE.BoxGeometry(0.06, 0.8, 0.06), []);
      const railG = useMemo(() => new THREE.BoxGeometry(1, 0.06, 0.04), []);
      return (
        <group>
          <Part geo={postG} pos={[-0.45, 0.4, 0]} color={cDark} />
          <Part geo={postG} pos={[0, 0.4, 0]} color={cDark} />
          <Part geo={postG} pos={[0.45, 0.4, 0]} color={cDark} />
          <Part geo={railG} pos={[0, 0.6, 0]} color={c} />
          <Part geo={railG} pos={[0, 0.25, 0]} color={c} />
        </group>
      );
    }

    default:
      return null;
  }
}

const modelCache = new Map<string, THREE.Group>();

function createGLTFPlaceholder(gltfUrl: string): THREE.Group {
  if (modelCache.has(gltfUrl)) {
    return modelCache.get(gltfUrl)!.clone();
  }
  const group = new THREE.Group();
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: 0x4a90d9,
    transparent: true,
    opacity: 0.6,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = 0.5;
  group.add(mesh);

  const edges = new THREE.EdgesGeometry(geometry);
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x6ab0ff });
  const wireframe = new THREE.LineSegments(edges, lineMaterial);
  wireframe.position.y = 0.5;
  group.add(wireframe);

  modelCache.set(gltfUrl, group);
  return group.clone();
}

export function SceneObject3D({
  id,
  gltfUrl,
  primitiveType,
  color = '#4a90d9',
  renderOrder,
  position,
  rotation,
  scale,
  isSelected,
  visible,
  locked,
}: SceneObjectProps) {
  const meshRef = useRef<THREE.Group>(null);
  const transformRef = useRef<any>(null);
  const isDraggingRef = useRef(false);
  const transformMode = useSceneStore((s) => s.transformMode);

  useEffect(() => {
    if (!meshRef.current) return;
    meshRef.current.traverse((child) => {
      child.renderOrder = renderOrder;
    });
  }, [renderOrder]);

  useEffect(() => {
    const controls = transformRef.current;
    if (!controls) return;
    controls.setSpace(transformMode === 'scale' ? 'local' : 'world');
  }, [transformMode]);

  useEffect(() => {
    const controls = transformRef.current;
    if (!controls) return;

    const onDraggingChanged = (event: { value: boolean }) => {
      isDraggingRef.current = event.value;
      if (!event.value && meshRef.current) {
        const pos = meshRef.current.position;
        const rot = meshRef.current.rotation;
        const scl = meshRef.current.scale;
        useSceneStore.getState().updateTransform(id, {
          position: [pos.x, pos.y, pos.z],
          rotation: [rot.x, rot.y, rot.z],
          scale: [scl.x, scl.y, scl.z],
        });
      }
    };

    controls.addEventListener('dragging-changed', onDraggingChanged);
    return () => controls.removeEventListener('dragging-changed', onDraggingChanged);
  }, [id]);

  useEffect(() => {
    if (isDraggingRef.current || !meshRef.current) return;
    meshRef.current.position.set(position[0], position[1], position[2]);
    meshRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);
    meshRef.current.scale.set(scale[0], scale[1], scale[2]);
  }, [position[0], position[1], position[2], rotation[0], rotation[1], rotation[2], scale[0], scale[1], scale[2]]);

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      if (!locked) useSceneStore.getState().selectObject(id);
    },
    [id, locked]
  );

  if (!visible) return null;

  const showControls = isSelected && !locked;

  return (
    <TransformControls
      ref={transformRef}
      mode={transformMode}
      enabled={showControls}
      showX={showControls}
      showY={showControls}
      showZ={showControls}
    >
      <group
        ref={meshRef}
        position={position}
        rotation={rotation}
        scale={scale}
        onClick={handleClick}
      >
        {primitiveType ? (
          <PrimitiveMesh type={primitiveType} color={color} />
        ) : (
          <primitive object={createGLTFPlaceholder(gltfUrl)} />
        )}
      </group>
    </TransformControls>
  );
}
