import { useState, useMemo } from 'react';
import { Tree, Button, Input, Space, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { SearchOutlined, VerticalAlignTopOutlined, VerticalAlignBottomOutlined, UpOutlined, DownOutlined, DeleteOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useSceneStore } from '../../store/sceneStore';
import type { SceneObject } from '../../types';
import type { DataNode, EventDataNode } from 'antd/es/tree';

export default function SceneTree() {
  const objects = useSceneStore(s => s.objects);
  const selectedId = useSceneStore(s => s.selectedId);
  const selectObject = useSceneStore(s => s.selectObject);
  const updateObject = useSceneStore(s => s.updateObject);
  const removeObject = useSceneStore(s => s.removeObject);
  const bringToFront = useSceneStore(s => s.bringToFront);
  const bringForward = useSceneStore(s => s.bringForward);
  const sendBackward = useSceneStore(s => s.sendBackward);
  const sendToBack = useSceneStore(s => s.sendToBack);
  const saveHistory = useSceneStore(s => s.saveHistory);

  const [search, setSearch] = useState('');

  const sorted = useMemo(() => {
    return [...objects].sort((a, b) => a.occlusionIndex - b.occlusionIndex);
  }, [objects]);

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    return sorted.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));
  }, [sorted, search]);

  const treeData: DataNode[] = useMemo(() => {
    return filtered.map(o => ({
      key: o.id,
      title: o.name,
      icon: (
        <span style={{ fontSize: 12 }}>
          {o.locked ? '🔒' : '🔓'} {o.visible ? '👁' : '👁‍🗨'}
        </span>
      ),
    }));
  }, [filtered]);

  const [editingKey, setEditingKey] = useState<string | null>(null);

  function handleSelect(keys: React.Key[]) {
    if (keys.length > 0) {
      selectObject(keys[0] as string);
    } else {
      selectObject(null);
    }
  }

  function handleDoubleClick(_e: React.MouseEvent, node: EventDataNode<DataNode>) {
    setEditingKey(node.key as string);
    setTimeout(() => {
      const input = document.querySelector('.scene-tree-rename-input input') as HTMLInputElement;
      if (input) input.focus();
    }, 50);
  }

  function handleRename(key: string, value: string) {
    if (value.trim()) {
      saveHistory();
      updateObject(key, { name: value.trim() });
    }
    setEditingKey(null);
  }

  const hasSelected = selectedId != null;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#18181c' }}>
      <div style={{ padding: 8 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="搜索物体..."
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          allowClear
        />
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '0 4px' }}>
        {filtered.length === 0 ? (
          <div style={{ color: '#666', textAlign: 'center', padding: 24, fontSize: 13 }}>
            {search ? '无匹配结果' : '场景为空，添加物体开始编辑'}
          </div>
        ) : (
          <Tree
            treeData={treeData}
            selectedKeys={selectedId ? [selectedId] : []}
            onSelect={handleSelect}
            onDoubleClick={handleDoubleClick}
            blockNode
            style={{ background: 'transparent', color: '#ccc' }}
            titleRender={(node) => {
              const obj = objects.find(o => o.id === node.key);

              if (node.key === editingKey) {
                return (
                  <span className="scene-tree-rename-input">
                    <Input
                      size="small"
                      defaultValue={obj?.name}
                      onPressEnter={(e) => handleRename(node.key as string, (e.target as HTMLInputElement).value)}
                      onBlur={(e) => handleRename(node.key as string, e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Escape') setEditingKey(null); }}
                      style={{ width: '80%', height: 22 }}
                    />
                  </span>
                );
              }

              const menuItems: MenuProps['items'] = [
                {
                  key: 'toggle-visibility',
                  label: obj?.visible ? '隐藏' : '显示',
                  onClick: () => {
                    if (!obj) return;
                    selectObject(obj.id);
                    saveHistory();
                    updateObject(obj.id, { visible: !obj.visible });
                  },
                },
                {
                  key: 'delete',
                  label: '删除',
                  danger: true,
                  onClick: () => {
                    if (!obj) return;
                    removeObject(obj.id);
                  },
                },
              ];

              return (
                <Dropdown menu={{ items: menuItems }} trigger={['contextMenu']}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>{node.title as string}</span>
                    <span style={{ display: 'flex', gap: 0, flexShrink: 0 }}>
                      <Button
                        type="text"
                        size="small"
                        icon={obj?.visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!obj) return;
                          saveHistory();
                          updateObject(obj.id, { visible: !obj.visible });
                        }}
                        style={{ color: obj?.visible ? undefined : '#666', fontSize: 12, width: 22, height: 22, padding: 0 }}
                      />
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!obj) return;
                          removeObject(obj.id);
                        }}
                        style={{ fontSize: 12, width: 22, height: 22, padding: 0 }}
                      />
                    </span>
                  </div>
                </Dropdown>
              );
            }}
          />
        )}
      </div>
      <div style={{ padding: '4px 8px', borderTop: '1px solid #333', display: 'flex', gap: 2 }}>
        <Space.Compact size="small">
          <Button
            type="text"
            icon={<VerticalAlignTopOutlined />}
            disabled={!hasSelected}
            onClick={() => selectedId && bringToFront(selectedId)}
            title="置顶"
          />
          <Button
            type="text"
            icon={<UpOutlined />}
            disabled={!hasSelected}
            onClick={() => selectedId && bringForward(selectedId)}
            title="上移"
          />
          <Button
            type="text"
            icon={<DownOutlined />}
            disabled={!hasSelected}
            onClick={() => selectedId && sendBackward(selectedId)}
            title="下移"
          />
          <Button
            type="text"
            icon={<VerticalAlignBottomOutlined />}
            disabled={!hasSelected}
            onClick={() => selectedId && sendToBack(selectedId)}
            title="置底"
          />
        </Space.Compact>
        <div style={{ flex: 1 }} />
        <Button
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined />}
          disabled={!hasSelected}
          onClick={() => selectedId && removeObject(selectedId)}
        />
      </div>
    </div>
  );
}