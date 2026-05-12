import { useSceneStore } from '../../store/sceneStore';

export function StatusBar() {
  const { objects, selectedId, transformMode } = useSceneStore();
  const selectedObject = objects.find((o) => o.id === selectedId);

  const modeLabels = { translate: '移动', rotate: '旋转', scale: '缩放' };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '2px 12px',
        background: '#1e1e1e',
        borderTop: '1px solid #333',
        color: '#888',
        fontSize: 11,
        gap: 16,
      }}
    >
      <span>物体: {objects.length}</span>
      <span>选中: {selectedObject?.name ?? '无'}</span>
      <span>模式: {modeLabels[transformMode]}</span>
      <span style={{ marginLeft: 'auto' }}>3D 导演台 v1.0</span>
    </div>
  );
}
