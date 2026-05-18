import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the entire @react-three/fiber and @react-three/drei modules
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => {
    // Render children directly so we can test the SceneContent logic
    return React.createElement('div', { 'data-testid': 'canvas-mock' }, children);
  },
  useThree: () => ({ scene: {}, camera: {} }),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  Grid: ({ infiniteGrid }: { infiniteGrid?: boolean }) =>
    infiniteGrid ? React.createElement('div', { 'data-testid': 'grid' }) : null,
  TransformControls: ({ mode, object }: { mode: string; object: unknown }) =>
    React.createElement('div', { 'data-testid': `transform-${mode}` }),
  GizmoHelper: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'gizmo-helper' }, children),
  GizmoViewport: () => React.createElement('div', { 'data-testid': 'gizmo-viewport' }),
  useCursor: () => {},
  useGLTF: () => ({ scene: {} }),
}));

vi.mock('../SceneObject3D', () => ({
  default: React.forwardRef(({ object, isSelected }: { object: { id: string; name: string; kind: string }; isSelected: boolean }, _ref: React.Ref<unknown>) =>
    React.createElement('div', {
      'data-testid': `scene-object-${object.id}`,
      'data-kind': object.kind,
      'data-selected': isSelected,
    }),
  ),
}));

import React from 'react';
import { render } from '@testing-library/react';
import { useSceneStore } from '../../../store/sceneStore';
import Viewport from '../Viewport';

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

describe('VPT: Viewport', () => {
  beforeEach(resetStore);

  it('VPT-001: 视口中渲染Canvas元素', () => {
    const { container } = render(<Viewport />);
    const canvas = container.querySelector('[data-testid="canvas-mock"]');
    expect(canvas).toBeTruthy();
  });

  it('VPT-002: 视口中渲染的物体数量与场景数据一致', () => {
    useSceneStore.setState({
      objects: [
        { id: 'a', name: 'box_1', kind: 'box', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, color: '#ff0000', visible: true, locked: false, occlusionIndex: 0 },
        { id: 'b', name: 'sphere_1', kind: 'sphere', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, color: '#00ff00', visible: true, locked: false, occlusionIndex: 1 },
        { id: 'c', name: 'cylinder_1', kind: 'cylinder', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, color: '#0000ff', visible: true, locked: false, occlusionIndex: 2 },
      ],
    });

    const { container } = render(<Viewport />);
    expect(container.querySelector('[data-testid="scene-object-a"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="scene-object-b"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="scene-object-c"]')).toBeTruthy();
  });

  it('VPT-005: 网格显示状态下渲染网格', () => {
    useSceneStore.setState({ showGrid: true });
    const { container } = render(<Viewport />);
    expect(container.querySelector('[data-testid="grid"]')).toBeTruthy();
  });

  it('VPT-006: 网格隐藏状态下不渲染网格', () => {
    useSceneStore.setState({ showGrid: false });
    const { container } = render(<Viewport />);
    expect(container.querySelector('[data-testid="grid"]')).toBeNull();
  });

  it('VPT-010: 选中未锁定物体时显示TransformControls', () => {
    useSceneStore.setState({
      objects: [
        { id: 'a', name: 'box_1', kind: 'box', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, color: '#ff0000', visible: true, locked: false, occlusionIndex: 0 },
      ],
      selectedId: 'a',
      tool: 'translate',
    });
    const { container } = render(<Viewport />);
    expect(container.querySelector('[data-testid="transform-translate"]')).toBeTruthy();
  });

  it('VPT-009: 选中锁定物体时不显示TransformControls', () => {
    useSceneStore.setState({
      objects: [
        { id: 'a', name: 'box_1', kind: 'box', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, color: '#ff0000', visible: true, locked: true, occlusionIndex: 0 },
      ],
      selectedId: 'a',
    });
    const { container } = render(<Viewport />);
    expect(container.querySelector('[data-testid^="transform-"]')).toBeNull();
  });

  it('VPT-015: 视口右下角显示方位指示器', () => {
    const { container } = render(<Viewport />);
    expect(container.querySelector('[data-testid="gizmo-viewport"]')).toBeTruthy();
  });

  it('空场景不报错', () => {
    expect(() => render(<Viewport />)).not.toThrow();
  });
});