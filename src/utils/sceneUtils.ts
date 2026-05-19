import type { SceneData, SceneObject } from '../types';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three-stdlib';

export function validateSceneData(data: unknown): data is SceneData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  if (typeof d.version !== 'string') return false;
  if (!Array.isArray(d.objects)) return false;
  for (const obj of d.objects) {
    if (!obj || typeof obj !== 'object') return false;
    if (typeof (obj as Record<string, unknown>).id !== 'string') return false;
    const pos = (obj as Record<string, unknown>).position;
    if (!pos || typeof pos !== 'object') return false;
    const p = pos as Record<string, unknown>;
    if (typeof p.x !== 'number' || typeof p.y !== 'number' || typeof p.z !== 'number') return false;
  }
  return true;
}

export function serializeScene(data: SceneData): string {
  const serializable = {
    ...data,
    objects: data.objects.map(o => ({
      ...o,
      modelData: o.modelData ? arrayBufferToBase64(o.modelData) : undefined,
    })),
  };
  return JSON.stringify(serializable, null, 2);
}

export function deserializeScene(json: string): SceneData {
  const parsed = JSON.parse(json);
  if (parsed.objects) {
    parsed.objects = parsed.objects.map((o: Record<string, unknown>) => ({
      ...o,
      modelData: o.modelData ? base64ToArrayBuffer(o.modelData as string) : undefined,
    }));
  }
  if (!validateSceneData(parsed)) {
    throw new Error('Invalid scene data format');
  }
  return parsed;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseGLTFBuffer(buffer: ArrayBuffer): Promise<THREE.Group> {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    try {
      loader.parse(
        buffer,
        '',
        (gltf: { scene: THREE.Group }) => resolve(gltf.scene),
        (err: unknown) => reject(err),
      );
    } catch (e) {
      reject(e);
    }
  });
}

