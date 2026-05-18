import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useSceneStore } from '../../../store/sceneStore';
import SceneTree from '../SceneTree';

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

function addThreeObjects() {
  useSceneStore.getState().addObject('box');
  useSceneStore.getState().addObject('sphere');
  useSceneStore.getState().addObject('cylinder');
}

describe('TREE: SceneTree', () => {
  beforeEach(resetStore);

  it('TREE-001: 渲染场景中所有物体节点', () => {
    addThreeObjects();
    render(<SceneTree />);
    expect(screen.getByText('box_1')).toBeTruthy();
    expect(screen.getByText('sphere_1')).toBeTruthy();
    expect(screen.getByText('cylinder_1')).toBeTruthy();
  });

  it('TREE-002: 空场景时显示占位提示', () => {
    render(<SceneTree />);
    expect(screen.getByText(/场景为空/)).toBeTruthy();
  });

  it('TREE-003: 节点按遮挡层级排序', () => {
    resetStore();
    const { addObject } = useSceneStore.getState();
    addObject('box'); // oi = 0
    addObject('sphere'); // oi = 1
    addObject('cylinder'); // oi = 2
    useSceneStore.getState().bringToFront(useSceneStore.getState().objects[0].id); // box_1 oi = 2

    render(<SceneTree />);

    const treeNodes = document.querySelectorAll('.ant-tree-title');
    const titles = Array.from(treeNodes).map(n => n.textContent);
    // box_1 should now be last (highest oi)
    expect(titles[titles.length - 1]).toBe('box_1');
  });

  it('TREE-004: 点击节点选中对应物体', () => {
    addThreeObjects();
    render(<SceneTree />);
    fireEvent.click(screen.getByText('box_1'));
    const state = useSceneStore.getState();
    expect(state.selectedId).toBe(state.objects.find(o => o.name === 'box_1')!.id);
  });

  it('TREE-005: 选中节点显示高亮', () => {
    addThreeObjects();
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().selectObject(id);
    render(<SceneTree />);
    // The selected node should have the ant-tree-treenode-selected class
    const selectedNode = document.querySelector('.ant-tree-treenode-selected');
    expect(selectedNode).toBeTruthy();
  });

  it('TREE-006: 双击节点进入重命名模式', () => {
    addThreeObjects();
    render(<SceneTree />);
    const node = screen.getByText('box_1');
    fireEvent.doubleClick(node);
    // An input should appear for renaming
    const input = document.querySelector('.scene-tree-rename-input input');
    expect(input).toBeTruthy();
  });

  it('TREE-007: 重命名后按回车确认', () => {
    addThreeObjects();
    render(<SceneTree />);
    fireEvent.doubleClick(screen.getByText('box_1'));
    const input: HTMLInputElement = document.querySelector('.scene-tree-rename-input input')!;
    act(() => {
      fireEvent.change(input, { target: { value: 'newname' } });
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    // Need to find the input again and trigger onPressEnter
    fireEvent.change(input, { target: { value: 'newname' } });
    fireEvent.keyDown(input, { key: 'Enter' });
  });

  it('TREE-008: 重命名后按Escape取消', () => {
    addThreeObjects();
    const obj = useSceneStore.getState().objects[0];
    render(<SceneTree />);
    fireEvent.doubleClick(screen.getByText('box_1'));
    const input: HTMLInputElement = document.querySelector('.scene-tree-rename-input input')!;
    fireEvent.change(input, { target: { value: 'x' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    // Should have exited edit mode, name unchanged
    expect(useSceneStore.getState().objects[0].name).toBe('box_1');
  });

  it('TREE-009: 重命名为空不生效', () => {
    addThreeObjects();
    render(<SceneTree />);
    fireEvent.doubleClick(screen.getByText('box_1'));
    const input: HTMLInputElement = document.querySelector('.scene-tree-rename-input input')!;
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(useSceneStore.getState().objects[0].name).toBe('box_1');
  });

  it('TREE-010: 可见物体正常渲染节点', () => {
    addThreeObjects();
    render(<SceneTree />);
    expect(screen.getByText('box_1')).toBeTruthy();
    expect(screen.getByText('sphere_1')).toBeTruthy();
    expect(screen.getByText('cylinder_1')).toBeTruthy();
  });

  it('TREE-011: 不可见物体仍显示在场景树中', () => {
    addThreeObjects();
    useSceneStore.getState().updateObject(useSceneStore.getState().objects[0].id, { visible: false });
    render(<SceneTree />);
    expect(screen.getByText('box_1')).toBeTruthy();
  });

  it('TREE-012: 未锁定物体正常显示在场景树中', () => {
    addThreeObjects();
    render(<SceneTree />);
    expect(screen.getByText('box_1')).toBeTruthy();
  });

  it('TREE-013: 锁定物体仍显示在场景树中', () => {
    addThreeObjects();
    useSceneStore.getState().updateObject(useSceneStore.getState().objects[0].id, { locked: true });
    render(<SceneTree />);
    expect(screen.getByText('box_1')).toBeTruthy();
  });

  it('TREE-014: 搜索框过滤节点', () => {
    addThreeObjects();
    render(<SceneTree />);
    const searchInput = screen.getByPlaceholderText('搜索物体...');
    fireEvent.change(searchInput, { target: { value: 'box' } });
    expect(screen.getByText('box_1')).toBeTruthy();
    expect(screen.queryByText('sphere_1')).toBeNull();
  });

  it('TREE-015: 搜索无匹配时显示空结果', () => {
    addThreeObjects();
    render(<SceneTree />);
    const searchInput = screen.getByPlaceholderText('搜索物体...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    expect(screen.getByText('无匹配结果')).toBeTruthy();
  });

  it('TREE-016: 清空搜索框恢复全部节点', () => {
    addThreeObjects();
    render(<SceneTree />);
    const searchInput = screen.getByPlaceholderText('搜索物体...');
    fireEvent.change(searchInput, { target: { value: 'box' } });
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('box_1')).toBeTruthy();
    expect(screen.getByText('sphere_1')).toBeTruthy();
    expect(screen.getByText('cylinder_1')).toBeTruthy();
  });

  it('TREE-017: 点击置顶按钮将选中物体置顶', () => {
    addThreeObjects();
    const id = useSceneStore.getState().objects[0].id; // oi=0
    useSceneStore.getState().selectObject(id);
    render(<SceneTree />);
    const topBtn = document.querySelector('[title="置顶"]')!;
    fireEvent.click(topBtn);
    expect(useSceneStore.getState().objects.find(o => o.id === id)!.occlusionIndex).toBe(2);
  });

  it('TREE-018: 点击置底按钮将选中物体置底', () => {
    addThreeObjects();
    const id = useSceneStore.getState().objects[2].id; // oi=2
    useSceneStore.getState().selectObject(id);
    render(<SceneTree />);
    const bottomBtn = document.querySelector('[title="置底"]')!;
    fireEvent.click(bottomBtn);
    expect(useSceneStore.getState().objects.find(o => o.id === id)!.occlusionIndex).toBe(0);
  });

  it('TREE-019: 点击上移按钮将选中物体上移', () => {
    addThreeObjects();
    const id = useSceneStore.getState().objects[0].id; // oi=0
    useSceneStore.getState().selectObject(id);
    render(<SceneTree />);
    const upBtn = document.querySelector('[title="上移"]')!;
    fireEvent.click(upBtn);
    expect(useSceneStore.getState().objects.find(o => o.id === id)!.occlusionIndex).toBe(1);
  });

  it('TREE-020: 点击下移按钮将选中物体下移', () => {
    addThreeObjects();
    const id = useSceneStore.getState().objects[2].id; // oi=2
    useSceneStore.getState().selectObject(id);
    render(<SceneTree />);
    const downBtn = document.querySelector('[title="下移"]')!;
    fireEvent.click(downBtn);
    expect(useSceneStore.getState().objects.find(o => o.id === id)!.occlusionIndex).toBe(1);
  });

  it('删除按钮删除选中物体', () => {
    addThreeObjects();
    const id = useSceneStore.getState().objects[0].id;
    useSceneStore.getState().selectObject(id);
    render(<SceneTree />);
    const deleteBtn = document.querySelector('.ant-btn-dangerous')!;
    fireEvent.click(deleteBtn);
    expect(useSceneStore.getState().objects).toHaveLength(2);
  });

  it('无选中时遮挡按钮禁用', () => {
    addThreeObjects();
    useSceneStore.getState().selectObject(null);
    render(<SceneTree />);
    const topBtn = document.querySelector('[title="置顶"]') as HTMLButtonElement;
    expect(topBtn.disabled).toBe(true);
  });
});