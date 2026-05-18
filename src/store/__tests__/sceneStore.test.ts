import { describe, it, expect, beforeEach } from 'vitest';
import { useSceneStore } from '../sceneStore';
import type { SceneObject, SceneData } from '../../types';

function resetStore() {
  useSceneStore.setState({
    objects: [],
    selectedId: null,
    tool: 'translate',
    showGrid: true,
    sceneName: 'untitled',
    history: [[]],
    historyIndex: 0,
  });
}

describe('SCN-ADD: addObject', () => {
  beforeEach(resetStore);

  it('SCN-ADD-001: 添加基础几何体到空场景', () => {
    const { addObject } = useSceneStore.getState();
    addObject('box');
    const { objects } = useSceneStore.getState();
    expect(objects).toHaveLength(1);
    expect(objects[0].kind).toBe('box');
    expect(objects[0].id).toBeTruthy();
    expect(objects[0].position).toEqual({ x: 0, y: 0, z: 0 });
    expect(objects[0].rotation).toEqual({ x: 0, y: 0, z: 0 });
    expect(objects[0].scale).toEqual({ x: 1, y: 1, z: 1 });
    expect(objects[0].visible).toBe(true);
    expect(objects[0].locked).toBe(false);
    expect(objects[0].color).toBeTruthy();
  });

  it('SCN-ADD-002: 添加物体到指定位置', () => {
    useSceneStore.getState().addObject('sphere', { x: 5, y: 2, z: -3 });
    const obj = useSceneStore.getState().objects[0];
    expect(obj.position.x).toBe(5);
    expect(obj.position.y).toBe(2);
    expect(obj.position.z).toBe(-3);
  });

  it('SCN-ADD-003: 添加物体后自动选中', () => {
    useSceneStore.getState().addObject('box');
    const { objects, selectedId } = useSceneStore.getState();
    expect(selectedId).toBe(objects[0].id);
  });

  it('SCN-ADD-004: 添加物体后记录历史', () => {
    useSceneStore.getState().addObject('box');
    const { history, historyIndex } = useSceneStore.getState();
    expect(history.length).toBeGreaterThanOrEqual(2);
    expect(historyIndex).toBe(history.length - 1);
  });

  it('SCN-ADD-005: 连续添加物体时遮挡层级自动递增', () => {
    const { addObject } = useSceneStore.getState();
    addObject('box');
    addObject('sphere');
    const { objects } = useSceneStore.getState();
    expect(objects[0].occlusionIndex).toBe(0);
    expect(objects[1].occlusionIndex).toBe(1);
  });

  it('SCN-ADD-006: 添加所有五种基础几何体', () => {
    const { addObject } = useSceneStore.getState();
    const kinds: Array<'box' | 'sphere' | 'cylinder' | 'cone' | 'torus'> = ['box', 'sphere', 'cylinder', 'cone', 'torus'];
    kinds.forEach(k => addObject(k));
    const { objects } = useSceneStore.getState();
    expect(objects).toHaveLength(5);
    expect(objects.map(o => o.kind).sort()).toEqual(kinds.sort());
  });

  it('SCN-ADD-007: 添加所有十种常见物体', () => {
    const { addObject } = useSceneStore.getState();
    const kinds = ['person', 'house', 'table', 'chair', 'cup', 'tree', 'car', 'sofa', 'bed', 'fence'] as const;
    kinds.forEach(k => addObject(k));
    const { objects } = useSceneStore.getState();
    expect(objects).toHaveLength(10);
  });

  it('SCN-ADD-008: 添加导入的GLTF模型物体', () => {
    const buffer = new ArrayBuffer(8);
    useSceneStore.getState().addObject('box', undefined, buffer, 'test.glb');
    const obj = useSceneStore.getState().objects[0];
    expect(obj.modelPath).toBe('test.glb');
    expect(obj.modelData).toBeDefined();
  });

  it('SCN-ADD-009: 添加物体时自动生成名称包含kind', () => {
    useSceneStore.getState().addObject('box');
    expect(useSceneStore.getState().objects[0].name).toContain('box');
  });

  it('SCN-ADD-010: 连续添加同类型物体时名称不重复', () => {
    const { addObject } = useSceneStore.getState();
    addObject('box');
    addObject('box');
    addObject('box');
    const names = useSceneStore.getState().objects.map(o => o.name);
    expect(new Set(names).size).toBe(3);
  });

  it('SCN-ADD-011: 连续添加同类型物体时名称递增', () => {
    const { addObject } = useSceneStore.getState();
    addObject('box');
    addObject('box');
    addObject('box');
    const names = useSceneStore.getState().objects.map(o => o.name);
    expect(names).toEqual(['box_1', 'box_2', 'box_3']);
  });

  it('SCN-ADD-012: 混合添加不同类型物体时各自独立计数', () => {
    const { addObject } = useSceneStore.getState();
    addObject('box');
    addObject('sphere');
    addObject('box');
    addObject('sphere');
    const names = useSceneStore.getState().objects.map(o => o.name);
    expect(names).toEqual(['box_1', 'sphere_1', 'box_2', 'sphere_2']);
  });

  it('SCN-ADD-013: 删除物体后继续计数使用最大编号', () => {
    const { addObject, removeObject } = useSceneStore.getState();
    addObject('box'); // box_1
    addObject('box'); // box_2
    addObject('box'); // box_3
    const obj2 = useSceneStore.getState().objects[1];
    removeObject(obj2.id); // remove box_2
    addObject('box'); // should be box_4 (max was 3)
    const names = useSceneStore.getState().objects.map(o => o.name);
    expect(names).toEqual(['box_1', 'box_3', 'box_4']);
  });

  it('SCN-ADD-014: 用户手动改名后不影响增量计数', () => {
    const { addObject, updateObject } = useSceneStore.getState();
    addObject('box'); // box_1
    const obj = useSceneStore.getState().objects[0];
    updateObject(obj.id, { name: '自定义名称' });
    addObject('box');
    const names = useSceneStore.getState().objects.map(o => o.name);
    expect(names).toEqual(['自定义名称', 'box_1']);
  });

  it('SCN-ADD-015: 所有种类物体名称唯一性', () => {
    const kinds = ['box', 'sphere', 'cylinder', 'cone', 'torus', 'person', 'house', 'table', 'chair', 'cup', 'tree', 'car', 'sofa', 'bed', 'fence'] as const;
    const { addObject } = useSceneStore.getState();
    for (const kind of kinds) {
      addObject(kind);
      addObject(kind);
    }
    const names = useSceneStore.getState().objects.map(o => o.name);
    // All names should be unique
    expect(new Set(names).size).toBe(names.length);
    // Each pair should be kind_1, kind_2
    for (let i = 0; i < kinds.length; i++) {
      expect(names[i * 2]).toBe(`${kinds[i]}_1`);
      expect(names[i * 2 + 1]).toBe(`${kinds[i]}_2`);
    }
  });
});

