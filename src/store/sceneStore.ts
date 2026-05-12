import { create } from 'zustand';
import type { SceneObject, Transform3D, TransformMode, CameraState, SceneData } from '../types';
import { logger } from '../utils/logger';

const M = 'Store';

interface HistoryEntry {
  objects: SceneObject[];
}

interface SceneStore {
  objects: SceneObject[];
  selectedId: string | null;
  transformMode: TransformMode;
  camera: CameraState;
  showGrid: boolean;
  history: HistoryEntry[];
  historyIndex: number;

  addObject: (obj: SceneObject) => void;
  removeObject: (id: string) => void;
  updateTransform: (id: string, transform: Partial<Transform3D>, skipHistory?: boolean) => void;
  updateObjectName: (id: string, name: string) => void;
  updateColor: (id: string, color: string) => void;
  updateRenderOrder: (id: string, renderOrder: number) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  toggleVisibility: (id: string) => void;
  toggleLock: (id: string) => void;
  selectObject: (id: string | null) => void;
  setTransformMode: (mode: TransformMode) => void;
  setCamera: (camera: CameraState) => void;
  toggleGrid: () => void;

  undo: () => void;
  redo: () => void;

  exportScene: () => SceneData;
  importScene: (data: SceneData) => void;
}

const pushHistory = (objects: SceneObject[], history: HistoryEntry[], historyIndex: number) => {
  const newHistory = history.slice(0, historyIndex + 1);
  const snapshot = JSON.parse(JSON.stringify(objects));
  const lastEntry = newHistory[newHistory.length - 1];
  if (lastEntry && JSON.stringify(lastEntry.objects) === JSON.stringify(snapshot)) {
    return { history: newHistory, historyIndex: newHistory.length - 1 };
  }
  newHistory.push({ objects: snapshot });
  if (newHistory.length > 50) newHistory.shift();
  return { history: newHistory, historyIndex: newHistory.length - 1 };
};

const fixSelectedId = (selectedId: string | null, objects: SceneObject[]): string | null => {
  if (!selectedId) return null;
  return objects.some((o) => o.id === selectedId) ? selectedId : null;
};

