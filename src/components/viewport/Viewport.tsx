import { useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import * as THREE from 'three';
import { useSceneStore } from '../../store/sceneStore';
import { SceneObject3D } from './SceneObject3D';

export function Viewport() {
  const { objects, selectedId, selectObject, showGrid } = useSceneStore();

  const handleCanvasClick = useCallback(
    (e: any) => {
      if (e.target === e.currentTarget) {
        selectObject(null);
      }
    },
    [selectObject]
  );

  return (
    <div style={{ width: '100%', height: '100%' }} onClick={handleCanvasClick}>
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50, near: 0.1, far: 1000 }}
        onPointerMissed={() => selectObject(null)}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />

        {showGrid && (
          <Grid
            args={[20, 20]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#6f6f6f"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#9d4b4b"
            fadeDistance={25}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid
          />
        )}

        {objects.map((obj) => (
          <SceneObject3D
            key={obj.id}
            id={obj.id}
            gltfUrl={obj.gltfUrl}
            primitiveType={obj.primitiveType}
            color={obj.color}
            renderOrder={obj.renderOrder}
            position={obj.transform.position}
            rotation={obj.transform.rotation}
            scale={obj.transform.scale}
            isSelected={selectedId === obj.id}
            visible={obj.visible}
            locked={obj.locked}
          />
        ))}

        <OrbitControls makeDefault />

        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport labelColor="white" axisHeadScale={1} />
        </GizmoHelper>
      </Canvas>
    </div>
  );
}