describe('SCN-DEL: removeObject', () => {
  beforeEach(() => {
    resetStore();
    const { addObject } = useSceneStore.getState();
    addObject('box');
    addObject('sphere');
  });

  it('SCN-DEL-001: 删除当前选中的物体', () => {
    const { objects, removeObject } = useSceneStore.getState();
    removeObject(objects[1].id);
    const state = useSceneStore.getState();
    expect(state.objects).toHaveLength(1);
    expect(state.selectedId).toBeNull();
  });

  it('SCN-DEL-002: 删除非选中物体不影响选中状态', () => {
    const { objects, selectObject, removeObject } = useSceneStore.getState();
    selectObject(objects[1].id);
    removeObject(objects[0].id);
    const state = useSceneStore.getState();
    expect(state.objects).toHaveLength(1);
    expect(state.selectedId).toBe(objects[1].id);
  });

  it('SCN-DEL-003: 删除物体后记录历史', () => {
    const state = useSceneStore.getState();
    const prevLen = state.history.length;
    state.removeObject(state.objects[0].id);
    expect(useSceneStore.getState().history.length).toBeGreaterThan(prevLen);
  });

  it('SCN-DEL-004: 删除物体后遮挡层级重新排列', () => {
    const { addObject, removeObject } = useSceneStore.getState();
    addObject('cylinder');
    // Now objects: box(0), sphere(1), cylinder(2)
    removeObject(useSceneStore.getState().objects[1].id); // remove sphere
    const objs = useSceneStore.getState().objects;
    expect(objs[0].occlusionIndex).toBe(0);
    expect(objs[1].occlusionIndex).toBe(1);
  });

  it('SCN-DEL-005: 删除不存在的物体不产生副作用', () => {
    const state = useSceneStore.getState();
    const count = state.objects.length;
    const prevHistoryLen = state.history.length;
    state.removeObject('nonexistent');
    expect(useSceneStore.getState().objects).toHaveLength(count);
    expect(useSceneStore.getState().history.length).toBe(prevHistoryLen);
  });
});

