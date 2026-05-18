import { describe, it, expect } from 'vitest';
import { validateSceneData, serializeScene, deserializeScene } from '../sceneUtils';
import type { SceneData } from '../../types';

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