export const useSceneStore = create<SceneStore>((set, get) => ({
  objects: [],
  selectedId: null,
  transformMode: 'translate',
  camera: { position: [5, 5, 5], target: [0, 0, 0], zoom: 1 },
  showGrid: true,
  history: [{ objects: [] }],
  historyIndex: 0,

  addObject: (obj) =>
    set((state) => {
      logger.info(M, '添加物体', {
        物体ID: obj.id,
        物体名称: obj.name,
        gltfUrl: obj.gltfUrl,
        变换: obj.transform,
        添加前物体数: state.objects.length,
        添加后物体数: state.objects.length + 1,
      });
      const newObjects = [...state.objects, obj];
      return { objects: newObjects, selectedId: obj.id, ...pushHistory(newObjects, state.history, state.historyIndex) };
    }),

  removeObject: (id) =>
    set((state) => {
      const removed = state.objects.find((o) => o.id === id);
      const newObjects = state.objects.filter((o) => o.id !== id);
      logger.warn(M, '移除物体', {
        物体ID: id,
        物体名称: removed?.name ?? '未知',
        移除前物体数: state.objects.length,
        移除后物体数: newObjects.length,
        是否为选中物体: state.selectedId === id,
      });
      const newSelectedId = state.selectedId === id ? null : state.selectedId;
      return {
        objects: newObjects,
        selectedId: newSelectedId,
        ...pushHistory(newObjects, state.history, state.historyIndex),
      };
    }),

  updateTransform: (id, transform, skipHistory = false) =>
    set((state) => {
      const obj = state.objects.find((o) => o.id === id);
      const oldTransform = obj?.transform;
      const newObjects = state.objects.map((o) =>
        o.id === id
          ? {
              ...o,
              transform: {
                position: transform.position ?? o.transform.position,
                rotation: transform.rotation ?? o.transform.rotation,
                scale: transform.scale ?? o.transform.scale,
              },
            }
          : o
      );
      const newTransform = newObjects.find((o) => o.id === id)?.transform;
      logger.info(M, '更新变换', {
        物体ID: id,
        物体名称: obj?.name ?? '未知',
        旧变换: oldTransform,
        新变换: newTransform,
        跳过历史: skipHistory,
      });
      if (skipHistory) {
        return { objects: newObjects };
      }
      return { objects: newObjects, ...pushHistory(newObjects, state.history, state.historyIndex) };
    }),

  updateObjectName: (id, name) =>
    set((state) => {
      const obj = state.objects.find((o) => o.id === id);
      logger.info(M, '更新物体名称', {
        物体ID: id,
        旧名称: obj?.name ?? '未知',
        新名称: name,
      });
      const newObjects = state.objects.map((o) => (o.id === id ? { ...o, name } : o));
      return { objects: newObjects, ...pushHistory(newObjects, state.history, state.historyIndex) };
    }),

  updateColor: (id, color) =>
    set((state) => {
      const obj = state.objects.find((o) => o.id === id);
      logger.info(M, '更新物体颜色', {
        物体ID: id,
        物体名称: obj?.name ?? '未知',
        旧颜色: obj?.color,
        新颜色: color,
      });
      const newObjects = state.objects.map((o) => (o.id === id ? { ...o, color } : o));
      return { objects: newObjects, ...pushHistory(newObjects, state.history, state.historyIndex) };
    }),

  updateRenderOrder: (id, renderOrder) =>
    set((state) => {
      const obj = state.objects.find((o) => o.id === id);
      logger.info(M, '更新渲染层级', {
        物体ID: id,
        物体名称: obj?.name ?? '未知',
        旧层级: obj?.renderOrder,
        新层级: renderOrder,
      });
      const newObjects = state.objects.map((o) => (o.id === id ? { ...o, renderOrder } : o));
      return { objects: newObjects, ...pushHistory(newObjects, state.history, state.historyIndex) };
    }),

  bringToFront: (id) =>
    set((state) => {
      const maxOrder = state.objects.reduce((max, o) => Math.max(max, o.renderOrder), 0);
      const obj = state.objects.find((o) => o.id === id);
      const newOrder = maxOrder + 1;
      logger.info(M, '置顶物体', {
        物体ID: id,
        物体名称: obj?.name ?? '未知',
        旧层级: obj?.renderOrder,
        新层级: newOrder,
      });
      const newObjects = state.objects.map((o) => (o.id === id ? { ...o, renderOrder: newOrder } : o));
      return { objects: newObjects, ...pushHistory(newObjects, state.history, state.historyIndex) };
    }),

  sendToBack: (id) =>
    set((state) => {
      const minOrder = state.objects.reduce((min, o) => Math.min(min, o.renderOrder), 0);
      const obj = state.objects.find((o) => o.id === id);
      const newOrder = minOrder - 1;
      logger.info(M, '置底物体', {
        物体ID: id,
        物体名称: obj?.name ?? '未知',
        旧层级: obj?.renderOrder,
        新层级: newOrder,
      });
      const newObjects = state.objects.map((o) => (o.id === id ? { ...o, renderOrder: newOrder } : o));
      return { objects: newObjects, ...pushHistory(newObjects, state.history, state.historyIndex) };
    }),

  toggleVisibility: (id) =>
    set((state) => {
      const obj = state.objects.find((o) => o.id === id);
      const newVisible = !obj?.visible;
      logger.info(M, '切换可见性(Store)', {
        物体ID: id,
        物体名称: obj?.name ?? '未知',
        新可见状态: newVisible,
      });
      const newObjects = state.objects.map((o) => (o.id === id ? { ...o, visible: newVisible } : o));
      return { objects: newObjects, ...pushHistory(newObjects, state.history, state.historyIndex) };
    }),

  toggleLock: (id) =>
    set((state) => {
      const obj = state.objects.find((o) => o.id === id);
      const newLocked = !obj?.locked;
      logger.info(M, '切换锁定状态(Store)', {
        物体ID: id,
        物体名称: obj?.name ?? '未知',
        新锁定状态: newLocked,
      });
      const newObjects = state.objects.map((o) => (o.id === id ? { ...o, locked: newLocked } : o));
      return { objects: newObjects, ...pushHistory(newObjects, state.history, state.historyIndex) };
    }),

  selectObject: (id) => {
    const state = get();
    const obj = id ? state.objects.find((o) => o.id === id) : null;
    logger.info(M, '选中物体(Store)', {
      新选中ID: id,
      物体名称: obj?.name ?? (id === null ? '取消选中' : '未知'),
      旧选中ID: state.selectedId,
    });
    set({ selectedId: id });
  },

  setTransformMode: (mode) => {
    const state = get();
    logger.info(M, '切换变换模式', {
      旧模式: state.transformMode,
      新模式: mode,
    });
    set({ transformMode: mode });
  },

  setCamera: (camera) => {
    logger.debug(M, '更新摄像机', {
      位置: camera.position,
      目标: camera.target,
      缩放: camera.zoom,
    });
    set({ camera });
  },

  toggleGrid: () => {
    const current = get().showGrid;
    logger.info(M, '切换网格显示', { 旧状态: current, 新状态: !current });
    set({ showGrid: !current });
  },

  undo: () =>
    set((state) => {
      if (state.historyIndex <= 0) {
        logger.warn(M, '撤销失败', { 原因: '已到历史记录起点', 当前索引: state.historyIndex });
        return state;
      }
      const newIndex = state.historyIndex - 1;
      const restoredObjects = JSON.parse(JSON.stringify(state.history[newIndex].objects)) as SceneObject[];
      const newSelectedId = fixSelectedId(state.selectedId, restoredObjects);
      logger.info(M, '撤销操作', {
        旧索引: state.historyIndex,
        新索引: newIndex,
        历史记录总数: state.history.length,
        恢复后物体数: restoredObjects.length,
        选中物体是否仍存在: state.selectedId === newSelectedId,
      });
      return { objects: restoredObjects, selectedId: newSelectedId, historyIndex: newIndex };
    }),

  redo: () =>
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) {
        logger.warn(M, '重做失败', { 原因: '已到历史记录末尾', 当前索引: state.historyIndex, 总记录数: state.history.length });
        return state;
      }
      const newIndex = state.historyIndex + 1;
      const restoredObjects = JSON.parse(JSON.stringify(state.history[newIndex].objects)) as SceneObject[];
      const newSelectedId = fixSelectedId(state.selectedId, restoredObjects);
      logger.info(M, '重做操作', {
        旧索引: state.historyIndex,
        新索引: newIndex,
        历史记录总数: state.history.length,
        恢复后物体数: restoredObjects.length,
        选中物体是否仍存在: state.selectedId === newSelectedId,
      });
      return { objects: restoredObjects, selectedId: newSelectedId, historyIndex: newIndex };
    }),

  exportScene: () => {
    const { objects, camera } = get();
    const data: SceneData = {
      version: '1.0.0',
      objects: JSON.parse(JSON.stringify(objects)),
      camera: JSON.parse(JSON.stringify(camera)),
    };
    logger.info(M, '导出场景', {
      版本: data.version,
      物体数量: data.objects.length,
      物体列表: data.objects.map((o) => ({ id: o.id, name: o.name })),
      摄像机: data.camera,
    });
    return data;
  },

  importScene: (data) => {
    logger.info(M, '导入场景', {
      版本: data.version,
      物体数量: data.objects.length,
      物体列表: data.objects.map((o) => ({ id: o.id, name: o.name, gltfUrl: o.gltfUrl })),
      摄像机: data.camera,
    });
    set({
      objects: data.objects,
      camera: data.camera,
      selectedId: null,
      history: [{ objects: JSON.parse(JSON.stringify(data.objects)) }],
      historyIndex: 0,
    });
    logger.info(M, '场景导入完成', { 物体数量: get().objects.length });
  },
}));
