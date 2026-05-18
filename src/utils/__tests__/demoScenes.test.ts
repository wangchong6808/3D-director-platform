import { describe, it, expect } from 'vitest';
import { demoScenes } from '../demoScenes';

const SCENE_NAMES = ['office', 'living_room', 'street', 'bedroom', 'park', 'restaurant'];

describe('DEM: 示例场景', () => {
  it('DEM-001: 办公室场景包含必要物体', () => {
    const objs = demoScenes.office.objects;
    expect(objs.length).toBeGreaterThan(0);
    const kinds = objs.map(o => o.kind);
    expect(kinds).toContain('table');
    expect(kinds).toContain('chair');
    expect(kinds).toContain('cup');
    expect(kinds).toContain('person');
  });

  it('DEM-002: 客厅场景包含必要物体', () => {
    const kinds = demoScenes.living_room.objects.map(o => o.kind);
    expect(kinds).toContain('sofa');
    expect(kinds).toContain('table');
    expect(kinds).toContain('chair');
  });

  it('DEM-003: 街道场景包含必要物体', () => {
    const kinds = demoScenes.street.objects.map(o => o.kind);
    expect(kinds).toContain('house');
    expect(kinds).toContain('car');
    expect(kinds).toContain('tree');
    expect(kinds).toContain('fence');
    expect(kinds).toContain('person');
  });

  it('DEM-004: 卧室场景包含必要物体', () => {
    const kinds = demoScenes.bedroom.objects.map(o => o.kind);
    expect(kinds).toContain('bed');
    expect(kinds).toContain('chair');
    expect(kinds).toContain('table');
  });

  it('DEM-005: 公园场景包含必要物体', () => {
    const kinds = demoScenes.park.objects.map(o => o.kind);
    expect(kinds).toContain('tree');
    expect(kinds).toContain('fence');
    expect(kinds).toContain('person');
    expect(kinds).toContain('chair');
  });

  it('DEM-006: 餐厅场景包含必要物体', () => {
    const kinds = demoScenes.restaurant.objects.map(o => o.kind);
    expect(kinds).toContain('table');
    expect(kinds).toContain('chair');
    expect(kinds).toContain('cup');
    expect(kinds).toContain('person');
  });

  describe('DEM-007: 所有物体id唯一', () => {
    SCENE_NAMES.forEach(name => {
      it(`${name} 场景中id不重复`, () => {
        const ids = demoScenes[name].objects.map(o => o.id);
        expect(new Set(ids).size).toBe(ids.length);
      });
    });
  });

  describe('DEM-008: 所有物体字段完整', () => {
    SCENE_NAMES.forEach(name => {
      it(`${name} 场景中物体字段完整`, () => {
        for (const obj of demoScenes[name].objects) {
          expect(obj.id).toBeTruthy();
          expect(obj.name).toBeTruthy();
          expect(obj.kind).toBeTruthy();
          expect(obj.position).toBeDefined();
          expect(obj.rotation).toBeDefined();
          expect(obj.scale).toBeDefined();
          expect(obj.color).toBeTruthy();
          expect(typeof obj.visible).toBe('boolean');
          expect(typeof obj.locked).toBe('boolean');
          expect(typeof obj.occlusionIndex).toBe('number');
        }
      });
    });
  });

  describe('DEM-009~011: 数值合法性', () => {
    SCENE_NAMES.forEach(name => {
      it(`${name} 场景中所有数值合法`, () => {
        for (const obj of demoScenes[name].objects) {
          const { position, rotation, scale } = obj;
          for (const v of [position.x, position.y, position.z, rotation.x, rotation.y, rotation.z]) {
            expect(Number.isFinite(v)).toBe(true);
          }
          for (const v of [scale.x, scale.y, scale.z]) {
            expect(v).toBeGreaterThan(0);
          }
        }
      });
    });
  });

  describe('DEM-012: 颜色格式', () => {
    SCENE_NAMES.forEach(name => {
      it(`${name} 场景中颜色格式为合法hex`, () => {
        for (const obj of demoScenes[name].objects) {
          expect(obj.color).toMatch(/^#[0-9a-fA-F]{6}$/);
        }
      });
    });
  });

  describe('DEM-013: occlusionIndex连续从0开始', () => {
    SCENE_NAMES.forEach(name => {
      it(`${name} 场景中occlusionIndex连续`, () => {
        const ois = demoScenes[name].objects.map(o => o.occlusionIndex).sort((a, b) => a - b);
        ois.forEach((oi, i) => expect(oi).toBe(i));
      });
    });
  });

  describe('DEM-014: kind值合法', () => {
    const validKinds = ['box', 'sphere', 'cylinder', 'cone', 'torus', 'person', 'house', 'table', 'chair', 'cup', 'tree', 'car', 'sofa', 'bed', 'fence'];
    SCENE_NAMES.forEach(name => {
      it(`${name} 场景中kind值合法`, () => {
        for (const obj of demoScenes[name].objects) {
          expect(validKinds).toContain(obj.kind);
        }
      });
    });
  });
});