export type PrimitiveType =
  | 'box'
  | 'sphere'
  | 'cylinder'
  | 'cone'
  | 'torus'
  | 'person'
  | 'house'
  | 'table'
  | 'chair'
  | 'cup'
  | 'tree'
  | 'car'
  | 'sofa'
  | 'bed'
  | 'fence';

export interface Transform3D {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface SceneObject {
  id: string;
  name: string;
  gltfUrl: string;
  primitiveType?: PrimitiveType;
  color?: string;
  renderOrder: number;
  transform: Transform3D;
  visible: boolean;
  locked: boolean;
}

export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
}

export interface SceneData {
  version: string;
  objects: SceneObject[];
  camera: CameraState;
}

export type TransformMode = 'translate' | 'rotate' | 'scale';
