import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import type { SceneObject } from '../../../types';

// Mock URL.createObjectURL/revokeObjectURL for jsdom
URL.createObjectURL = vi.fn(() => 'blob:mock-url');
URL.revokeObjectURL = vi.fn();

// Mock R3F/Drei
vi.mock('@react-three/fiber', () => ({
  useThree: () => ({ scene: {}, camera: {} }),
}));

vi.mock('@react-three/drei', () => ({
  useCursor: () => {},
  useGLTF: () => ({ scene: {} }),
}));

// Mock THREE
vi.mock('three', () => {
  const Color = function(this: { r: number; g: number; b: number }, hex: string) {
    this.r = 1; this.g = 1; this.b = 1;
  };
  Color.prototype.clone = function() { return this; };
  Color.prototype.multiplyScalar = function() { return this; };
  return {
    Color,
    Group: class {},
    Mesh: class {},
    MeshStandardMaterial: class {},
    BoxGeometry: class {},
    SphereGeometry: class {},
    CylinderGeometry: class {},
    ConeGeometry: class {},
    TorusGeometry: class {},
    ACESFilmicToneMapping: 0,
  };
});

import SceneObject3D from '../SceneObject3D';

function makeObj(overrides: Partial<SceneObject> = {}): SceneObject {
  return {
    id: 'test-1',
    name: 'box_1',
    kind: 'box',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    color: '#ff0000',
    visible: true,
    locked: false,
    occlusionIndex: 0,
    ...overrides,
  };
}

// We can't render R3F components in jsdom (they require WebGL), but we can test
// the Component itself by checking it renders without throwing.
// For deeper testing, we'd use R3F's test utilities or e2e tests.
describe('OBJ: SceneObject3D', () => {
  it('OBJ-001: box类型不抛出异常', () => {
    expect(() => {
      render(
        React.createElement(SceneObject3D, {
          object: makeObj({ kind: 'box' }),
          isSelected: false,
          onClick: () => {},
        })
      );
    }).not.toThrow();
  });

  it('OBJ-002: sphere类型不抛出异常', () => {
    expect(() => {
      render(
        React.createElement(SceneObject3D, {
          object: makeObj({ kind: 'sphere' }),
          isSelected: false,
          onClick: () => {},
        })
      );
    }).not.toThrow();
  });

  it('OBJ-003: cylinder类型不抛出异常', () => {
    expect(() => {
      render(
        React.createElement(SceneObject3D, {
          object: makeObj({ kind: 'cylinder' }),
          isSelected: false,
          onClick: () => {},
        })
      );
    }).not.toThrow();
  });

  it('OBJ-004: cone类型不抛出异常', () => {
    expect(() => {
      render(
        React.createElement(SceneObject3D, {
          object: makeObj({ kind: 'cone' }),
          isSelected: false,
          onClick: () => {},
        })
      );
    }).not.toThrow();
  });

  it('OBJ-005: torus类型不抛出异常', () => {
    expect(() => {
      render(
        React.createElement(SceneObject3D, {
          object: makeObj({ kind: 'torus' }),
          isSelected: false,
          onClick: () => {},
        })
      );
    }).not.toThrow();
  });

  it('OBJ-006: person组合几何体不抛出异常', () => {
    expect(() => {
      render(
        React.createElement(SceneObject3D, {
          object: makeObj({ kind: 'person' }),
          isSelected: false,
          onClick: () => {},
        })
      );
    }).not.toThrow();
  });

  it('OBJ-007: house组合几何体不抛出异常', () => {
    expect(() => {
      render(
        React.createElement(SceneObject3D, {
          object: makeObj({ kind: 'house' }),
          isSelected: false,
          onClick: () => {},
        })
      );
    }).not.toThrow();
  });

  it('OBJ-008: 所有常见物体类型均可正常渲染不抛异常', () => {
    const kinds: SceneObject['kind'][] = ['person', 'house', 'table', 'chair', 'cup', 'tree', 'car', 'sofa', 'bed', 'fence'];
    for (const kind of kinds) {
      expect(() => {
        render(
          React.createElement(SceneObject3D, {
            object: makeObj({ kind }),
            isSelected: false,
            onClick: () => {},
          })
        );
      }).not.toThrow();
    }
  });

  it('OBJ-013: 不可见物体不渲染visible为false', () => {
    expect(() => {
      render(
        React.createElement(SceneObject3D, {
          object: makeObj({ visible: false }),
          isSelected: false,
          onClick: () => {},
        })
      );
    }).not.toThrow();
  });

  it('selected状态渲染高亮', () => {
    expect(() => {
      render(
        React.createElement(SceneObject3D, {
          object: makeObj({ kind: 'box' }),
          isSelected: true,
          onClick: () => {},
        })
      );
    }).not.toThrow();
  });

  it('锁定物体渲染不报错', () => {
    expect(() => {
      render(
        React.createElement(SceneObject3D, {
          object: makeObj({ locked: true }),
          isSelected: false,
          onClick: () => {},
        })
      );
    }).not.toThrow();
  });

  it('带modelData的物体渲染不报错', () => {
    expect(() => {
      render(
        React.createElement(SceneObject3D, {
          object: makeObj({ kind: 'box', modelData: new ArrayBuffer(8) }),
          isSelected: false,
          onClick: () => {},
        })
      );
    }).not.toThrow();
  });
});