describe('SCN-SEL: selectObject', () => {
  beforeEach(() => {
    resetStore();
    useSceneStore.getState().addObject('box');
  });

  it('SCN-SEL-001: 选中存在的物体', () => {
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().selectObject(id);
    expect(useSceneStore.getState().selectedId).toBe(id);
  });

  it('SCN-SEL-002: 取消选中', () => {
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().selectObject(id);
    useSceneStore.getState().selectObject(null);
    expect(useSceneStore.getState().selectedId).toBeNull();
  });

  it('SCN-SEL-003: 选中锁定的物体仍然可以选中', () => {
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().updateObject(id, { locked: true });
    useSceneStore.getState().selectObject(id);
    expect(useSceneStore.getState().selectedId).toBe(id);
  });

  it('SCN-SEL-004: 选中不可见的物体仍然可以选中', () => {
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().updateObject(id, { visible: false });
    useSceneStore.getState().selectObject(id);
    expect(useSceneStore.getState().selectedId).toBe(id);
  });

  it('SCN-SEL-005: 选中不存在的id不改变当前选中', () => {
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().selectObject(id);
    useSceneStore.getState().selectObject('nonexistent');
    expect(useSceneStore.getState().selectedId).toBe(id);
  });
});

describe('SCN-UPD: updateObject', () => {
  beforeEach(() => {
    resetStore();
    useSceneStore.getState().addObject('box');
  });

  it('SCN-UPD-001: 更新物体名称', () => {
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().updateObject(id, { name: 'new_name' });
    expect(useSceneStore.getState().objects[0].name).toBe('new_name');
  });

  it('SCN-UPD-002: 更新颜色', () => {
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().updateObject(id, { color: '#00ff00' });
    expect(useSceneStore.getState().objects[0].color).toBe('#00ff00');
  });

  it('SCN-UPD-003: 设置不可见', () => {
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().updateObject(id, { visible: false });
    expect(useSceneStore.getState().objects[0].visible).toBe(false);
  });

  it('SCN-UPD-004: 设置锁定', () => {
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().updateObject(id, { locked: true });
    expect(useSceneStore.getState().objects[0].locked).toBe(true);
  });

  it('SCN-UPD-005: 批量更新多个属性', () => {
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().updateObject(id, { name: 'X', color: '#000000', visible: false });
    const obj = useSceneStore.getState().objects[0];
    expect(obj.name).toBe('X');
    expect(obj.color).toBe('#000000');
    expect(obj.visible).toBe(false);
  });

  it('SCN-UPD-006: 更新物体属性后记录历史', () => {
    const id = useSceneStore.getState().objects[0].id;
    const prevLen = useSceneStore.getState().history.length;
    useSceneStore.getState().saveHistory();
    useSceneStore.getState().updateObject(id, { name: 'new' });
    expect(useSceneStore.getState().history.length).toBeGreaterThan(prevLen);
  });
});

