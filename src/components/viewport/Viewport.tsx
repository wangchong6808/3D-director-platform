import { useRef, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, TransformControls, GizmoHelper, GizmoViewport } from '@react-three/drei';
import * as THREE from 'three';
import { useSceneStore } from '../../store/sceneStore';
import SceneObject3D from './SceneObject3D';

function SceneContent() {
  const objects = useSceneStore(s => s.objects);
  const selectedId = useSceneStore(s => s.selectedId);
  const tool = useSceneStore(s => s.tool);
  const showGrid = useSceneStore(s => s.showGrid);
  const selectObject = useSceneStore(s => s.selectObject);
  const updateTransform = useSceneStore(s => s.updateTransform);
  const saveHistory = useSceneStore(s => s.saveHistory);

  const selectedRef = useRef<THREE.Object3D>(null!);
  const objectRefs = useRef<Map<string, THREE.Group>>(new Map());
  const transformStarted = useRef(false);

  useEffect(() => {
    if (selectedId) {
      const ref = objectRefs.current.get(selectedId);
      if (ref) selectedRef.current = ref;
    }
  }, [selectedId, objects]);

  const handleTransformStart = useCallback(() => {
    if (!transformStarted.current) {
      transformStarted.current = true;
      saveHistory();
    }
  }, [saveHistory]);

  const handleTransformEnd = useCallback(() => {
    transformStarted.current = false;
  }, []);

  const handleTransform = useCallback(() => {
    const ref = selectedRef.current;
    if (!ref || !selectedId) return;
    const p = ref.position;
    const r = ref.rotation;
    const s = ref.scale;
    updateTransform(
      selectedId,
      { x: p.x, y: p.y, z: p.z },
      { x: r.x, y: r.y, z: r.z },
      { x: s.x, y: s.y, z: s.z }
    );
  }, [selectedId, updateTransform]);

  const selectedObj = objects.find(o => o.id === selectedId);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      {showGrid && <Grid infiniteGrid cellSize={1} cellThickness={0.5} sectionSize={5} sectionThickness={1} fadeDistance={50} />}
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport />
      </GizmoHelper>
      <OrbitControls enableDamping dampingFactor={0.1} makeDefault />
      {objects.map(obj => (
        <SceneObject3D
          key={obj.id}
          ref={(node) => {
            if (node) {
              objectRefs.current.set(obj.id, node);
              if (obj.id === selectedId) selectedRef.current = node;
            } else {
              objectRefs.current.delete(obj.id);
            }
          }}
          object={obj}
          isSelected={obj.id === selectedId}
          onClick={selectObject}
        />
      ))}
      {selectedId && selectedObj && !selectedObj.locked && (
        <TransformControls
          mode={tool}
          object={selectedRef}
          space={tool === 'scale' ? 'local' : 'world'}
          onMouseDown={handleTransformStart}
          onMouseUp={handleTransformEnd}
          onObjectChange={handleTransform}
        />
      )}
      <mesh
        onClick={() => selectObject(null)}
        position={[0, -0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}

export default function Viewport() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#1a1a2e' }}>
      <Canvas
        shadows
        camera={{ position: [8, 6, 8], fov: 50, near: 0.1, far: 1000 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}