function objectToMesh(obj: SceneObject): THREE.Object3D {
  const color = new THREE.Color(obj.color);

  function mat(c?: string | THREE.Color, opts?: Partial<THREE.MeshStandardMaterialParameters>): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({ color: c ?? color, ...opts });
  }

  function box(w: number, h: number, d: number, m?: THREE.Material): THREE.Mesh {
    return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m ?? mat());
  }
  function sphere(r: number, seg: number, m?: THREE.Material): THREE.Mesh {
    return new THREE.Mesh(new THREE.SphereGeometry(r, seg, seg), m ?? mat());
  }
  function cylinder(rTop: number, rBot: number, h: number, seg: number, m?: THREE.Material): THREE.Mesh {
    return new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, seg), m ?? mat());
  }
  function cone(r: number, h: number, seg: number, m?: THREE.Material): THREE.Mesh {
    return new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), m ?? mat());
  }
  function torus(r: number, tube: number, m?: THREE.Material): THREE.Mesh {
    return new THREE.Mesh(new THREE.TorusGeometry(r, tube, 16, 32), m ?? mat());
  }

  function addMesh(parent: THREE.Group, mesh: THREE.Mesh, pos: [number, number, number], rot?: [number, number, number]): void {
    mesh.position.set(pos[0], pos[1], pos[2]);
    if (rot) {
      mesh.rotation.set(rot[0], rot[1], rot[2]);
    }
    parent.add(mesh);
  }

  const group = new THREE.Group();
  const darken = color.clone().multiplyScalar(0.7);
  const darker = color.clone().multiplyScalar(0.5);

  switch (obj.kind) {
    case 'box':
      addMesh(group, box(1, 1, 1), [0, 0, 0]);
      break;
    case 'sphere':
      addMesh(group, sphere(0.5, 32), [0, 0, 0]);
      break;
    case 'cylinder':
      addMesh(group, cylinder(0.5, 0.5, 1, 32), [0, 0, 0]);
      break;
    case 'cone':
      addMesh(group, cone(0.5, 1, 32), [0, 0, 0]);
      break;
    case 'torus':
      addMesh(group, torus(0.5, 0.2), [0, 0, 0]);
      break;
    case 'person':
      addMesh(group, sphere(0.25, 16, mat()), [0, 1.4, 0]);
      addMesh(group, cylinder(0.15, 0.15, 0.8, 8, mat(darken)), [0, 0.8, 0]);
      addMesh(group, box(0.4, 0.6, 0.2, mat()), [0, 0.4, 0]);
      addMesh(group, cylinder(0.06, 0.06, 0.8, 8, mat(darken)), [-0.22, 0, 0]);
      addMesh(group, cylinder(0.06, 0.06, 0.8, 8, mat(darken)), [0.22, 0, 0]);
      break;
    case 'house':
      addMesh(group, box(1.2, 1.6, 0.9, mat()), [0, 0.8, 0]);
      addMesh(group, cone(0.9, 0.7, 4, mat(color.clone().multiplyScalar(0.55))), [0, 1.7, 0], [0, Math.PI / 4, 0]);
      addMesh(group, box(0.18, 0.6, 0.05, mat('#6B3A2A')), [0, 0.3, 0.46]);
      addMesh(group, sphere(0.02, 8, new THREE.MeshStandardMaterial({ color: '#DAA520', metalness: 0.8, roughness: 0.3 })), [0.06, 0.32, 0.49]);
      addMesh(group, box(0.22, 0.28, 0.04, new THREE.MeshStandardMaterial({ color: '#87CEEB', emissive: '#87CEEB', emissiveIntensity: 0.2 })), [-0.3, 0.85, 0.46]);
      addMesh(group, box(0.24, 0.03, 0.01, mat('#E8E0D8')), [-0.3, 0.85, 0.48]);
      addMesh(group, box(0.03, 0.30, 0.01, mat('#E8E0D8')), [-0.3, 0.85, 0.48]);
      addMesh(group, box(0.22, 0.28, 0.04, new THREE.MeshStandardMaterial({ color: '#87CEEB', emissive: '#87CEEB', emissiveIntensity: 0.2 })), [0.3, 0.85, 0.46]);
      addMesh(group, box(0.24, 0.03, 0.01, mat('#E8E0D8')), [0.3, 0.85, 0.48]);
      addMesh(group, box(0.03, 0.30, 0.01, mat('#E8E0D8')), [0.3, 0.85, 0.48]);
      addMesh(group, box(0.14, 0.45, 0.14, new THREE.MeshStandardMaterial({ color: '#8B4513', roughness: 0.8 })), [0.3, 1.9, -0.15]);
      addMesh(group, box(0.06, 0.08, 1.1, mat(color.clone().multiplyScalar(0.45))), [0, 2.05, 0]);
      break;
    case 'table':
      addMesh(group, box(1.2, 0.1, 0.8, mat()), [0, 0.5, 0]);
      addMesh(group, cylinder(0.06, 0.06, 0.5, 8, mat(darker)), [-0.5, 0.25, -0.3]);
      addMesh(group, cylinder(0.06, 0.06, 0.5, 8, mat(darker)), [0.5, 0.25, -0.3]);
      addMesh(group, cylinder(0.06, 0.06, 0.5, 8, mat(darker)), [-0.5, 0.25, 0.3]);
      addMesh(group, cylinder(0.06, 0.06, 0.5, 8, mat(darker)), [0.5, 0.25, 0.3]);
      break;
    case 'chair':
      addMesh(group, box(0.4, 0.05, 0.4, mat()), [0, 0.5, 0]);
      addMesh(group, box(0.35, 0.5, 0.04, mat()), [0, 0.3, -0.18]);
      addMesh(group, cylinder(0.04, 0.04, 0.4, 8, mat(darker)), [-0.15, 0.2, 0.15]);
      addMesh(group, cylinder(0.04, 0.04, 0.4, 8, mat(darker)), [0.15, 0.2, 0.15]);
      break;
    case 'cup':
      addMesh(group, cylinder(0.15, 0.12, 0.6, 16, mat()), [0, 0.3, 0]);
      addMesh(group, torus(0.08, 0.02, mat()), [0.18, 0.35, 0], [0, 0, Math.PI / 2]);
      break;
    case 'tree':
      addMesh(group, cylinder(0.08, 0.12, 0.8, 8, mat('#8B6914')), [0, 0.4, 0]);
      addMesh(group, cone(0.5, 1, 8, mat()), [0, 1.0, 0]);
      addMesh(group, cone(0.35, 0.7, 8, mat(color.clone().multiplyScalar(0.8))), [0, 1.5, 0]);
      break;
    case 'car': {
      addMesh(group, box(1.5, 0.4, 0.8, mat()), [0, 0.3, 0]);
      addMesh(group, box(0.7, 0.25, 0.6, mat(color.clone().multiplyScalar(0.85))), [0, 0.6, 0.1]);
      const wheelGrp = new THREE.Group();
      wheelGrp.rotation.set(Math.PI / 2, 0, 0);
      const wheelMat = mat('#222222');
      addMesh(wheelGrp, cylinder(0.18, 0.18, 0.1, 16, wheelMat), [-0.5, 0.12, 0.35]);
      addMesh(wheelGrp, cylinder(0.18, 0.18, 0.1, 16, wheelMat), [0.5, 0.12, 0.35]);
      addMesh(wheelGrp, cylinder(0.18, 0.18, 0.1, 16, wheelMat), [-0.5, 0.12, -0.35]);
      addMesh(wheelGrp, cylinder(0.18, 0.18, 0.1, 16, wheelMat), [0.5, 0.12, -0.35]);
      group.add(wheelGrp);
      break;
    }
    case 'sofa':
      addMesh(group, box(2.5, 0.4, 0.8, mat()), [0, 0.3, 0]);
      addMesh(group, box(2.3, 0.4, 0.1, mat(color.clone().multiplyScalar(0.85))), [0, 0.7, -0.35]);
      addMesh(group, box(0.2, 0.4, 0.1, mat(color.clone().multiplyScalar(0.85))), [-1.1, 0.5, 0.35]);
      addMesh(group, box(0.2, 0.4, 0.1, mat(color.clone().multiplyScalar(0.85))), [1.1, 0.5, 0.35]);
      break;
    case 'bed':
      addMesh(group, box(2, 0.3, 1.5, mat()), [0, 0.15, 0]);
      addMesh(group, box(1.8, 0.15, 1.3, mat('#FFFFFF')), [0, 0.35, 0]);
      addMesh(group, box(1.9, 0.5, 0.1, mat(darken)), [0, 0.7, -0.7]);
      break;
    case 'fence':
      addMesh(group, box(2, 0.5, 0.05, mat()), [0, 0.25, 0]);
      addMesh(group, box(0.06, 0.5, 0.05, mat(darken)), [-0.8, 0.5, 0]);
      addMesh(group, box(0.06, 0.5, 0.05, mat(darken)), [0, 0.5, 0]);
      addMesh(group, box(0.06, 0.5, 0.05, mat(darken)), [0.8, 0.5, 0]);
      break;
    default:
      addMesh(group, box(1, 1, 1), [0, 0, 0]);
      break;
  }

  group.position.set(obj.position.x, obj.position.y, obj.position.z);
  group.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z);
  group.scale.set(obj.scale.x, obj.scale.y, obj.scale.z);
  group.visible = obj.visible;
  group.name = obj.name;
  return group;
}

export function buildThreeScene(objects: SceneObject[]): THREE.Scene {
  const scene = new THREE.Scene();
  for (const obj of objects) {
    scene.add(objectToMesh(obj));
  }
  return scene;
}

export function exportToGLB(objects: SceneObject[]): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const scene = buildThreeScene(objects);
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (result) => {
        resolve(result as ArrayBuffer);
      },
      (err: unknown) => {
        reject(err);
      },
      { binary: true }
    );
  });
}