describe('SCN-TRF: updateTransform', () => {
  beforeEach(() => {
    resetStore();
    useSceneStore.getState().addObject('box');
  });

  it('SCN-TRF-001: 更新位置', () => {
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().updateTransform(id, { x: 10, y: 0, z: -5 });
    const pos = useSceneStore.getState().objects[0].position;
    expect(pos.x).toBe(10);
    expect(pos.y).toBe(0);
    expect(pos.z).toBe(-5);
  });

  it('SCN-TRF-002: 更新旋转', () => {
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().updateTransform(id, undefined, { x: 0, y: Math.PI, z: 0 });
    expect(useSceneStore.getState().objects[0].rotation.y).toBeCloseTo(Math.PI);
  });

  it('SCN-TRF-003: 更新缩放', () => {
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().updateTransform(id, undefined, undefined, { x: 2, y: 2, z: 2 });
    expect(useSceneStore.getState().objects[0].scale).toEqual({ x: 2, y: 2, z: 2 });
  });

  it('SCN-TRF-004: 仅更新X轴不影响YZ', () => {
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().updateTransform(id, { x: 99 });
    const pos = useSceneStore.getState().objects[0].position;
    expect(pos.x).toBe(99);
    expect(pos.y).toBe(0);
    expect(pos.z).toBe(0);
  });

  it('SCN-TRF-005: 变换操作后记录历史', () => {
    const id = useSceneStore.getState().objects[0].id;
    const prevLen = useSceneStore.getState().history.length;
    useSceneStore.getState().saveHistory();
    useSceneStore.getState().updateTransform(id, { x: 5 });
    expect(useSceneStore.getState().history.length).toBeGreaterThan(prevLen);
  });

  it('SCN-TRF-006: 整体缩放同时更新XYZ三个轴', () => {
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().updateTransform(id, undefined, undefined, { x: 3, y: 3, z: 3 });
    expect(useSceneStore.getState().objects[0].scale).toEqual({ x: 3, y: 3, z: 3 });
  });

  it('SCN-TRF-007: 单独缩放X轴不影响Y和Z', () => {
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().updateTransform(id, undefined, undefined, { x: 2, y: 2, z: 2 });
    useSceneStore.getState().updateTransform(id, undefined, undefined, { x: 5 });
    const scale = useSceneStore.getState().objects[0].scale;
    expect(scale.x).toBe(5);
    expect(scale.y).toBe(2);
    expect(scale.z).toBe(2);
  });

  it('SCN-TRF-008: 整体缩放覆盖之前的非均匀缩放', () => {
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().updateTransform(id, undefined, undefined, { x: 3, y: 1, z: 2 });
    useSceneStore.getState().updateTransform(id, undefined, undefined, { x: 4, y: 4, z: 4 });
    expect(useSceneStore.getState().objects[0].scale).toEqual({ x: 4, y: 4, z: 4 });
  });

  it('SCN-TRF-009: 缩放操作保留位置和旋转不变', () => {
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().updateTransform(id, { x: 10, y: 5, z: -3 }, { x: 0, y: Math.PI, z: 0 });
    useSceneStore.getState().updateTransform(id, undefined, undefined, { x: 2, y: 2, z: 2 });
    const obj = useSceneStore.getState().objects[0];
    expect(obj.position).toEqual({ x: 10, y: 5, z: -3 });
    expect(obj.rotation.y).toBeCloseTo(Math.PI);
    expect(obj.scale).toEqual({ x: 2, y: 2, z: 2 });
  });
});

