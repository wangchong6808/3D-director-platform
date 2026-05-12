import type { SceneObject } from '../types';

let _seq = 0;
const uid = (prefix: string) => `${prefix}_${++_seq}_${Date.now()}`;

interface ObjOpts {
  rotation?: [number, number, number];
  scale?: [number, number, number];
  renderOrder?: number;
}

const obj = (
  name: string,
  primitiveType: SceneObject['primitiveType'],
  color: string,
  position: [number, number, number],
  opts?: ObjOpts
): SceneObject => ({
  id: uid(name),
  name,
  gltfUrl: '',
  primitiveType,
  color,
  renderOrder: opts?.renderOrder ?? 0,
  transform: {
    position,
    rotation: opts?.rotation ?? [0, 0, 0] as [number, number, number],
    scale: opts?.scale ?? [1, 1, 1] as [number, number, number],
  },
  visible: true,
  locked: false,
});

export interface DemoSceneOption {
  key: string;
  label: string;
  description: string;
  create: () => { objects: SceneObject[]; camera: { position: [number, number, number]; target: [number, number, number]; zoom: number } };
}

export const DEMO_SCENES: DemoSceneOption[] = [
  {
    key: 'office',
    label: '办公室',
    description: '两人对坐办公，桌椅、杯具、文件柜',
    create: () => ({
      objects: [
        obj('办公桌1', 'table', '#8b6914', [-1.5, 0, 0]),
        obj('办公桌2', 'table', '#8b6914', [1.5, 0, 0]),
        obj('椅子1', 'chair', '#a0522d', [-1.5, 0, 1]),
        obj('椅子2', 'chair', '#a0522d', [1.5, 0, 1]),
        obj('人物_员工A', 'person', '#e8966d', [-1.5, 0, -0.8]),
        obj('人物_员工B', 'person', '#c47a5a', [1.5, 0, -0.8]),
        obj('杯子1', 'cup', '#87ceeb', [-1.1, 0.7, 0.1]),
        obj('杯子2', 'cup', '#87ceeb', [1.9, 0.7, 0.1]),
        obj('文件柜', 'box', '#6b6b6b', [3.5, 0, -1], { scale: [0.8, 1.5, 0.5] }),
        obj('盆栽', 'tree', '#228b22', [-3.5, 0, -1], { scale: [0.6, 0.6, 0.6] }),
      ],
      camera: { position: [5, 5, 5], target: [0, 0.5, 0], zoom: 1 },
    }),
  },
  {
    key: 'living-room',
    label: '客厅',
    description: '沙发、茶几、电视柜，家庭日常场景',
    create: () => ({
      objects: [
        obj('沙发', 'sofa', '#6b8e23', [0, 0, 2]),
        obj('茶几', 'table', '#8b6914', [0, 0, 0.3], { scale: [0.8, 0.7, 0.6] }),
        obj('杯子', 'cup', '#87ceeb', [0.2, 0.72, 0.3]),
        obj('电视柜', 'box', '#5c4033', [0, 0, -2], { scale: [2, 0.6, 0.5] }),
        obj('电视', 'box', '#1a1a1a', [0, 0.5, -2], { scale: [1.5, 0.9, 0.08] }),
        obj('人物_主人', 'person', '#e8966d', [0, 0, 2.5]),
        obj('台灯', 'cylinder', '#ffd700', [-1.8, 0, 1.5], { scale: [0.3, 0.6, 0.3] }),
        obj('花瓶', 'cylinder', '#ff6347', [1.5, 0, 1.5], { scale: [0.25, 0.5, 0.25] }),
        obj('地毯', 'box', '#8b4513', [0, 0.01, 1], { scale: [2.5, 0.02, 2], renderOrder: -1 }),
      ],
      camera: { position: [4, 4, 6], target: [0, 0.5, 0.5], zoom: 1 },
    }),
  },
  {
    key: 'street',
    label: '街道',
    description: '城市街景，汽车、行人、树木、栅栏',
    create: () => ({
      objects: [
        obj('汽车1', 'car', '#dc143c', [-2, 0, 1], { rotation: [0, 0.2, 0] }),
        obj('汽车2', 'car', '#1e90ff', [3, 0, 1], { rotation: [0, 3.3, 0] }),
        obj('人物_行人A', 'person', '#e8966d', [1, 0, -1]),
        obj('人物_行人B', 'person', '#c47a5a', [-1, 0, -2]),
        obj('树木1', 'tree', '#228b22', [-4, 0, -2]),
        obj('树木2', 'tree', '#2e8b57', [4, 0, -2]),
        obj('栅栏', 'fence', '#deb887', [0, 0, -3], { scale: [3, 1, 1] }),
        obj('路灯', 'cylinder', '#708090', [2, 0, -1.5], { scale: [0.15, 2, 0.15] }),
        obj('房子', 'house', '#d4a574', [-5, 0, -5], { scale: [1.5, 1.2, 1.2] }),
        obj('路面', 'box', '#555555', [0, 0.01, 0], { scale: [12, 0.02, 4], renderOrder: -1 }),
      ],
      camera: { position: [6, 5, 6], target: [0, 0.5, 0], zoom: 1 },
    }),
  },
  {
    key: 'bedroom',
    label: '卧室',
    description: '床、床头柜、台灯，温馨私密空间',
    create: () => ({
      objects: [
        obj('双人床', 'bed', '#daa520', [0, 0, 0]),
        obj('床头柜1', 'box', '#8b6914', [-1.2, 0, -0.8], { scale: [0.4, 0.45, 0.4] }),
        obj('床头柜2', 'box', '#8b6914', [1.2, 0, -0.8], { scale: [0.4, 0.45, 0.4] }),
        obj('台灯1', 'cylinder', '#ffd700', [-1.2, 0.5, -0.8], { scale: [0.2, 0.35, 0.2] }),
        obj('台灯2', 'cylinder', '#ffd700', [1.2, 0.5, -0.8], { scale: [0.2, 0.35, 0.2] }),
        obj('椅子', 'chair', '#a0522d', [2, 0, 0.5]),
        obj('人物_熟睡', 'person', '#e8966d', [0, 0, 0.2], { scale: [0.9, 0.5, 0.9] }),
        obj('地毯', 'box', '#8b4513', [0, 0.01, 1.5], { scale: [2, 0.02, 1.5], renderOrder: -1 }),
        obj('花瓶', 'cylinder', '#ff6347', [1.2, 0.5, -0.6], { scale: [0.15, 0.3, 0.15] }),
      ],
      camera: { position: [3, 3, 4], target: [0, 0.4, 0], zoom: 1 },
    }),
  },
  {
    key: 'park',
    label: '公园',
    description: '长椅、树木、人物，户外休闲场景',
    create: () => ({
      objects: [
        obj('树木1', 'tree', '#228b22', [-3, 0, -3], { scale: [1.3, 1.3, 1.3] }),
        obj('树木2', 'tree', '#2e8b57', [3, 0, -4], { scale: [1.1, 1.1, 1.1] }),
        obj('树木3', 'tree', '#006400', [0, 0, -5], { scale: [1.5, 1.5, 1.5] }),
        obj('长椅1', 'sofa', '#8b6914', [-1, 0, 1], { scale: [0.6, 0.7, 0.6] }),
        obj('长椅2', 'sofa', '#8b6914', [2, 0, 2], { scale: [0.6, 0.7, 0.6], rotation: [0, -0.5, 0] }),
        obj('人物_散步A', 'person', '#e8966d', [0, 0, 0]),
        obj('人物_散步B', 'person', '#c47a5a', [0.6, 0, 0.3]),
        obj('人物_休息', 'person', '#d4a574', [-1, 0, 1.3]),
        obj('栅栏', 'fence', '#deb887', [0, 0, -2.5], { scale: [4, 1, 1] }),
        obj('喷泉底座', 'cylinder', '#808080', [0, 0, -1.5], { scale: [1, 0.3, 1] }),
        obj('草地', 'box', '#3a7d3a', [0, 0.01, 0], { scale: [10, 0.02, 8], renderOrder: -1 }),
      ],
      camera: { position: [5, 4, 6], target: [0, 0.5, 0], zoom: 1 },
    }),
  },
  {
    key: 'restaurant',
    label: '餐厅',
    description: '圆桌、餐椅、杯盘，聚餐场景',
    create: () => ({
      objects: [
        obj('圆桌1', 'cylinder', '#8b6914', [-2, 0, 0], { scale: [0.7, 0.7, 0.7] }),
        obj('圆桌2', 'cylinder', '#8b6914', [2, 0, 0], { scale: [0.7, 0.7, 0.7] }),
        obj('椅子1', 'chair', '#a0522d', [-2.5, 0, 0.5]),
        obj('椅子2', 'chair', '#a0522d', [-1.5, 0, 0.5]),
        obj('椅子3', 'chair', '#a0522d', [-2, 0, -0.6]),
        obj('椅子4', 'chair', '#a0522d', [1.5, 0, 0.5]),
        obj('椅子5', 'chair', '#a0522d', [2.5, 0, 0.5]),
        obj('椅子6', 'chair', '#a0522d', [2, 0, -0.6]),
        obj('杯子1', 'cup', '#87ceeb', [-2.2, 0.7, 0.1]),
        obj('杯子2', 'cup', '#87ceeb', [2.2, 0.7, 0.1]),
        obj('人物_食客A', 'person', '#e8966d', [-2, 0, 0.8]),
        obj('人物_食客B', 'person', '#c47a5a', [2, 0, 0.8]),
        obj('人物_服务员', 'person', '#1a1a1a', [0, 0, 2]),
        obj('花瓶', 'cylinder', '#ff6347', [-2, 0.75, 0], { scale: [0.12, 0.25, 0.12] }),
        obj('花瓶', 'cylinder', '#ff6347', [2, 0.75, 0], { scale: [0.12, 0.25, 0.12] }),
      ],
      camera: { position: [4, 4, 5], target: [0, 0.5, 0], zoom: 1 },
    }),
  },
];
