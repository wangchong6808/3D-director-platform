import type { EditorTool } from '../types';

export interface KeyAction {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  action: () => void;
  preventDefault?: boolean;
}

export function createKeyActions(
  getters: {
    getTool: () => EditorTool;
    getSelectedId: () => string | null;
    getShowGrid: () => boolean;
    getCanUndo: () => boolean;
    getCanRedo: () => boolean;
  },
  actions: {
    setTool: (tool: EditorTool) => void;
    toggleGrid: () => void;
    removeObject: (id: string) => void;
    undo: () => void;
    redo: () => void;
    save: () => void;
  }
): KeyAction[] {
  return [
    { key: 'w', action: () => actions.setTool('translate') },
    { key: 'e', action: () => actions.setTool('rotate') },
    { key: 'r', action: () => actions.setTool('scale') },
    { key: 'g', action: () => actions.toggleGrid() },
    {
      key: 'Delete',
      action: () => {
        const id = getters.getSelectedId();
        if (id) actions.removeObject(id);
      },
    },
    {
      key: 'z',
      ctrl: true,
      shift: false,
      action: () => actions.undo(),
    },
    {
      key: 'Z',
      ctrl: true,
      shift: true,
      action: () => actions.redo(),
    },
    {
      key: 's',
      ctrl: true,
      action: () => actions.save(),
      preventDefault: true,
    },
  ];
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
  if (target.isContentEditable) return true;
  return false;
}