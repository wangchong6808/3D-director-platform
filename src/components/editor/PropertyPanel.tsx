import { useRef, useCallback } from 'react';
import { InputNumber, Divider, ColorPicker, Button, Tooltip } from 'antd';
import { VerticalAlignTopOutlined, VerticalAlignBottomOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useSceneStore } from '../../store/sceneStore';
import { logger } from '../../utils/logger';

const M = 'PropertyPanel';

export function PropertyPanel() {
  const { objects, selectedId, updateTransform, updateColor, updateRenderOrder, bringToFront, sendToBack } = useSceneStore();
  const selectedObject = objects.find((o) => o.id === selectedId);
  const lastCommittedRef = useRef<string>('');

  const commitTransform = useCallback(() => {
    if (!selectedId) return;
    const obj = useSceneStore.getState().objects.find((o) => o.id === selectedId);
    if (!obj) return;
    const key = `${obj.transform.position}|${obj.transform.rotation}|${obj.transform.scale}`;
    if (key === lastCommittedRef.current) return;
    lastCommittedRef.current = key;
    logger.info(M, '提交变换到历史', {
      物体ID: selectedId,
      物体名称: obj.name,
      变换: obj.transform,
    });
    useSceneStore.getState().updateTransform(selectedId, {
      position: [...obj.transform.position],
      rotation: [...obj.transform.rotation],
      scale: [...obj.transform.scale],
    });
  }, [selectedId]);

  if (!selectedObject) {
    logger.debug(M, '无选中物体，显示占位提示');
    return (
      <div style={{ padding: 16, color: '#888', textAlign: 'center', background: '#1e1e1e', height: '100%' }}>
        选择一个物体以编辑属性
      </div>
    );
  }

  const { transform } = selectedObject;

  logger.debug(M, '渲染属性面板', {
    物体ID: selectedObject.id,
    物体名称: selectedObject.name,
    当前变换: transform,
    颜色: selectedObject.color,
    渲染层级: selectedObject.renderOrder,
    可见: selectedObject.visible,
    锁定: selectedObject.locked,
  });

  const handleTransformChange = (
    field: 'position' | 'rotation' | 'scale',
    axis: number,
    value: number | null
  ) => {
    const newValue = value ?? 0;
    const oldValues = transform[field];
    const newValues: [number, number, number] = [...oldValues];
    newValues[axis] = newValue;

    const axisLabel = ['X', 'Y', 'Z'][axis];
    logger.info(M, `修改${field === 'position' ? '位置' : field === 'rotation' ? '旋转' : '缩放'}`, {
      物体ID: selectedObject.id,
      物体名称: selectedObject.name,
      属性: field,
      轴: axisLabel,
      旧值: oldValues[axis],
      新值: newValue,
      完整旧值: { ...oldValues },
      完整新值: { ...newValues },
    });

    updateTransform(selectedObject.id, { [field]: newValues });
  };

  const handleColorChange = (_: any, hex: string) => {
    logger.info(M, '修改颜色', {
      物体ID: selectedObject.id,
      物体名称: selectedObject.name,
      旧颜色: selectedObject.color,
      新颜色: hex,
    });
    updateColor(selectedObject.id, hex);
  };

  const handleRenderOrderChange = (value: number | null) => {
    const newOrder = value ?? 0;
    logger.info(M, '修改渲染层级', {
      物体ID: selectedObject.id,
      物体名称: selectedObject.name,
      旧层级: selectedObject.renderOrder,
      新层级: newOrder,
    });
    updateRenderOrder(selectedObject.id, newOrder);
  };

  const createFieldGroup = (
    label: string,
    field: 'position' | 'rotation' | 'scale',
    values: [number, number, number],
    step = 0.1
  ) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ color: '#999', fontSize: 11, marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', gap: 4 }}>
        {(['X', 'Y', 'Z'] as const).map((axis, i) => (
          <div key={axis} style={{ flex: 1 }}>
            <div style={{ color: axis === 'X' ? '#ff4d4f' : axis === 'Y' ? '#52c41a' : '#1890ff', fontSize: 10, textAlign: 'center' }}>
              {axis}
            </div>
            <InputNumber
              size="small"
              value={parseFloat(values[i].toFixed(3))}
              step={step}
              onChange={(v) => handleTransformChange(field, i, v)}
              onBlur={commitTransform}
              onPressEnter={commitTransform}
              style={{ width: '100%' }}
              styles={{
                input: { color: '#ccc', background: '#2a2a2a' },
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ padding: 12, background: '#1e1e1e', height: '100%', overflow: 'auto' }}>
      <div style={{ color: '#ccc', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
        {selectedObject.name}
      </div>
      <Divider style={{ margin: '8px 0', borderColor: '#333' }} />

      {createFieldGroup('位置 (Position)', 'position', transform.position)}
      {createFieldGroup('旋转 (Rotation)', 'rotation', transform.rotation)}
      {createFieldGroup('缩放 (Scale)', 'scale', transform.scale)}

      <Divider style={{ margin: '8px 0', borderColor: '#333' }} />

      <div style={{ marginBottom: 8 }}>
        <div style={{ color: '#999', fontSize: 11, marginBottom: 4 }}>颜色 (Color)</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ColorPicker
            value={selectedObject.color ?? '#4a90d9'}
            onChange={handleColorChange}
            size="small"
          />
          <span style={{ color: '#ccc', fontSize: 11, fontFamily: 'monospace' }}>
            {selectedObject.color ?? '#4a90d9'}
          </span>
        </div>
      </div>

      <Divider style={{ margin: '8px 0', borderColor: '#333' }} />

      <div style={{ marginBottom: 8 }}>
        <div style={{ color: '#999', fontSize: 11, marginBottom: 4 }}>遮挡层级 (Render Order)</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <InputNumber
            size="small"
            value={selectedObject.renderOrder}
            step={1}
            onChange={handleRenderOrderChange}
            style={{ width: 70 }}
            styles={{ input: { color: '#ccc', background: '#2a2a2a' } }}
          />
          <span style={{ color: '#888', fontSize: 10 }}>数值越大越靠前</span>
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          <Tooltip title="置顶（渲染在最前面）">
            <Button
              size="small"
              icon={<VerticalAlignTopOutlined />}
              onClick={() => bringToFront(selectedObject.id)}
              style={{ flex: 1, color: '#ccc', background: '#2a2a2a', borderColor: '#444' }}
            >
              置顶
            </Button>
          </Tooltip>
          <Tooltip title="上移一层">
            <Button
              size="small"
              icon={<ArrowUpOutlined />}
              onClick={() => updateRenderOrder(selectedObject.id, selectedObject.renderOrder + 1)}
              style={{ flex: 1, color: '#ccc', background: '#2a2a2a', borderColor: '#444' }}
            >
              上移
            </Button>
          </Tooltip>
          <Tooltip title="下移一层">
            <Button
              size="small"
              icon={<ArrowDownOutlined />}
              onClick={() => updateRenderOrder(selectedObject.id, selectedObject.renderOrder - 1)}
              style={{ flex: 1, color: '#ccc', background: '#2a2a2a', borderColor: '#444' }}
            >
              下移
            </Button>
          </Tooltip>
          <Tooltip title="置底（渲染在最后面）">
            <Button
              size="small"
              icon={<VerticalAlignBottomOutlined />}
              onClick={() => sendToBack(selectedObject.id)}
              style={{ flex: 1, color: '#ccc', background: '#2a2a2a', borderColor: '#444' }}
            >
              置底
            </Button>
          </Tooltip>
        </div>
      </div>

      <Divider style={{ margin: '8px 0', borderColor: '#333' }} />

      <div style={{ color: '#666', fontSize: 11 }}>
        <div>模型: {selectedObject.gltfUrl.startsWith('blob:') ? '本地文件' : selectedObject.gltfUrl || '内置几何体'}</div>
        <div>可见: {selectedObject.visible ? '是' : '否'}</div>
        <div>锁定: {selectedObject.locked ? '是' : '否'}</div>
        <div>层级: {selectedObject.renderOrder}</div>
      </div>
    </div>
  );
}
