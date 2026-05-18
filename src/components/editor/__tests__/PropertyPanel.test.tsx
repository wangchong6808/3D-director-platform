import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useSceneStore } from '../../../store/sceneStore';
import PropertyPanel from '../PropertyPanel';

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

function addObject() {
  useSceneStore.getState().addObject('box');
}

describe('PROP: PropertyPanel', () => {
  beforeEach(resetStore);

  it('PROP-001: 未选中物体时显示占位提示', () => {
    render(<PropertyPanel />);
    expect(screen.getByText('请在视口或场景树中选择物体')).toBeTruthy();
  });

  it('PROP-002: 选中物体后显示Leva面板', () => {
    addObject();
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().selectObject(id);
    render(<PropertyPanel />);
    // Placeholder is not in DOM when object selected
    expect(screen.queryByText('请在视口或场景树中选择物体')).toBeNull();
  });

  it('PROP-014: 删除选中物体后面板回到占位状态', () => {
    addObject();
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().selectObject(id);
    const { rerender } = render(<PropertyPanel />);
    expect(screen.queryByText('请在视口或场景树中选择物体')).toBeNull();
    useSceneStore.getState().removeObject(id);
    rerender(<PropertyPanel />);
    expect(screen.getByText('请在视口或场景树中选择物体')).toBeTruthy();
  });

  it('PROP-017: 锁定物体时属性面板仍可查看', () => {
    addObject();
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().updateObject(id, { locked: true });
    useSceneStore.getState().selectObject(id);
    expect(() => render(<PropertyPanel />)).not.toThrow();
  });

  it('选中物体后重新选择另一个物体面板更新', () => {
    useSceneStore.getState().addObject('box');
    useSceneStore.getState().addObject('sphere');
    const boxId = useSceneStore.getState().objects[0].id;
    const sphereId = useSceneStore.getState().objects[1].id;
    useSceneStore.getState().selectObject(boxId);
    const { rerender } = render(<PropertyPanel />);
    expect(screen.queryByText('请在视口或场景树中选择物体')).toBeNull();
    useSceneStore.getState().selectObject(sphereId);
    rerender(<PropertyPanel />);
    expect(screen.queryByText('请在视口或场景树中选择物体')).toBeNull();
  });

  it('空场景渲染不报错', () => {
    expect(() => render(<PropertyPanel />)).not.toThrow();
  });

  it('PROP-018: 选中物体后变换面板包含整体缩放和分轴缩放', () => {
    addObject();
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().selectObject(id);
    render(<PropertyPanel />);
    expect(screen.queryByText('请在视口或场景树中选择物体')).toBeNull();
    expect(screen.getByText('整体缩放')).toBeTruthy();
    expect(screen.getByText('X')).toBeTruthy();
    expect(screen.getByText('Y')).toBeTruthy();
    expect(screen.getByText('Z')).toBeTruthy();
  });

  it('PROP-019: 选中物体后显示落回地面按钮', () => {
    addObject();
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().selectObject(id);
    render(<PropertyPanel />);
    expect(screen.getByText('落回地面')).toBeTruthy();
  });

  it('PROP-020: 未选中物体时不显示落回地面按钮', () => {
    render(<PropertyPanel />);
    expect(screen.queryByText('落回地面')).toBeNull();
  });

  it('PROP-021: 锁定物体时落回地面按钮禁用', () => {
    addObject();
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().updateObject(id, { locked: true });
    useSceneStore.getState().selectObject(id);
    render(<PropertyPanel />);
    const btn = screen.getByText('落回地面').closest('button');
    expect(btn?.disabled).toBe(true);
  });

  it('PROP-022: 点击落回地面将box物体Y轴移至地面', () => {
    addObject();
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().updateTransform(id, { y: 5 });
    useSceneStore.getState().selectObject(id);
    render(<PropertyPanel />);
    fireEvent.click(screen.getByText('落回地面'));
    const obj = useSceneStore.getState().objects[0];
    expect(obj.position.y).toBe(0.5); // box half-height = 0.5 * scale 1
  });

  it('PROP-023: 点击落回地面记录历史', () => {
    addObject();
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().updateTransform(id, { y: 5 });
    useSceneStore.getState().selectObject(id);
    const historyLen = useSceneStore.getState().history.length;
    render(<PropertyPanel />);
    fireEvent.click(screen.getByText('落回地面'));
    expect(useSceneStore.getState().history.length).toBeGreaterThan(historyLen);
  });
});