describe('TOL: setTool / toggleGrid', () => {
  beforeEach(resetStore);

  it('TOL-001: 切换到移动模式', () => {
    useSceneStore.getState().setTool('translate');
    expect(useSceneStore.getState().tool).toBe('translate');
  });

  it('TOL-002: 切换到旋转模式', () => {
    useSceneStore.getState().setTool('rotate');
    expect(useSceneStore.getState().tool).toBe('rotate');
  });

  it('TOL-003: 切换到缩放模式', () => {
    useSceneStore.getState().setTool('scale');
    expect(useSceneStore.getState().tool).toBe('scale');
  });

  it('TOL-004: 切换网格为关', () => {
    useSceneStore.setState({ showGrid: true });
    useSceneStore.getState().toggleGrid();
    expect(useSceneStore.getState().showGrid).toBe(false);
  });

  it('TOL-005: 切换网格为开', () => {
    useSceneStore.setState({ showGrid: false });
    useSceneStore.getState().toggleGrid();
    expect(useSceneStore.getState().showGrid).toBe(true);
  });
});

describe('SCN-OCC: 遮挡层级', () => {
  beforeEach(() => {
    resetStore();
    const { addObject } = useSceneStore.getState();
    addObject('box');
    addObject('sphere');
    addObject('cylinder');
  });

  it('SCN-OCC-001: 置顶', () => {
    const obj = useSceneStore.getState().objects[0]; // oi=0
    useSceneStore.getState().bringToFront(obj.id);
    const objects = useSceneStore.getState().objects;
    expect(objects.find(o => o.id === obj.id)!.occlusionIndex).toBe(2);
  });

  it('SCN-OCC-002: 置底', () => {
    const obj = useSceneStore.getState().objects[2]; // oi=2
    useSceneStore.getState().sendToBack(obj.id);
    expect(useSceneStore.getState().objects.find(o => o.id === obj.id)!.occlusionIndex).toBe(0);
  });

  it('SCN-OCC-003: 上移', () => {
    const obj = useSceneStore.getState().objects[0]; // oi=0
    useSceneStore.getState().bringForward(obj.id);
    const objects = useSceneStore.getState().objects;
    expect(objects.find(o => o.id === obj.id)!.occlusionIndex).toBe(1);
  });

  it('SCN-OCC-004: 下移', () => {
    const obj = useSceneStore.getState().objects[1]; // oi=1
    useSceneStore.getState().sendBackward(obj.id);
    expect(useSceneStore.getState().objects.find(o => o.id === obj.id)!.occlusionIndex).toBe(0);
  });

  it('SCN-OCC-005: 已在顶部的物体再次置顶无变化', () => {
    const obj = useSceneStore.getState().objects[2]; // oi=2 (top)
    useSceneStore.getState().bringToFront(obj.id);
    expect(useSceneStore.getState().objects.find(o => o.id === obj.id)!.occlusionIndex).toBe(2);
  });

  it('SCN-OCC-006: 已在底部的物体再次置底无变化', () => {
    const obj = useSceneStore.getState().objects[0]; // oi=0 (bottom)
    useSceneStore.getState().sendToBack(obj.id);
    expect(useSceneStore.getState().objects.find(o => o.id === obj.id)!.occlusionIndex).toBe(0);
  });

  it('SCN-OCC-007: 遮挡操作后记录历史', () => {
    const obj = useSceneStore.getState().objects[0];
    const prevLen = useSceneStore.getState().history.length;
    useSceneStore.getState().bringToFront(obj.id);
    expect(useSceneStore.getState().history.length).toBeGreaterThan(prevLen);
  });
});

