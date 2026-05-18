import { useRef, useEffect } from 'react';
import { LevaPanel, useControls, useCreateStore, folder } from 'leva';
import { InputNumber, Typography } from 'antd';
import { useSceneStore } from '../../store/sceneStore';
import type { SceneObject } from '../../types';

const { Text } = Typography;

function ScaleControls({ object }: { object: SceneObject }) {
  const updateTransform = useSceneStore(s => s.updateTransform);
  const saveHistory = useSceneStore(s => s.saveHistory);
  const savingHistory = useRef(false);
  const batchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isUpdating = useRef(false);
  const updateTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function withHistory(fn: () => void) {
    if (!isUpdating.current) {
      isUpdating.current = true;
      if (!savingHistory.current) {
        savingHistory.current = true;
        saveHistory();
      }
      fn();
      clearTimeout(updateTimer.current);
      updateTimer.current = setTimeout(() => {
        isUpdating.current = false;
      }, 50);
      clearTimeout(batchTimer.current);
      batchTimer.current = setTimeout(() => {
        savingHistory.current = false;
      }, 300);
    }
  }

  function handleUniformChange(v: number | null) {
    if (v == null) return;
    withHistory(() => updateTransform(object.id, undefined, undefined, { x: v, y: v, z: v }));
  }

  function handleAxisChange(axis: 'x' | 'y' | 'z', v: number | null) {
    if (v == null) return;
    withHistory(() => updateTransform(object.id, undefined, undefined, { [axis]: v }));
  }

  return (
    <div style={{ padding: '4px 12px 8px' }}>
      <div style={{ marginBottom: 8 }}>
        <Text style={{ color: '#ddd', fontSize: 12, display: 'block', marginBottom: 2 }}>整体缩放</Text>
        <InputNumber
          size="small"
          min={0.1}
          max={10}
          step={0.1}
          value={object.scale.x}
          onChange={handleUniformChange}
          style={{ width: '100%' }}
          stringMode={false}
        />
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {(['x', 'y', 'z'] as const).map(axis => (
          <div key={axis} style={{ flex: 1 }}>
            <Text style={{ color: '#999', fontSize: 11, display: 'block', marginBottom: 2 }}>{axis.toUpperCase()}</Text>
            <InputNumber
              size="small"
              min={0.1}
              max={10}
              step={0.1}
              value={object.scale[axis]}
              onChange={(v) => handleAxisChange(axis, v)}
              style={{ width: '100%' }}
              stringMode={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ObjectPropertyEditor({ object }: { object: SceneObject }) {
  const store = useCreateStore();
  return (
    <>
      <LevaPanel
        store={store}
        flat
        fill
        collapsed={false}
        theme={{
          colors: {
            elevation1: '#181818',
            elevation2: '#222222',
            elevation3: '#2a2a2a',
            accent1: '#1677ff',
            accent2: '#4096ff',
            accent3: '#69b1ff',
            highlight1: '#555',
            highlight2: '#777',
            highlight3: '#999',
            vivid1: '#ff4d4f',
            folderWidgetColor: '#aaa',
            folderTextColor: '#ddd',
          },
        }}
      />
      <ObjectControls object={object} store={store} />
    </>
  );
}

function ObjectControls({ object, store }: { object: SceneObject; store: ReturnType<typeof useCreateStore> }) {
  const updateObject = useSceneStore(s => s.updateObject);
  const updateTransform = useSceneStore(s => s.updateTransform);
  const saveHistory = useSceneStore(s => s.saveHistory);
  const savingHistory = useRef(false);
  const batchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isUpdating = useRef(true);
  const updateTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    isUpdating.current = true;
    const timer = setTimeout(() => {
      isUpdating.current = false;
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, [object.id]);

  function withHistory(fn: () => void) {
    if (isUpdating.current) return;
    isUpdating.current = true;
    if (!savingHistory.current) {
      savingHistory.current = true;
      saveHistory();
    }
    fn();
    clearTimeout(updateTimer.current);
    updateTimer.current = setTimeout(() => {
      isUpdating.current = false;
    }, 0);
    clearTimeout(batchTimer.current);
    batchTimer.current = setTimeout(() => {
      savingHistory.current = false;
    }, 300);
  }

  function withHistoryNoGuard(fn: () => void) {
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
        onChange: (v: string) => withHistoryNoGuard(() => updateObject(object.id, { name: v })),
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
    }),
    '外观': folder({
      color: {
        value: object.color,
        onChange: (v: string) => withHistoryNoGuard(() => updateObject(object.id, { color: v })),
      },
      visible: {
        value: object.visible,
        onChange: (v: boolean) => withHistoryNoGuard(() => updateObject(object.id, { visible: v })),
      },
      locked: {
        value: object.locked,
        onChange: (v: boolean) => withHistoryNoGuard(() => updateObject(object.id, { locked: v })),
      },
    }),
    '遮挡': folder({
      occlusionIndex: {
        value: object.occlusionIndex,
        disabled: true,
      },
    }),
  }), { store }, [object.id, object.name, object.position.x, object.position.y, object.position.z, object.rotation.x, object.rotation.y, object.rotation.z, object.color, object.visible, object.locked, object.occlusionIndex]);

  return null;
}

export default function PropertyPanel() {
  const selectedId = useSceneStore(s => s.selectedId);
  const selectedObj = useSceneStore(s => s.objects.find(o => o.id === selectedId));

  return (
    <div style={{ height: '100%', overflow: 'auto', background: '#181818' }}>
      {selectedId && selectedObj ? (
        <>
          <ObjectPropertyEditor key={selectedObj.id} object={selectedObj} />
          <div style={{
            borderTop: '1px solid #333',
            margin: '0 0 0 0',
            padding: '0 0 4px',
          }}>
            <div style={{
              padding: '6px 12px 2px',
              fontSize: 12,
              fontWeight: 500,
              color: '#ddd',
              background: '#222',
              borderBottom: '1px solid #333',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              userSelect: 'none',
            }}>
              <svg width="12" height="8" viewBox="0 0 9 5" xmlns="http://www.w3.org/2000/svg" style={{ fill: '#aaa' }}><path d="M3.8 4.4c.4.3 1 .3 1.4 0L8 1.7A1 1 0 007.4 0H1.6a1 1 0 00-.7 1.7l3 2.7z"></path></svg>
              缩放
            </div>
            <ScaleControls object={selectedObj} />
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 13 }}>
          请在视口或场景树中选择物体
        </div>
      )}
    </div>
  );
}