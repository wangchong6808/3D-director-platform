import { useRef } from 'react';
import { Button, Space, Dropdown, Tooltip, Divider, ColorPicker, Typography } from 'antd';
import type { MenuProps } from 'antd';
import {
  ScanOutlined, ExpandOutlined, DragOutlined,
  UndoOutlined, RedoOutlined,
  SaveOutlined, FolderOpenOutlined, ImportOutlined, ExportOutlined,
  EyeOutlined, EyeInvisibleOutlined, PlusOutlined, AppstoreOutlined,
  CopyOutlined, SnippetsOutlined,
} from '@ant-design/icons';
import { useSceneStore } from '../../store/sceneStore';
import { demoScenes } from '../../utils/demoScenes';
import { serializeScene, deserializeScene, downloadFile } from '../../utils/sceneUtils';
import { logger } from '../../utils/logger';
import type { EditorTool, ObjectKind } from '../../types';

const TOOLS: { key: EditorTool; label: string; shortcut: string; icon: React.ReactNode }[] = [
  { key: 'translate', label: '移动', shortcut: 'W', icon: <DragOutlined /> },
  { key: 'rotate', label: '旋转', shortcut: 'E', icon: <ExpandOutlined /> },
  { key: 'scale', label: '缩放', shortcut: 'R', icon: <ScanOutlined /> },
];

const OBJECT_TYPES: { kind: ObjectKind; label: string; group: string }[] = [
  { kind: 'box', label: '方块', group: '几何体' },
  { kind: 'sphere', label: '球体', group: '几何体' },
  { kind: 'cylinder', label: '圆柱', group: '几何体' },
  { kind: 'cone', label: '圆锥', group: '几何体' },
  { kind: 'torus', label: '圆环', group: '几何体' },
  { kind: 'person', label: '人物', group: '常见物体' },
  { kind: 'house', label: '房子', group: '常见物体' },
  { kind: 'table', label: '桌子', group: '常见物体' },
  { kind: 'chair', label: '椅子', group: '常见物体' },
  { kind: 'cup', label: '杯子', group: '常见物体' },
  { kind: 'tree', label: '树木', group: '常见物体' },
  { kind: 'car', label: '汽车', group: '常见物体' },
  { kind: 'sofa', label: '沙发', group: '常见物体' },
  { kind: 'bed', label: '床', group: '常见物体' },
  { kind: 'fence', label: '栅栏', group: '常见物体' },
];

const { Text } = Typography;

