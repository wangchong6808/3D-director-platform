import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import type { SceneData } from '../types';

export function downloadJSON(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadArrayBuffer(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSceneToGLTF(scene: THREE.Scene): Promise<ArrayBuffer> {
  const exporter = new GLTFExporter();
  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(result);
        } else {
          const encoder = new TextEncoder();
          resolve(encoder.encode(JSON.stringify(result)).buffer);
        }
      },
      (error) => reject(error),
      { binary: true }
    );
  });
}

export function loadSceneFromFile(): Promise<SceneData> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return reject(new Error('No file selected'));
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string) as SceneData;
          resolve(data);
        } catch {
          reject(new Error('Invalid scene file'));
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });
}

export function loadGLTFFromFile(): Promise<{ url: string; name: string }> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.gltf,.glb';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return reject(new Error('No file selected'));
      const url = URL.createObjectURL(file);
      resolve({ url, name: file.name.replace(/\.(gltf|glb)$/, '') });
    };
    input.click();
  });
}

export function generateId(): string {
  return `obj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
