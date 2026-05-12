import { useState, useRef, useEffect } from 'react';
import { Tree, Button, Space, Input } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, LockOutlined, UnlockOutlined, DeleteOutlined } from '@ant-design/icons';
import type { TreeProps } from 'antd';
import { useSceneStore } from '../../store/sceneStore';
import { logger } from '../../utils/logger';

const M = 'SceneTree';

export function SceneTree() {
  const { objects, selectedId, selectObject, toggleVisibility, toggleLock, removeObject, updateObjectName } = useSceneStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleDoubleClick = (id: string) => {
    if (id === 'root') return;
    const obj = objects.find((o) => o.id === id);
    if (!obj) return;
    logger.info(M, '双击编辑名称', { 物体ID: id, 当前名称: obj.name });
    setEditingId(id);
    setEditingName(obj.name);
  };

  const handleConfirmName = () => {
    if (editingId) {
      const trimmed = editingName.trim();
      if (trimmed) {
        logger.info(M, '确认修改名称', { 物体ID: editingId, 新名称: trimmed });
        updateObjectName(editingId, trimmed);
      }
      setEditingId(null);
      setEditingName('');
    }
  };

  const handleCancelName = () => {
    logger.debug(M, '取消编辑名称', { 物体ID: editingId });
    setEditingId(null);
    setEditingName('');
  };

  const treeData: TreeProps['treeData'] = [
    {
      title: '场景根节点',
      key: 'root',
      children: objects.map((obj) => ({
        title:
          editingId === obj.id ? (
            <Input
              ref={inputRef}
              size="small"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onPressEnter={handleConfirmName}
              onBlur={handleConfirmName}
              onKeyDown={(e) => {
                if (e.key === 'Escape') handleCancelName();
                e.stopPropagation();
              }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: 120, height: 20, fontSize: 11 }}
            />
          ) : (
            <span
              style={{ color: obj.id === selectedId ? '#1890ff' : '#ccc', cursor: 'text' }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleDoubleClick(obj.id);
              }}
            >
              {obj.name}
            </span>
          ),
        key: obj.id,
      })),
    },
  ];

  const selectedObject = objects.find((o) => o.id === selectedId);

  logger.debug(M, '渲染场景树', {
    物体总数: objects.length,
    物体列表: objects.map((o) => ({ id: o.id, name: o.name, visible: o.visible, locked: o.locked })),
    选中物体ID: selectedId,
    选中物体名称: selectedObject?.name ?? null,
  });

  const handleSelect = (keys: React.Key[]) => {
    if (editingId) return;
    const key = keys[0] as string | undefined;
    if (key && key !== 'root') {
      const obj = objects.find((o) => o.id === key);
      logger.info(M, '选中物体', {
        物体ID: key,
        物体名称: obj?.name ?? '未知',
        物体变换: obj?.transform,
      });
      selectObject(key);
    } else {
      logger.info(M, '取消选中', { 原因: key === 'root' ? '点击了根节点' : '点击空白区域' });
      selectObject(null);
    }
  };

  const handleToggleVisibility = (id: string) => {
    const obj = objects.find((o) => o.id === id);
    const newVisible = !obj?.visible;
    logger.info(M, '切换可见性', {
      物体ID: id,
      物体名称: obj?.name ?? '未知',
      当前可见: obj?.visible,
      切换后可见: newVisible,
    });
    toggleVisibility(id);
  };

  const handleToggleLock = (id: string) => {
    const obj = objects.find((o) => o.id === id);
    const newLocked = !obj?.locked;
    logger.info(M, '切换锁定状态', {
      物体ID: id,
      物体名称: obj?.name ?? '未知',
      当前锁定: obj?.locked,
      切换后锁定: newLocked,
    });
    toggleLock(id);
  };

  const handleRemove = (id: string) => {
    const obj = objects.find((o) => o.id === id);
    logger.warn(M, '删除物体', {
      物体ID: id,
      物体名称: obj?.name ?? '未知',
      物体变换: obj?.transform,
      剩余物体数: objects.length - 1,
    });
    removeObject(id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1e1e1e' }}>
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #333',
          color: '#ccc',
          fontSize: 12,
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>场景树</span>
        {selectedObject && (
          <Space size={4}>
            <Button
              type="text"
              size="small"
              icon={selectedObject.visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              onClick={() => handleToggleVisibility(selectedObject.id)}
              style={{ color: '#ccc', fontSize: 12 }}
            />
            <Button
              type="text"
              size="small"
              icon={selectedObject.locked ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => handleToggleLock(selectedObject.id)}
              style={{ color: '#ccc', fontSize: 12 }}
            />
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleRemove(selectedObject.id)}
              style={{ color: '#ff4d4f', fontSize: 12 }}
            />
          </Space>
        )}
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '4px 8px' }}>
        <Tree
          treeData={treeData}
          selectedKeys={selectedId ? [selectedId] : []}
          onSelect={handleSelect}
          style={{ background: 'transparent', color: '#ccc', fontSize: 12 }}
          defaultExpandAll
        />
      </div>
    </div>
  );
}
