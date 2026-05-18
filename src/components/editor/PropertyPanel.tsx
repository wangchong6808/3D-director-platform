import { useRef, useEffect } from 'react';
import { Leva, useControls, folder } from 'leva';
import { useSceneStore } from '../../store/sceneStore';
import type { SceneObject } from '../../types';

function ObjectControls({ object }: { object: SceneObject }) {
  const updateObject = useSceneStore(s => s.updateObject);
  const updateTransform = useSceneStore(s => s.updateTransform);
  const saveHistory = useSceneStore(s => s.saveHistory);
  const savingHistory = useRef(false);
  const batchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastObjectId = useRef<string | null>(null);
  const controlsReady = useRef(false);
  const readyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  if (lastObjectId.current !== object.id) {
    controlsReady.current = false;
    lastObjectId.current = object.id;
    clearTimeout(readyTimer.current);
    readyTimer.current = setTimeout(() => {
      controlsReady.current = true;
    }, 0);
  }

  useEffect(() => {
    return () => {
      clearTimeout(readyTimer.current);
    };
  }, []);

  function withHistory(fn: () => void) {
    if (!controlsReady.current) return;
    if (!savingHistory.current) {
      savingHistory.current = true;
      saveHistory();
    }
    fn();
    clearTimeout(batchTimer.current);
    batchTimer.current = setTimeout(() => {
      savingHistory.current = false;
    }, 300);
  }

  useControls(() => ({
    '基本信息': folder({
      name: {
        value: object.name,
        onChange: (v: string) => withHistory(() => updateObject(object.id, { name: v })),
      },
      kind: {
        value: object.kind,
        disabled: true,
      },
    }),
    '变换': folder({
      '位置 X': {
        value: object.position.x,
        min: -50, max: 50, step: 0.1,
        onChange: (v: number) => withHistory(() => updateTransform(object.id, { x: v })),
      },
      '位置 Y': {
        value: object.position.y,
        min: -50, max: 50, step: 0.1,
        onChange: (v: number) => withHistory(() => updateTransform(object.id, { y: v })),
      },
      '位置 Z': {
        value: object.position.z,
        min: -50, max: 50, step: 0.1,
        onChange: (v: number) => withHistory(() => updateTransform(object.id, { z: v })),
      },
      '旋转 X': {
        value: object.rotation.x,
        min: -Math.PI * 2, max: Math.PI * 2, step: 0.01,
        onChange: (v: number) => withHistory(() => updateTransform(object.id, undefined, { x: v })),
      },
      '旋转 Y': {
        value: object.rotation.y,
        min: -Math.PI * 2, max: Math.PI * 2, step: 0.01,
        onChange: (v: number) => withHistory(() => updateTransform(object.id, undefined, { y: v })),
      },
      '旋转 Z': {
        value: object.rotation.z,
        min: -Math.PI * 2, max: Math.PI * 2, step: 0.01,
        onChange: (v: number) => withHistory(() => updateTransform(object.id, undefined, { z: v })),
      },
      '缩放 X': {
        value: object.scale.x,
        min: 0.1, max: 10, step: 0.1,
        onChange: (v: number) => withHistory(() => updateTransform(object.id, undefined, undefined, { x: v })),
      },
      '缩放 Y': {
        value: object.scale.y,
        min: 0.1, max: 10, step: 0.1,
        onChange: (v: number) => withHistory(() => updateTransform(object.id, undefined, undefined, { y: v })),
      },
      '缩放 Z': {
        value: object.scale.z,
        min: 0.1, max: 10, step: 0.1,
        onChange: (v: number) => withHistory(() => updateTransform(object.id, undefined, undefined, { z: v })),
      },
    }),
    '外观': folder({
      color: {
        value: object.color,
        onChange: (v: string) => withHistory(() => updateObject(object.id, { color: v })),
      },
      visible: {
        value: object.visible,
        onChange: (v: boolean) => withHistory(() => updateObject(object.id, { visible: v })),
      },
      locked: {
        value: object.locked,
        onChange: (v: boolean) => withHistory(() => updateObject(object.id, { locked: v })),
      },
    }),
    '遮挡': folder({
      occlusionIndex: {
        value: object.occlusionIndex,
        disabled: true,
      },
    }),
  }), [object.id, object.name, object.position.x, object.position.y, object.position.z, object.rotation.x, object.rotation.y, object.rotation.z, object.scale.x, object.scale.y, object.scale.z, object.color, object.visible, object.locked, object.occlusionIndex]);

  return null;
}

export default function PropertyPanel() {
  const selectedId = useSceneStore(s => s.selectedId);
  const selectedObj = useSceneStore(s => s.objects.find(o => o.id === selectedId));

  return (
    <div style={{ height: '100%', overflow: 'auto', background: '#181818' }}>
      {selectedId && selectedObj ? (
        <>
          <Leva
            key={selectedObj.id}
            flat
            collapsed={false}
            theme={{
              colors: {
                elevation1: '#181818',
                elevation2: '#222222',
                elevation3: '#2a2a2a',
                accent1: '#1677ff',
                accent2: '#4096ff',
                accent3: '#69b1ff',
                highlight1: '#333',
                highlight2: '#444',
                highlight3: '#555',
                vivid1: '#ff4d4f',
              },
            }}
          />
          <ObjectControls object={selectedObj} />
        </>
      ) : (
        <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 13 }}>
          请在视口或场景树中选择物体
        </div>
      )}
    </div>
  );
}