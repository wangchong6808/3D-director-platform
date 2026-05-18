export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export type EditorTool = 'translate' | 'rotate' | 'scale';

export type ObjectKind =
  | 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus'
  | 'person' | 'house' | 'table' | 'chair' | 'cup'
  | 'tree' | 'car' | 'sofa' | 'bed' | 'fence';

export interface SceneObject {
  id: string;
  name: string;
  kind: ObjectKind;
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
  color: string;
  visible: boolean;
  locked: boolean;
  occlusionIndex: number;
  modelPath?: string;
  modelData?: ArrayBuffer;
}

export interface SceneData {
  version: string;
  objects: SceneObject[];
  metadata: {
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface HistoryEntry {
  type: 'add' | 'remove' | 'transform' | 'property';
  timestamp: number;
  patches: ScenePatch[];
}

export interface ScenePatch {
  op: 'add' | 'remove' | 'replace';
  path: string;
  value?: unknown;
  oldValue?: unknown;
}