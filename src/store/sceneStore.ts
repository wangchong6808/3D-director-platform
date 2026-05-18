import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { SceneObject, SceneData, HistoryEntry, EditorTool, ObjectKind, Vec3 } from '../types';

const MAX_HISTORY = 50;
const DEFAULT_COLOR = '#1677ff';

function cloneObjects(objects: SceneObject[]): SceneObject[] {
  return objects.map(o => ({
    ...o,
    position: { ...o.position },
    rotation: { ...o.rotation },
    scale: { ...o.scale },
  }));
}

function nextName(objects: SceneObject[], kind: string): string {
  let maxNum = 0;
  const prefix = `${kind}_`;
  for (const o of objects) {
    if (o.name.startsWith(prefix)) {
      const num = parseInt(o.name.slice(prefix.length), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  }
  return `${prefix}${maxNum + 1}`;
}

interface SceneStore {
  objects: SceneObject[];
  selectedId: string | null;
  tool: EditorTool;
  showGrid: boolean;
  groundColor: string;
  gridColor: string;
  sceneName: string;
  history: SceneObject[][];
  historyIndex: number;

  addObject: (kind: ObjectKind, position?: Vec3, modelData?: ArrayBuffer, modelPath?: string) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  updateObject: (id: string, patch: Partial<SceneObject>) => void;
  updateTransform: (id: string, position?: Partial<Vec3>, rotation?: Partial<Vec3>, scale?: Partial<Vec3>) => void;
  saveHistory: () => void;
  setTool: (tool: EditorTool) => void;
  toggleGrid: () => void;
  setGroundColor: (color: string) => void;
  setGridColor: (color: string) => void;
  undo: () => void;
  redo: () => void;
  bringToFront: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  sendToBack: (id: string) => void;
  loadScene: (data: SceneData) => void;
  getSceneData: () => SceneData;
  clearScene: () => void;
}

function pushHistory(history: SceneObject[][], historyIndex: number, objects: SceneObject[]): { history: SceneObject[][]; historyIndex: number } {
  const snapshot = cloneObjects(objects);
  const newHistory = history.slice(0, historyIndex + 1);
  newHistory.push(snapshot);
  if (newHistory.length > MAX_HISTORY + 1) {
    newHistory.shift();
  }
  return { history: newHistory, historyIndex: newHistory.length - 1 };
}

export const useSceneStore = create<SceneStore>((set, get) => ({
  objects: [],
  selectedId: null,
  tool: 'translate',
  showGrid: true,
  groundColor: '#2d2d2d',
  gridColor: '#444444',
  sceneName: 'untitled',
  history: [[]],
  historyIndex: 0,

  addObject: (kind, position, modelData, modelPath) => {
    set(state => {
      const name = nextName(state.objects, kind);
      const maxOi = state.objects.reduce((max, o) => Math.max(max, o.occlusionIndex), -1);
      const obj: SceneObject = {
        id: nanoid(),
        name,
        kind,
        position: position ? { ...position } : { x: state.objects.length * 1.5, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        color: DEFAULT_COLOR,
        visible: true,
        locked: false,
        occlusionIndex: maxOi + 1,
        modelPath,
        modelData,
      };
      const newObjects = [...state.objects, obj];
      return {
        objects: newObjects,
        selectedId: obj.id,
        ...pushHistory(state.history, state.historyIndex, newObjects),
      };
    });
  },

  removeObject: (id) => {
    set(state => {
      const idx = state.objects.findIndex(o => o.id === id);
      if (idx === -1) return {};
      const newObjects = state.objects
        .filter(o => o.id !== id)
        .map((o, i) => ({ ...o, occlusionIndex: i }));
      return {
        objects: newObjects,
        selectedId: state.selectedId === id ? null : state.selectedId,
        ...pushHistory(state.history, state.historyIndex, newObjects),
      };
    });
  },

  selectObject: (id) => {
    set({ selectedId: id != null ? get().objects.find(o => o.id === id)?.id ?? get().selectedId : null });
  },

  updateObject: (id, patch) => {
    set(state => {
      const newObjects = state.objects.map(o =>
        o.id === id ? { ...o, ...patch } : o
      );
      return { objects: newObjects };
    });
  },

  updateTransform: (id, position, rotation, scale) => {
    set(state => {
      const newObjects = state.objects.map(o => {
        if (o.id !== id) return o;
        return {
          ...o,
          position: position ? { ...o.position, ...position } : o.position,
          rotation: rotation ? { ...o.rotation, ...rotation } : o.rotation,
          scale: scale ? { ...o.scale, ...scale } : o.scale,
        };
      });
      return { objects: newObjects };
    });
  },

  saveHistory: () => {
    set(state => ({
      ...pushHistory(state.history, state.historyIndex, state.objects),
    }));
  },

  setTool: (tool) => set({ tool }),

  toggleGrid: () => set(state => ({ showGrid: !state.showGrid })),
  setGroundColor: (color) => set({ groundColor: color }),
  setGridColor: (color) => set({ gridColor: color }),

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    set({
      objects: cloneObjects(history[newIndex]),
      selectedId: null,
      historyIndex: newIndex,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    set({
      objects: cloneObjects(history[newIndex]),
      selectedId: null,
      historyIndex: newIndex,
    });
  },

  bringToFront: (id) => {
    set(state => {
      const newObjects = state.objects.map(o => ({ ...o }));
      const idx = newObjects.findIndex(o => o.id === id);
      if (idx === -1) return {};
      const maxOi = newObjects.reduce((max, o) => Math.max(max, o.occlusionIndex), 0);
      if (newObjects[idx].occlusionIndex === maxOi) return {};
      const oldOi = newObjects[idx].occlusionIndex;
      newObjects[idx].occlusionIndex = maxOi;
      for (const o of newObjects) {
        if (o.id !== id && o.occlusionIndex > oldOi) {
          o.occlusionIndex--;
        }
      }
      return {
        objects: newObjects,
        ...pushHistory(state.history, state.historyIndex, newObjects),
      };
    });
  },

  bringForward: (id) => {
    set(state => {
      const newObjects = state.objects.map(o => ({ ...o }));
      const idx = newObjects.findIndex(o => o.id === id);
      if (idx === -1) return {};
      const oi = newObjects[idx].occlusionIndex;
      const next = newObjects.find(o => o.occlusionIndex === oi + 1);
      if (!next) return {};
      newObjects[idx].occlusionIndex = oi + 1;
      next.occlusionIndex = oi;
      return {
        objects: newObjects,
        ...pushHistory(state.history, state.historyIndex, newObjects),
      };
    });
  },

  sendBackward: (id) => {
    set(state => {
      const newObjects = state.objects.map(o => ({ ...o }));
      const idx = newObjects.findIndex(o => o.id === id);
      if (idx === -1) return {};
      const oi = newObjects[idx].occlusionIndex;
      if (oi === 0) return {};
      const prev = newObjects.find(o => o.occlusionIndex === oi - 1);
      if (!prev) return {};
      newObjects[idx].occlusionIndex = oi - 1;
      prev.occlusionIndex = oi;
      return {
        objects: newObjects,
        ...pushHistory(state.history, state.historyIndex, newObjects),
      };
    });
  },

  sendToBack: (id) => {
    set(state => {
      const newObjects = state.objects.map(o => ({ ...o }));
      const idx = newObjects.findIndex(o => o.id === id);
      if (idx === -1) return {};
      const oldOi = newObjects[idx].occlusionIndex;
      if (oldOi === 0) return {};
      newObjects[idx].occlusionIndex = 0;
      for (const o of newObjects) {
        if (o.id !== id && o.occlusionIndex < oldOi) {
          o.occlusionIndex++;
        }
      }
      return {
        objects: newObjects,
        ...pushHistory(state.history, state.historyIndex, newObjects),
      };
    });
  },

  loadScene: (data) => {
    const objects = cloneObjects(data.objects);
    set({
      objects,
      selectedId: null,
      sceneName: data.metadata.name,
      history: [cloneObjects(objects)],
      historyIndex: 0,
    });
  },

  getSceneData: () => {
    const state = get();
    const now = new Date().toISOString();
    return {
      version: '1.0.0',
      objects: cloneObjects(state.objects),
      metadata: {
        name: state.sceneName,
        createdAt: now,
        updatedAt: now,
      },
    };
  },

  clearScene: () => {
    set({
      objects: [],
      selectedId: null,
      history: [[]],
      historyIndex: 0,
    });
  },
}));