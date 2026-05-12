import { Button, Space, Tooltip, Divider, Dropdown } from 'antd';
import {
  DragOutlined,
  RotateRightOutlined,
  ExpandOutlined,
  UndoOutlined,
  RedoOutlined,
  ImportOutlined,
  ExportOutlined,
  SaveOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  BorderOutlined,
  BorderlessTableOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { useSceneStore } from '../../store/sceneStore';
import { loadGLTFFromFile, generateId, downloadJSON, loadSceneFromFile } from '../../utils/sceneUtils';
import { logger } from '../../utils/logger';
import { DEMO_SCENES } from '../../utils/demoScenes';
import type { TransformMode, PrimitiveType } from '../../types';

const M = 'Toolbar';

interface PrimitiveItem {
  key: PrimitiveType;
  label: string;
  color: string;
  category: string;
}

const PRIMITIVE_ITEMS: PrimitiveItem[] = [
  { key: 'box', label: '方块', color: '#4a90d9', category: '基础几何体' },
  { key: 'sphere', label: '球体', color: '#52c41a', category: '基础几何体' },
  { key: 'cylinder', label: '圆柱', color: '#faad14', category: '基础几何体' },
  { key: 'cone', label: '圆锥', color: '#ff4d4f', category: '基础几何体' },
  { key: 'torus', label: '圆环', color: '#722ed1', category: '基础几何体' },
  { key: 'person', label: '人物', color: '#e8966d', category: '常见物体' },
  { key: 'house', label: '房子', color: '#d4a574', category: '常见物体' },
  { key: 'table', label: '桌子', color: '#8b6914', category: '常见物体' },
  { key: 'chair', label: '椅子', color: '#a0522d', category: '常见物体' },
  { key: 'cup', label: '杯子', color: '#87ceeb', category: '常见物体' },
  { key: 'tree', label: '树木', color: '#228b22', category: '常见物体' },
  { key: 'car', label: '汽车', color: '#dc143c', category: '常见物体' },
  { key: 'sofa', label: '沙发', color: '#6b8e23', category: '常见物体' },
  { key: 'bed', label: '床', color: '#daa520', category: '常见物体' },
  { key: 'fence', label: '栅栏', color: '#deb887', category: '常见物体' },
];

let primitiveCounter: Record<string, number> = {};

export function Toolbar() {
  const { transformMode, setTransformMode, addObject, undo, redo, exportScene, importScene, showGrid, toggleGrid } = useSceneStore();

  const handleAddPrimitive = (type: PrimitiveType) => {
    if (!primitiveCounter[type]) primitiveCounter[type] = 0;
    primitiveCounter[type]++;
    const item = PRIMITIVE_ITEMS.find((p) => p.key === type);
    const name = `${item?.label ?? type}_${primitiveCounter[type]}`;
    logger.info(M, '添加物体', { 类型: type, 名称: name, 颜色: item?.color });
    addObject({
      id: generateId(),
      name,
      gltfUrl: '',
      primitiveType: type,
      color: item?.color,
      renderOrder: 0,
      transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      visible: true,
      locked: false,
    });
  };

  const handleImportGLTF = async () => {
    try {
      const { url, name } = await loadGLTFFromFile();
      logger.info(M, '导入GLTF模型', { url, name });
      addObject({
        id: generateId(),
        name,
        gltfUrl: url,
        renderOrder: 0,
        transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
        visible: true,
        locked: false,
      });
    } catch {}
  };

  const handleSaveScene = () => {
    const data = exportScene();
    downloadJSON(data, `scene_${Date.now()}.json`);
  };

  const handleLoadScene = async () => {
    try {
      const data = await loadSceneFromFile();
      importScene(data);
    } catch {}
  };

  const handleExportGLTF = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const event = new CustomEvent('export-gltf');
    canvas.dispatchEvent(event);
  };

  const handleLoadDemoScene = (sceneKey: string) => {
    const scene = DEMO_SCENES.find((s) => s.key === sceneKey);
    if (!scene) return;
    const { objects, camera } = scene.create();
    logger.info(M, '加载示例场景', { 场景: scene.label, 物体数量: objects.length });
    useSceneStore.getState().importScene({
      version: '1.0.0',
      objects,
      camera: { position: camera.position, target: camera.target, zoom: camera.zoom },
    });
  };

  const modeButtons: { mode: TransformMode; icon: React.ReactNode; label: string; shortcut: string }[] = [
    { mode: 'translate', icon: <DragOutlined />, label: '移动', shortcut: 'W' },
    { mode: 'rotate', icon: <RotateRightOutlined />, label: '旋转', shortcut: 'E' },
    { mode: 'scale', icon: <ExpandOutlined />, label: '缩放', shortcut: 'R' },
  ];

  const categories = [...new Set(PRIMITIVE_ITEMS.map((p) => p.category))];
  const menuItems = categories.map((cat) => ({
    key: cat,
    type: 'group' as const,
    label: <span style={{ color: '#999', fontSize: 11 }}>{cat}</span>,
    children: PRIMITIVE_ITEMS.filter((p) => p.category === cat).map((item) => ({
      key: item.key,
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: item.color, display: 'inline-block' }} />
          {item.label}
        </span>
      ),
      onClick: () => handleAddPrimitive(item.key),
    })),
  }));

  const demoSceneMenuItems = DEMO_SCENES.map((scene) => ({
    key: scene.key,
    label: (
      <div>
        <div style={{ color: '#ccc', fontSize: 12 }}>{scene.label}</div>
        <div style={{ color: '#888', fontSize: 10 }}>{scene.description}</div>
      </div>
    ),
    onClick: () => handleLoadDemoScene(scene.key),
  }));

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '4px 12px',
        background: '#1e1e1e',
        borderBottom: '1px solid #333',
        gap: 4,
      }}
    >
      <Space size={2}>
        {modeButtons.map(({ mode, icon, label, shortcut }) => (
          <Tooltip key={mode} title={`${label} (${shortcut})`}>
            <Button
              type={transformMode === mode ? 'primary' : 'text'}
              icon={icon}
              size="small"
              onClick={() => setTransformMode(mode)}
              style={{ color: transformMode === mode ? undefined : '#ccc' }}
            />
          </Tooltip>
        ))}
      </Space>

      <Divider orientation="vertical" style={{ borderColor: '#444', margin: '0 8px' }} />

      <Space size={2}>
        <Tooltip title="撤销 (Ctrl+Z)">
          <Button type="text" icon={<UndoOutlined />} size="small" onClick={undo} style={{ color: '#ccc' }} />
        </Tooltip>
        <Tooltip title="重做 (Ctrl+Shift+Z)">
          <Button type="text" icon={<RedoOutlined />} size="small" onClick={redo} style={{ color: '#ccc' }} />
        </Tooltip>
        <Tooltip title={showGrid ? '隐藏网格 (G)' : '显示网格 (G)'}>
          <Button
            type={showGrid ? 'primary' : 'text'}
            icon={showGrid ? <BorderOutlined /> : <BorderlessTableOutlined />}
            size="small"
            onClick={toggleGrid}
            style={{ color: showGrid ? undefined : '#888' }}
          />
        </Tooltip>
      </Space>

      <Divider orientation="vertical" style={{ borderColor: '#444', margin: '0 8px' }} />

      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <Tooltip title="添加物体">
          <Button type="text" icon={<PlusOutlined />} size="small" style={{ color: '#52c41a' }} />
        </Tooltip>
      </Dropdown>

      <Divider orientation="vertical" style={{ borderColor: '#444', margin: '0 8px' }} />

      <Dropdown menu={{ items: demoSceneMenuItems }} trigger={['click']}>
        <Tooltip title="示例场景">
          <Button type="text" icon={<VideoCameraOutlined />} size="small" style={{ color: '#faad14' }} />
        </Tooltip>
      </Dropdown>

      <Divider orientation="vertical" style={{ borderColor: '#444', margin: '0 8px' }} />

      <Space size={2}>
        <Tooltip title="导入GLTF模型">
          <Button type="text" icon={<ImportOutlined />} size="small" onClick={handleImportGLTF} style={{ color: '#ccc' }} />
        </Tooltip>
        <Tooltip title="导出GLTF">
          <Button type="text" icon={<ExportOutlined />} size="small" onClick={handleExportGLTF} style={{ color: '#ccc' }} />
        </Tooltip>
      </Space>

      <Divider orientation="vertical" style={{ borderColor: '#444', margin: '0 8px' }} />

      <Space size={2}>
        <Tooltip title="保存场景 (Ctrl+S)">
          <Button type="text" icon={<SaveOutlined />} size="small" onClick={handleSaveScene} style={{ color: '#ccc' }} />
        </Tooltip>
        <Tooltip title="加载场景">
          <Button type="text" icon={<FolderOpenOutlined />} size="small" onClick={handleLoadScene} style={{ color: '#ccc' }} />
        </Tooltip>
      </Space>
    </div>
  );
}
