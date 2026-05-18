import { useSceneStore } from '../../store/sceneStore';
import { getLastLogMessage } from '../../utils/logger';

const TOOL_LABELS: Record<string, string> = {
  translate: '移动',
  rotate: '旋转',
  scale: '缩放',
};

export default function StatusBar() {
  const selectedId = useSceneStore(s => s.selectedId);
  const objects = useSceneStore(s => s.objects);
  const tool = useSceneStore(s => s.tool);
  const showGrid = useSceneStore(s => s.showGrid);

  const selected = objects.find(o => o.id === selectedId);
  const selectedIndex = selected
    ? [...objects].sort((a, b) => a.occlusionIndex - b.occlusionIndex).findIndex(o => o.id === selectedId)
    : -1;
  const logMsg = getLastLogMessage();

  return (
    <div style={{
      height: 28,
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      fontSize: 12,
      background: '#1f1f1f',
      borderTop: '1px solid #333',
      color: '#999',
      gap: 16,
      flexShrink: 0,
    }}>
      <span>
        {selected
          ? `${selected.name} | ${selectedIndex + 1} / ${objects.length}`
          : `未选中 | ${objects.length} 物体`}
      </span>
      <span>|</span>
      <span>{TOOL_LABELS[tool] ?? tool}</span>
      <span>|</span>
      <span>网格: {showGrid ? 'ON' : 'OFF'}</span>
      <span style={{ flex: 1 }} />
      {logMsg && <span style={{ color: '#666' }}>{logMsg}</span>}
    </div>
  );
}