describe('UND: undo/redo', () => {
  beforeEach(resetStore);

  it('UND-001: 单步撤销恢复添加', () => {
    useSceneStore.getState().addObject('box');
    expect(useSceneStore.getState().objects).toHaveLength(1);
    useSceneStore.getState().undo();
    expect(useSceneStore.getState().objects).toHaveLength(0);
    expect(useSceneStore.getState().historyIndex).toBe(0);
  });

  it('UND-002: 撤销后可以重做', () => {
    useSceneStore.getState().addObject('box');
    useSceneStore.getState().undo();
    useSceneStore.getState().redo();
    expect(useSceneStore.getState().objects).toHaveLength(1);
  });

  it('UND-003: 连续多步撤销', () => {
    const { addObject } = useSceneStore.getState();
    addObject('box');
    addObject('sphere');
    addObject('cylinder');
    expect(useSceneStore.getState().objects).toHaveLength(3);
    useSceneStore.getState().undo();
    expect(useSceneStore.getState().objects).toHaveLength(2);
    useSceneStore.getState().undo();
    expect(useSceneStore.getState().objects).toHaveLength(1);
    useSceneStore.getState().undo();
    expect(useSceneStore.getState().objects).toHaveLength(0);
  });

  it('UND-004: 连续多步撤销后再连续重做', () => {
    const { addObject } = useSceneStore.getState();
    addObject('box');
    addObject('sphere');
    addObject('cylinder');
    useSceneStore.getState().undo();
    useSceneStore.getState().undo();
    useSceneStore.getState().redo();
    expect(useSceneStore.getState().objects).toHaveLength(2);
    useSceneStore.getState().redo();
    expect(useSceneStore.getState().objects).toHaveLength(3);
  });

  it('UND-005: 撤销后执行新操作截断重做分支', () => {
    const { addObject } = useSceneStore.getState();
    addObject('box');
    addObject('sphere');
    useSceneStore.getState().undo();
    // Now at 1 object (box)
    addObject('cylinder');
    const state = useSceneStore.getState();
    expect(state.objects).toHaveLength(2);
    // Redo should not be available
    expect(state.historyIndex).toBe(state.history.length - 1);
  });

  it('UND-006: 空历史时执行撤销不报错', () => {
    expect(() => useSceneStore.getState().undo()).not.toThrow();
  });

  it('UND-007: 无可重做记录时执行重做不报错', () => {
    useSceneStore.getState().addObject('box');
    expect(() => useSceneStore.getState().redo()).not.toThrow();
  });

  it('UND-008: 撤销变换操作恢复位置', () => {
    useSceneStore.getState().addObject('box');
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().saveHistory();
    useSceneStore.getState().updateTransform(id, { x: 10 });
    useSceneStore.getState().undo();
    expect(useSceneStore.getState().objects[0].position.x).toBe(0);
  });

  it('UND-009: 撤销属性修改', () => {
    useSceneStore.getState().addObject('box');
    const id = useSceneStore.getState().objects[0].id;
    const oldColor = useSceneStore.getState().objects[0].color;
    useSceneStore.getState().saveHistory();
    useSceneStore.getState().updateObject(id, { color: '#00ff00' });
    useSceneStore.getState().undo();
    expect(useSceneStore.getState().objects[0].color).toBe(oldColor);
  });

  it('UND-010: 撤销删除操作恢复被删物体', () => {
    useSceneStore.getState().addObject('box');
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().removeObject(id);
    useSceneStore.getState().undo();
    expect(useSceneStore.getState().objects).toHaveLength(1);
    expect(useSceneStore.getState().objects[0].id).toBe(id);
  });

  it('UND-011: 撤销遮挡操作', () => {
    const { addObject } = useSceneStore.getState();
    addObject('box');
    addObject('sphere');
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().bringToFront(id);
    useSceneStore.getState().undo();
    expect(useSceneStore.getState().objects[0].occlusionIndex).toBe(0);
    expect(useSceneStore.getState().objects[1].occlusionIndex).toBe(1);
  });

  it('UND-012: 50步上限', () => {
    const { addObject } = useSceneStore.getState();
    for (let i = 0; i < 51; i++) addObject('box');
    const { history } = useSceneStore.getState();
    expect(history.length).toBeLessThanOrEqual(51); // initial + 50
  });

  it('UND-013: 第51步后最多undo 50次', () => {
    const { addObject } = useSceneStore.getState();
    for (let i = 0; i < 51; i++) addObject('box');
    for (let i = 0; i < 50; i++) useSceneStore.getState().undo();
    expect(useSceneStore.getState().objects).toHaveLength(1);
    expect(useSceneStore.getState().historyIndex).toBe(0);
  });

  it('UND-014: 第51次undo不报错', () => {
    const { addObject } = useSceneStore.getState();
    for (let i = 0; i < 51; i++) addObject('box');
    for (let i = 0; i < 50; i++) useSceneStore.getState().undo();
    expect(() => useSceneStore.getState().undo()).not.toThrow();
  });

  it('UND-015: 历史栈中间undo后新操作截断', () => {
    const { addObject } = useSceneStore.getState();
    addObject('box');
    addObject('sphere');
    addObject('cylinder');
    useSceneStore.getState().undo(); // back to 2 objects
    useSceneStore.getState().undo(); // back to 1 object
    addObject('torus');
    const state = useSceneStore.getState();
    expect(state.objects).toHaveLength(2);
    expect(state.historyIndex).toBe(state.history.length - 1);
  });
});

