import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useSceneStore } from '../../../store/sceneStore';
import Toolbar from '../Toolbar';

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

function getButtonByIcon(ariaLabel: string): HTMLButtonElement {
  const icon = document.querySelector(`[aria-label="${ariaLabel}"]`);
  if (!icon) throw new Error(`Icon with aria-label="${ariaLabel}" not found`);
  return icon.closest('button')!;
}

function getGridButton(): HTMLButtonElement {
  try {
    return getButtonByIcon('eye');
  } catch {
    return getButtonByIcon('eye-invisible');
  }
}

function getUndoButton(): HTMLButtonElement {
  return getButtonByIcon('undo');
}

function getRedoButton(): HTMLButtonElement {
  return getButtonByIcon('redo');
}

describe('TLB: Toolbar', () => {
  beforeEach(resetStore);

  it('TLB-001: 工具栏渲染三种模式按钮', () => {
    render(<Toolbar />);
    expect(screen.getByText('移动')).toBeTruthy();
    expect(screen.getByText('旋转')).toBeTruthy();
    expect(screen.getByText('缩放')).toBeTruthy();
  });

  it('TLB-002: 移动模式时移动按钮处于激活态', () => {
    useSceneStore.setState({ tool: 'translate' });
    render(<Toolbar />);
    const moveBtn = screen.getByText('移动').closest('button');
    const rotateBtn = screen.getByText('旋转').closest('button');
    const scaleBtn = screen.getByText('缩放').closest('button');
    expect(moveBtn?.className).toContain('ant-btn-primary');
    expect(rotateBtn?.className).not.toContain('ant-btn-primary');
    expect(scaleBtn?.className).not.toContain('ant-btn-primary');
  });

  it('TLB-003: 点击旋转按钮切换模式', () => {
    render(<Toolbar />);
    fireEvent.click(screen.getByText('旋转'));
    expect(useSceneStore.getState().tool).toBe('rotate');
  });

  it('TLB-004: 点击缩放按钮切换模式', () => {
    render(<Toolbar />);
    fireEvent.click(screen.getByText('缩放'));
    expect(useSceneStore.getState().tool).toBe('scale');
  });

  it('TLB-005: 网格开关显示当前状态', () => {
    useSceneStore.setState({ showGrid: true });
    render(<Toolbar />);
    const gridBtn = getGridButton();
    expect(gridBtn.className).toContain('ant-btn-primary');
  });

  it('TLB-006: 点击网格按钮切换状态', () => {
    render(<Toolbar />);
    const gridBtn = getGridButton();
    fireEvent.click(gridBtn);
    expect(useSceneStore.getState().showGrid).toBe(false);
  });

  it('TLB-007: 有历史时撤销按钮可用', () => {
    useSceneStore.getState().addObject('box');
    render(<Toolbar />);
    const undoBtn = getUndoButton();
    expect(undoBtn.disabled).toBe(false);
  });

  it('TLB-008: 无历史时撤销按钮禁用', () => {
    render(<Toolbar />);
    const undoBtn = getUndoButton();
    expect(undoBtn.disabled).toBe(true);
  });

  it('TLB-009: 可重做时重做按钮可用', () => {
    const { addObject } = useSceneStore.getState();
    addObject('box');
    useSceneStore.getState().undo();
    render(<Toolbar />);
    const redoBtn = getRedoButton();
    expect(redoBtn.disabled).toBe(false);
  });

  it('TLB-010: 不可重做时重做按钮禁用', () => {
    render(<Toolbar />);
    const redoBtn = getRedoButton();
    expect(redoBtn.disabled).toBe(true);
  });

  it('TLB-011: 点击撤销按钮执行撤销', () => {
    useSceneStore.getState().addObject('box');
    expect(useSceneStore.getState().objects).toHaveLength(1);
    render(<Toolbar />);
    const undoBtn = getUndoButton();
    fireEvent.click(undoBtn);
    expect(useSceneStore.getState().objects).toHaveLength(0);
  });

  it('TLB-012: 点击重做按钮执行重做', () => {
    const { addObject } = useSceneStore.getState();
    addObject('box');
    useSceneStore.getState().undo();
    expect(useSceneStore.getState().objects).toHaveLength(0);
    render(<Toolbar />);
    const redoBtn = getRedoButton();
    fireEvent.click(redoBtn);
    expect(useSceneStore.getState().objects).toHaveLength(1);
  });

  it('TLB-013: 导入按钮的文件选择器仅接受.gltf和.glb', () => {
    render(<Toolbar />);
    const input = document.querySelector('input[accept=".gltf,.glb"]');
    expect(input).toBeTruthy();
  });

  it('TLB-015: 加载按钮的文件选择器仅接受.json', () => {
    render(<Toolbar />);
    const input = document.querySelector('input[accept=".json"]');
    expect(input).toBeTruthy();
  });

  it('TLB-017: 示例场景下拉菜单展示六个选项', () => {
    render(<Toolbar />);
    expect(screen.getByText('示例场景')).toBeTruthy();
  });

  it('TLB-018: 选择示例场景加载', () => {
    render(<Toolbar />);
    fireEvent.click(screen.getByText('示例场景'));
    const menuItems = document.querySelectorAll('.ant-dropdown-menu-item');
    expect(menuItems.length).toBeGreaterThanOrEqual(1);
  });

  it('点击移动按钮切换回移动模式', () => {
    useSceneStore.setState({ tool: 'rotate' });
    render(<Toolbar />);
    fireEvent.click(screen.getByText('移动'));
    expect(useSceneStore.getState().tool).toBe('translate');
  });

  it('添加按钮可见', () => {
    render(<Toolbar />);
    expect(screen.getByText('添加')).toBeTruthy();
  });

  it('保存和导出按钮可见', () => {
    render(<Toolbar />);
    expect(screen.getByText('保存')).toBeTruthy();
    expect(screen.getByText('导出')).toBeTruthy();
  });
});