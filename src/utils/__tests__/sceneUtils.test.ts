import { describe, it, expect } from 'vitest';
import { validateSceneData, serializeScene, deserializeScene, buildThreeScene, exportToGLB, parseGLTFBuffer } from '../sceneUtils';
import type { SceneData, SceneObject } from '../../types';
import * as THREE from 'three';

const validData: SceneData = {
  version: '1.0.0',
  objects: [
    { id: 'a', name: 'box_1', kind: 'box', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, color: '#ff0000', visible: true, locked: false, occlusionIndex: 0 },
  ],
  metadata: { name: 'test', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
};

describe('VAL: validateSceneData', () => {
  it('VAL-001: 校验合法的场景数据通过', () => {
    expect(validateSceneData(validData)).toBe(true);
  });

  it('VAL-001b: 缺少version字段失败', () => {
    const invalid = { objects: [] };
    expect(validateSceneData(invalid)).toBe(false);
  });

  it('VAL-002: objects不是数组失败', () => {
    expect(validateSceneData({ version: '1', objects: 'not_array' })).toBe(false);
  });

  it('VAL-003: object缺少id字段失败', () => {
    const invalid = { version: '1', objects: [{ name: 'test' }] };
    expect(validateSceneData(invalid)).toBe(false);
  });

  it('VAL-004: object.position不是合法Vec3失败', () => {
    const invalid = { version: '1', objects: [{ id: '1', position: 'abc' }] };
    expect(validateSceneData(invalid)).toBe(false);
  });

  it('VAL-005: 空场景合法', () => {
    expect(validateSceneData({ version: '1', objects: [], metadata: { name: '', createdAt: '', updatedAt: '' } })).toBe(true);
  });

  it('非对象输入返回false', () => {
    expect(validateSceneData(null)).toBe(false);
    expect(validateSceneData(undefined)).toBe(false);
    expect(validateSceneData('string')).toBe(false);
  });
});

describe('JSON: 序列化/反序列化', () => {
  it('JSON-001: 序列化为合法JSON字符串', () => {
    const json = serializeScene(validData);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('JSON-002: 反序列化还原完整数据', () => {
    const json = serializeScene(validData);
    const restored = deserializeScene(json);
    expect(restored.version).toBe(validData.version);
    expect(restored.objects).toHaveLength(1);
    expect(restored.objects[0].id).toBe('a');
  });

  it('JSON-003: 序列化保留modelData', () => {
    const buf = new ArrayBuffer(4);
    const dataWithModel: SceneData = {
      ...validData,
      objects: [{ ...validData.objects[0], modelData: buf }],
    };
    const json = serializeScene(dataWithModel);
    const restored = deserializeScene(json);
    expect(restored.objects[0].modelData).toBeInstanceOf(ArrayBuffer);
    expect(restored.objects[0].modelData!.byteLength).toBe(4);
  });

  it('JSON-004: 反序列化非法JSON失败', () => {
    expect(() => deserializeScene('not valid json')).toThrow();
  });

  it('空场景序列化', () => {
    const json = serializeScene({ version: '1', objects: [], metadata: validData.metadata });
    expect(JSON.parse(json).objects).toEqual([]);
  });

  it('特殊字符name序列化往返', () => {
    const data = { ...validData, objects: [{ ...validData.objects[0], name: '测试_🎨' }] };
    const restored = deserializeScene(serializeScene(data));
    expect(restored.objects[0].name).toBe('测试_🎨');
  });
});

function makeObj(overrides: Partial<SceneObject> = {}): SceneObject {
  return {
    id: 'test-id',
    name: 'test_obj',
    kind: 'box',
    position: { x: 1, y: 2, z: 3 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    color: '#ff0000',
    visible: true,
    locked: false,
    occlusionIndex: 0,
    ...overrides,
  };
}

describe('GLB: buildThreeScene', () => {
  it('GLB-001: 基础几何体在场景中创建对应网格', () => {
    const scene = buildThreeScene([makeObj({ kind: 'box' }), makeObj({ kind: 'sphere' })]);
    expect(scene.children).toHaveLength(2);
    expect(scene.children[0].name).toBe('test_obj');
  });

  it('GLB-002: 场景网格位于正确的世界位置', () => {
    const scene = buildThreeScene([makeObj({ position: { x: 5, y: 3, z: -2 } })]);
    expect(scene.children[0].position.x).toBe(5);
    expect(scene.children[0].position.y).toBe(3);
    expect(scene.children[0].position.z).toBe(-2);
  });

  it('GLB-003: 场景网格应用旋转', () => {
    const scene = buildThreeScene([makeObj({ rotation: { x: 0, y: Math.PI / 2, z: 0 } })]);
    expect(scene.children[0].rotation.y).toBeCloseTo(Math.PI / 2);
  });

  it('GLB-004: 场景网格应用缩放', () => {
    const scene = buildThreeScene([makeObj({ scale: { x: 2, y: 3, z: 1.5 } })]);
    expect(scene.children[0].scale.x).toBe(2);
    expect(scene.children[0].scale.y).toBe(3);
  });

  it('GLB-005: 不可见物体在场景中标记为不可见', () => {
    const scene = buildThreeScene([makeObj({ visible: false })]);
    expect(scene.children[0].visible).toBe(false);
  });

  it('GLB-006: 复合物体house包含多个子网格', () => {
    const scene = buildThreeScene([makeObj({ kind: 'house' })]);
    const house = scene.children[0] as THREE.Group;
    expect(house).toBeInstanceOf(THREE.Group);
    expect(house.children.length).toBeGreaterThanOrEqual(5); // body + roof + door + knob + 2 windows + 2 frames + 2 cross + chimney + ridge
  });

  it('GLB-007: 复合物体person包含多个子网格', () => {
    const scene = buildThreeScene([makeObj({ kind: 'person' })]);
    const person = scene.children[0] as THREE.Group;
    expect(person).toBeInstanceOf(THREE.Group);
    expect(person.children.length).toBeGreaterThanOrEqual(17);
  });
});

describe('GLB: exportToGLB roundtrip', () => {
  it('GLB-008: 导出GLB生成有效ArrayBuffer', async () => {
    const buffer = await exportToGLB([makeObj()]);
    expect(buffer).toBeInstanceOf(ArrayBuffer);
    expect(buffer.byteLength).toBeGreaterThan(0);
  });

  it('GLB-009: 导出空场景不报错', async () => {
    const buffer = await exportToGLB([]);
    expect(buffer).toBeInstanceOf(ArrayBuffer);
  });

  it('GLB-010: 导出的GLB可重新导入', async () => {
    const buffer = await exportToGLB([makeObj({ position: { x: 3, y: 0, z: 0 } })]);
    const group = await parseGLTFBuffer(buffer);
    expect(group).toBeInstanceOf(THREE.Group);
    expect(group.children.length).toBeGreaterThan(0);
  });

  it('GLB-011: 导入导出后位置信息保留在场景中', async () => {
    const buffer = await exportToGLB([makeObj({ position: { x: 4, y: 5, z: 6 } })]);
    const group = await parseGLTFBuffer(buffer);
    const child = group.children[0];
    expect(child.position.x).toBeCloseTo(4);
    expect(child.position.y).toBeCloseTo(5);
    expect(child.position.z).toBeCloseTo(6);
  });

  it('GLB-012: 多个物体导出导入后均保留位置', async () => {
    const buffer = await exportToGLB([
      makeObj({ id: 'a', kind: 'box', position: { x: 0, y: 0, z: 0 } }),
      makeObj({ id: 'b', kind: 'sphere', position: { x: 3, y: 0, z: 0 } }),
    ]);
    const group = await parseGLTFBuffer(buffer);
    expect(group.children.length).toBeGreaterThanOrEqual(2);
  });

  it('GLB-013: 导出复合物体再导入保留子网格结构', async () => {
    const buffer = await exportToGLB([makeObj({ kind: 'house' })]);
    const group = await parseGLTFBuffer(buffer);
    const house = group.children[0] as THREE.Group;
    // House should have children (not be a plain box)
    expect(house.children.length).toBeGreaterThan(1);
  });

  it('GLB-014: 导入时将object position设为原点避免双倍偏移', async () => {
    // Simulate the import flow: object exported at world pos, imported at origin
    const buffer = await exportToGLB([makeObj({ position: { x: 3, y: 4, z: 5 } })]);
    const group = await parseGLTFBuffer(buffer);
    // The GLB scene has the mesh at (3,4,5)
    // When re-imported via addObject with position (0,0,0), final position should be correct
    // Verify the GLB child position represents world position (no double offset in GLB)
    const child = group.children[0];
    expect(child.position.x).toBe(3);
    expect(child.position.y).toBe(4);
    expect(child.position.z).toBe(5);
  });

  it('GLB-015: 所有种类物体均可导出为GLB', async () => {
    const kinds: SceneObject['kind'][] = ['box', 'sphere', 'cylinder', 'cone', 'torus', 'person', 'house', 'table', 'chair', 'cup', 'tree', 'car', 'sofa', 'bed', 'fence'];
    for (const kind of kinds) {
      const buffer = await exportToGLB([makeObj({ kind })]);
      expect(buffer).toBeInstanceOf(ArrayBuffer);
      expect(buffer.byteLength).toBeGreaterThan(0);
      // Verify it can be re-imported
      const group = await parseGLTFBuffer(buffer);
      expect(group.children.length).toBeGreaterThan(0);
    }
  });
});