describe('SER: 序列化', () => {
  beforeEach(resetStore);

  it('SER-001: getSceneData输出完整数据', () => {
    useSceneStore.getState().addObject('box');
    useSceneStore.getState().addObject('sphere');
    const data = useSceneStore.getState().getSceneData();
    expect(data.version).toBeTruthy();
    expect(data.objects).toHaveLength(2);
    expect(data.metadata.name).toBe('untitled');
    expect(data.metadata.createdAt).toBeTruthy();
    expect(data.metadata.updatedAt).toBeTruthy();
  });

  it('SER-002: loadScene恢复场景', () => {
    const testData: SceneData = {
      version: '1.0.0',
      objects: [
        { id: 't1', name: 'test_box', kind: 'box', position: { x: 1, y: 2, z: 3 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, color: '#ff0000', visible: true, locked: false, occlusionIndex: 0 },
        { id: 't2', name: 'test_sphere', kind: 'sphere', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, color: '#0000ff', visible: true, locked: false, occlusionIndex: 1 },
        { id: 't3', name: 'test_cyl', kind: 'cylinder', position: { x: -1, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, color: '#00ff00', visible: true, locked: false, occlusionIndex: 2 },
      ],
      metadata: { name: 'test', createdAt: '', updatedAt: '' },
    };
    useSceneStore.getState().loadScene(testData);
    expect(useSceneStore.getState().objects).toHaveLength(3);
    expect(useSceneStore.getState().selectedId).toBeNull();
  });

  it('SER-003: loadScene后历史清空', () => {
    useSceneStore.getState().addObject('box');
    const testData: SceneData = { version: '1.0.0', objects: [], metadata: { name: 'empty', createdAt: '', updatedAt: '' } };
    useSceneStore.getState().loadScene(testData);
    expect(useSceneStore.getState().historyIndex).toBe(0);
    expect(useSceneStore.getState().history.length).toBe(1);
  });

  it('SER-004: 序列化往返一致', () => {
    useSceneStore.getState().addObject('box');
    const data1 = useSceneStore.getState().getSceneData();
    useSceneStore.getState().loadScene(data1);
    const data2 = useSceneStore.getState().getSceneData();
    expect(data2.objects).toHaveLength(data1.objects.length);
    expect(data2.objects[0].kind).toBe(data1.objects[0].kind);
  });

  it('SER-005: clearScene清空全部', () => {
    useSceneStore.getState().addObject('box');
    useSceneStore.getState().clearScene();
    expect(useSceneStore.getState().objects).toHaveLength(0);
    expect(useSceneStore.getState().selectedId).toBeNull();
    expect(useSceneStore.getState().history.length).toBe(1);
  });

  it('SER-006: loadScene覆盖现有场景', () => {
    useSceneStore.getState().addObject('box');
    useSceneStore.getState().addObject('box');
    const testData: SceneData = {
      version: '1.0.0',
      objects: [
        { id: 'n1', name: 'a', kind: 'box', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, color: '#fff', visible: true, locked: false, occlusionIndex: 0 },
      ],
      metadata: { name: 'new', createdAt: '', updatedAt: '' },
    };
    useSceneStore.getState().loadScene(testData);
    expect(useSceneStore.getState().objects).toHaveLength(1);
  });
});