export default function Toolbar() {
  const tool = useSceneStore(s => s.tool);
  const setTool = useSceneStore(s => s.setTool);
  const showGrid = useSceneStore(s => s.showGrid);
  const toggleGrid = useSceneStore(s => s.toggleGrid);
  const groundColor = useSceneStore(s => s.groundColor);
  const gridColor = useSceneStore(s => s.gridColor);
  const setGroundColor = useSceneStore(s => s.setGroundColor);
  const setGridColor = useSceneStore(s => s.setGridColor);
  const historyIndex = useSceneStore(s => s.historyIndex);
  const history = useSceneStore(s => s.history);
  const undo = useSceneStore(s => s.undo);
  const redo = useSceneStore(s => s.redo);
  const addObject = useSceneStore(s => s.addObject);
  const loadScene = useSceneStore(s => s.loadScene);
  const getSceneData = useSceneStore(s => s.getSceneData);
  const clearScene = useSceneStore(s => s.clearScene);
  const sceneName = useSceneStore(s => s.sceneName);
  const selectedId = useSceneStore(s => s.selectedId);
  const autoRotate = useSceneStore(s => s.autoRotate);
  const autoRotateSpeed = useSceneStore(s => s.autoRotateSpeed);
  const autoRotateDirection = useSceneStore(s => s.autoRotateDirection);
  const clipboard = useSceneStore(s => s.clipboard);
  const copyObject = useSceneStore(s => s.copyObject);
  const pasteObject = useSceneStore(s => s.pasteObject);
  const setAutoRotate = useSceneStore(s => s.setAutoRotate);
  const setAutoRotateSpeed = useSceneStore(s => s.setAutoRotateSpeed);
  const setAutoRotateDirection = useSceneStore(s => s.setAutoRotateDirection);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const gltfInputRef = useRef<HTMLInputElement>(null);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  function handleSave() {
    const data = getSceneData();
    const json = serializeScene(data);
    const blob = new Blob([json], { type: 'application/json' });
    downloadFile(blob, `${sceneName}.json`);
    logger.info('场景已保存');
  }

  function handleLoadJSON(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = deserializeScene(reader.result as string);
        loadScene(data);
        logger.info(`已加载场景: ${data.metadata.name}`);
      } catch {
        logger.error('加载失败：文件格式无效');
      }
    };
    reader.readAsText(file);
  }

  function handleImportGLTF(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer;
      addObject('box', { x: 0, y: 0, z: 0 }, buffer, file.name);
      logger.info(`已导入模型: ${file.name}`);
    };
    reader.readAsArrayBuffer(file);
  }

  const sceneMenuItems: MenuProps['items'] = Object.entries(demoScenes).map(([key, data]) => ({
    key,
    label: data.metadata.name,
    onClick: () => {
      clearScene();
      loadScene(data);
      logger.info(`已加载示例场景: ${data.metadata.name}`);
    },
  }));

  const geoItems: MenuProps['items'] = OBJECT_TYPES.filter(t => t.group === '几何体').map(t => ({
    key: t.kind,
    label: t.label,
    onClick: () => addObject(t.kind),
  }));

  const commonItems: MenuProps['items'] = OBJECT_TYPES.filter(t => t.group === '常见物体').map(t => ({
    key: t.kind,
    label: t.label,
    onClick: () => addObject(t.kind),
  }));

  const addMenuItems: MenuProps['items'] = [
    { key: 'geo', label: '基础几何体', children: geoItems, type: 'group' },
    { key: 'common', label: '常见物体', children: commonItems, type: 'group' },
  ];

  return (
    <div style={{
      height: 40,
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      background: '#1f1f1f',
      borderBottom: '1px solid #333',
      gap: 4,
      flexShrink: 0,
    }}>
      <Dropdown menu={{ items: addMenuItems }} trigger={['click']}>
        <Button type="text" icon={<PlusOutlined />} size="small">添加</Button>
      </Dropdown>

      <Divider type="vertical" />

      <Space.Compact size="small">
        {TOOLS.map(t => (
          <Tooltip key={t.key} title={`${t.label} (${t.shortcut})`}>
            <Button
              type={tool === t.key ? 'primary' : 'text'}
              icon={t.icon}
              onClick={() => setTool(t.key)}
            >
              {t.label}
            </Button>
          </Tooltip>
        ))}
      </Space.Compact>

      <Divider type="vertical" />

      <Tooltip title={autoRotate ? '停止旋转' : '自动旋转'}>
        <Button
          type={autoRotate ? 'primary' : 'text'}
          icon={autoRotate ? <span style={{ fontSize: 12 }}>⏸</span> : <span style={{ fontSize: 12 }}>▶</span>}
          size="small"
          onClick={() => setAutoRotate(!autoRotate)}
        />
      </Tooltip>
      {autoRotate && (
        <>
          <Space.Compact size="small">
            <Tooltip title="逆时针">
              <Button
                type={autoRotateDirection === 'ccw' ? 'primary' : 'text'}
                size="small"
                onClick={() => setAutoRotateDirection('ccw')}
                style={{ fontSize: 11, padding: '0 6px' }}
              >↺</Button>
            </Tooltip>
            <Tooltip title="顺时针">
              <Button
                type={autoRotateDirection === 'cw' ? 'primary' : 'text'}
                size="small"
                onClick={() => setAutoRotateDirection('cw')}
                style={{ fontSize: 11, padding: '0 6px' }}
              >↻</Button>
            </Tooltip>
          </Space.Compact>
          <Dropdown
            menu={{
              items: [
                { key: '0.5', label: '0.5×', onClick: () => setAutoRotateSpeed(0.5) },
                { key: '1', label: '1×', onClick: () => setAutoRotateSpeed(1) },
                { key: '2', label: '2×', onClick: () => setAutoRotateSpeed(2) },
                { key: '3', label: '3×', onClick: () => setAutoRotateSpeed(3) },
                { key: '5', label: '5×', onClick: () => setAutoRotateSpeed(5) },
              ],
              selectable: true,
              selectedKeys: [String(autoRotateSpeed)],
            }}
            trigger={['click']}
          >
            <Button type="text" size="small" style={{ fontSize: 11 }}>{autoRotateSpeed}×</Button>
          </Dropdown>
        </>
      )}

      <Divider type="vertical" />

      <Tooltip title="网格 (G)">
        <Button
          type={showGrid ? 'primary' : 'text'}
          icon={showGrid ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          size="small"
          onClick={toggleGrid}
        >网格</Button>
      </Tooltip>

      <Divider type="vertical" />

      <Space size={4}>
        <Text style={{ color: '#999', fontSize: 11 }}>地面</Text>
        <ColorPicker
          value={groundColor}
          onChange={(_, hex) => setGroundColor(hex)}
          size="small"
        />
        <Text style={{ color: '#999', fontSize: 11 }}>网格线</Text>
        <ColorPicker
          value={gridColor}
          onChange={(_, hex) => setGridColor(hex)}
          size="small"
        />
      </Space>

      <Divider type="vertical" />

      <Tooltip title="撤销 (Ctrl+Z)">
        <Button
          type="text"
          icon={<UndoOutlined />}
          size="small"
          disabled={!canUndo}
          onClick={undo}
        />
      </Tooltip>
      <Tooltip title="重做 (Ctrl+Shift+Z)">
        <Button
          type="text"
          icon={<RedoOutlined />}
          size="small"
          disabled={!canRedo}
          onClick={redo}
        />
      </Tooltip>

      <Divider type="vertical" />

      <Tooltip title="复制 (Ctrl+C)">
        <Button
          type="text"
          icon={<CopyOutlined />}
          size="small"
          disabled={!selectedId}
          onClick={() => selectedId && copyObject(selectedId)}
        />
      </Tooltip>
      <Tooltip title="粘贴 (Ctrl+V)">
        <Button
          type="text"
          icon={<SnippetsOutlined />}
          size="small"
          disabled={!clipboard}
          onClick={pasteObject}
        />
      </Tooltip>

      <Divider type="vertical" />

      <Dropdown menu={{ items: sceneMenuItems }} trigger={['click']}>
        <Button type="text" size="small" icon={<AppstoreOutlined />}>示例场景</Button>
      </Dropdown>

      <div style={{ flex: 1 }} />

      <input
        ref={gltfInputRef}
        type="file"
        accept=".gltf,.glb"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleImportGLTF(f); }}
      />
      <Tooltip title="导入模型">
        <Button type="text" icon={<ImportOutlined />} size="small" onClick={() => gltfInputRef.current?.click()}>导入</Button>
      </Tooltip>

      <input
        ref={jsonInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleLoadJSON(f); }}
      />
      <Tooltip title="加载场景 (JSON)">
        <Button type="text" icon={<FolderOpenOutlined />} size="small" onClick={() => jsonInputRef.current?.click()}>加载</Button>
      </Tooltip>

      <Tooltip title="保存场景 (Ctrl+S)">
        <Button type="text" icon={<SaveOutlined />} size="small" onClick={handleSave}>保存</Button>
      </Tooltip>

      <Tooltip title="导出 GLB">
        <Button type="text" icon={<ExportOutlined />} size="small" onClick={() => {
          import('../../utils/sceneUtils').then(({ exportToGLB, downloadFile }) => {
            exportToGLB(useSceneStore.getState().objects).then(buffer => {
              downloadFile(new Blob([buffer]), `${useSceneStore.getState().sceneName}.glb`);
              logger.info('GLB 已导出');
            });
          });
        }}>导出</Button>
      </Tooltip>
    </div>
  );
}