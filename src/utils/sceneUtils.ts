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
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      loader.load(
        url,
        (gltf: { scene: THREE.Group }) => {
          URL.revokeObjectURL(url);
          resolve(gltf.scene);
        },
        undefined,
        (err: unknown) => {
          URL.revokeObjectURL(url);
          reject(err);
        }
      );
    } catch (e) {
      reject(e);
    }
  });
}

function objectToMesh(obj: SceneObject): THREE.Object3D {
  let mesh: THREE.Object3D;
  const color = new THREE.Color(obj.color);
  const mat = new THREE.MeshStandardMaterial({ color });

  switch (obj.kind) {
    case 'box':
      mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat);
      break;
    case 'sphere':
      mesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), mat);
      break;
    case 'cylinder':
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 32), mat);
      break;
    case 'cone':
      mesh = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1, 32), mat);
      break;
    case 'torus':
      mesh = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.2, 16, 32), mat);
      break;
    default: {
      const group = new THREE.Group();
      const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat);
      group.add(box);
      mesh = group;
    }
  }

  mesh.position.set(obj.position.x, obj.position.y, obj.position.z);
  mesh.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z);
  mesh.scale.set(obj.scale.x, obj.scale.y, obj.scale.z);
  mesh.visible = obj.visible;
  mesh.name = obj.name;
  return mesh;
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