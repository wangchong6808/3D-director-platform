import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useSceneStore } from '../../../store/sceneStore';
import { logger } from '../../../utils/logger';
import StatusBar from '../StatusBar';

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

describe('STAT: StatusBar', () => {
  beforeEach(() => {
    resetStore();
    logger.setLevel('debug');
  });

  it('STAT-001: 显示当前选中物体名称', () => {
    useSceneStore.setState({
      objects: [
        { id: 'a', name: 'box_1', kind: 'box', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, color: '#ff0000', visible: true, locked: false, occlusionIndex: 0 },
      ],
      selectedId: 'a',
    });
    render(<StatusBar />);
    expect(screen.getByText(/box_1/)).toBeTruthy();
  });

  it('STAT-002: 显示选中物体数量和总数', () => {
    useSceneStore.setState({
      objects: [
        { id: 'a', name: 'box_1', kind: 'box', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, color: '#ff0000', visible: true, locked: false, occlusionIndex: 0 },
        { id: 'b', name: 'sphere_1', kind: 'sphere', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, color: '#00ff00', visible: true, locked: false, occlusionIndex: 1 },
        { id: 'c', name: 'cylinder_1', kind: 'cylinder', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, color: '#0000ff', visible: true, locked: false, occlusionIndex: 2 },
      ],
      selectedId: 'b',
    });
    render(<StatusBar />);
    const el = screen.getByText(/2 \/ 3/);
    expect(el).toBeTruthy();
  });

  it('STAT-003: 未选中物体时显示总数', () => {
    useSceneStore.setState({
      objects: [
        { id: 'a', name: 'box_1', kind: 'box', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, color: '#ff0000', visible: true, locked: false, occlusionIndex: 0 },
        { id: 'b', name: 'sphere_1', kind: 'sphere', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, color: '#00ff00', visible: true, locked: false, occlusionIndex: 1 },
        { id: 'c', name: 'cylinder_1', kind: 'cylinder', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, color: '#0000ff', visible: true, locked: false, occlusionIndex: 2 },
      ],
      selectedId: null,
    });
    render(<StatusBar />);
    expect(screen.getByText(/3 物体/)).toBeTruthy();
  });

  it('STAT-004: 显示当前工具为移动模式', () => {
    useSceneStore.setState({ tool: 'translate' });
    render(<StatusBar />);
    expect(screen.getByText('移动')).toBeTruthy();
  });

  it('STAT-005: 显示当前工具为旋转模式', () => {
    useSceneStore.setState({ tool: 'rotate' });
    render(<StatusBar />);
    expect(screen.getByText('旋转')).toBeTruthy();
  });

  it('STAT-006: 显示当前工具为缩放模式', () => {
    useSceneStore.setState({ tool: 'scale' });
    render(<StatusBar />);
    expect(screen.getByText('缩放')).toBeTruthy();
  });

  it('STAT-007: 显示网格状态为开', () => {
    useSceneStore.setState({ showGrid: true });
    render(<StatusBar />);
    expect(screen.getByText(/网格: ON/)).toBeTruthy();
  });

  it('STAT-008: 显示网格状态为关', () => {
    useSceneStore.setState({ showGrid: false });
    render(<StatusBar />);
    expect(screen.getByText(/网格: OFF/)).toBeTruthy();
  });

  it('STAT-009: 显示最新操作日志', () => {
    logger.info('物体 box_1 已添加');
    render(<StatusBar />);
    expect(screen.getByText('物体 box_1 已添加')).toBeTruthy();
  });

  it('STAT-010: 日志消息自动更新为最新', () => {
    logger.info('物体 box_1 已添加');
    const { rerender } = render(<StatusBar />);
    expect(screen.getByText('物体 box_1 已添加')).toBeTruthy();
    logger.info('物体 sphere_1 已添加');
    rerender(<StatusBar />);
    expect(screen.getByText('物体 sphere_1 已添加')).toBeTruthy();
  });

  it('STAT-011: 空场景时状态栏正常显示', () => {
    expect(() => render(<StatusBar />)).not.toThrow();
    expect(screen.getByText(/0 物体/)).toBeTruthy();
    expect(screen.getByText('移动')).toBeTruthy();
    expect(screen.getByText(/网格: ON/)).toBeTruthy();
  });
});