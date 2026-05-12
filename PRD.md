# Web 3D 导演台 — 产品需求文档 (PRD)

## 1. 产品概述

### 1.1 产品定位

Web 端 3D 场景编辑/布景工具，用于在浏览器中摆放、调整 GLTF 模型的空间位置关系，支持场景的序列化保存与导出。

### 1.2 目标用户

- 需要快速搭建 3D 场景布局的导演/策划人员
- 需要进行场景预演和空间规划的创作者
- 需要将场景数据导出供下游系统使用的工程师

### 1.3 核心价值

- **零安装**：浏览器即开即用，无需安装桌面软件
- **直观操作**：拖拽式 3D 交互，所见即所得
- **标准化输出**：导出标准 GLTF 格式，与主流 3D 工具链无缝衔接

---

## 2. 功能需求

### 2.1 P0 — 核心功能

| 功能 | 描述 | 验收标准 |
|------|------|----------|
| GLTF 模型加载 | 支持导入 .gltf / .glb 模型文件 | 可成功加载包含网格、材质、动画的精细模型 |
| 物体变换 | 支持移动(Translate)、旋转(Rotate)、缩放(Scale)三种模式 | 选中物体后可通过 TransformControls 拖拽操作 |
| 物体选择 | 点击3D场景中的物体进行选中 | 选中物体高亮显示，出现变换控制器 |
| 场景序列化 | 将场景状态保存为 JSON | 包含所有物体的 ID、名称、GLTF来源、变换参数、摄像机状态 |
| 场景反序列化 | 从 JSON 恢复场景 | 加载 JSON 后场景完整还原，包括物体位置和摄像机视角 |
| 场景导出 | 将场景导出为标准 GLTF 文件 | 导出的 GLTF 可被 Blender/Three.js 等工具正确打开 |

### 2.2 P1 — 重要功能

| 功能 | 描述 | 验收标准 |
|------|------|----------|
| 场景树面板 | 以树形结构展示场景中所有物体 | 支持展开/折叠、点击选中对应物体 |
| 属性面板 | 显示并编辑选中物体的位置/旋转/缩放数值 | 数值修改后3D场景实时更新 |
| 物体删除 | 从场景中移除物体 | 删除后场景树同步更新 |
| 模型库 | 预置常用模型，支持从库中拖入场景 | 模型库分类展示，点击即可添加到场景 |
| 地面网格 | 显示参考网格辅助空间定位 | 网格大小可调，可作为物体对齐参考 |
| 撤销/重做 | 支持操作历史回退和重做 | 至少支持 50 步撤销 |

### 2.3 P2 — 增强功能

| 功能 | 描述 |
|------|------|
| 物体复制 | 复制选中物体 |
| 多选操作 | 框选或 Ctrl+点击多选物体，批量变换 |
| 摄像机视角预设 | 保存和切换常用视角（正/侧/顶/透视） |
| 场景截图 | 导出当前视口为 PNG 图片 |
| 物体锁定 | 锁定物体防止误操作 |
| 图层管理 | 按图层组织物体，控制显示/隐藏 |

---

## 3. 交互设计

### 3.1 编辑器布局

```
┌──────────────────────────────────────────────────────────┐
│  工具栏（变换模式切换 | 撤销/重做 | 导入 | 导出 | 保存）  │
├────────────┬─────────────────────────────┬───────────────┤
│            │                             │               │
│  场景树    │       3D 视口               │  属性面板     │
│  面板      │   (React Three Fiber)       │              │
│            │                             │  - 位置 XYZ  │
│  - 物体1   │   ┌─────────────────────┐   │  - 旋转 XYZ  │
│  - 物体2   │   │                     │   │  - 缩放 XYZ  │
│  - 物体3   │   │    3D Scene         │   │              │
│            │   │                     │   │  - 模型信息   │
│            │   │                     │   │              │
│            │   └─────────────────────┘   │               │
│            │                             │               │
├────────────┴─────────────────────────────┴───────────────┤
│  状态栏（物体数量 | 选中物体 | 变换模式 | FPS）           │
└──────────────────────────────────────────────────────────┘
```

### 3.2 核心交互流程

**导入模型并摆放：**

1. 点击工具栏「导入」按钮 → 选择 .gltf/.glb 文件
2. 模型加载后自动添加到场景原点
3. 选中模型 → 出现 TransformControls
4. 拖拽移动/旋转/缩放模型到目标位置
5. 属性面板实时显示变换数值

**场景保存与导出：**

1. 点击「保存」→ 场景状态序列化为 JSON → 下载/存入存储
2. 点击「导出 GLTF」→ GLTFExporter 导出标准 GLTF 文件 → 下载

### 3.3 快捷键

| 快捷键 | 功能 |
|--------|------|
| W | 切换到移动模式 |
| E | 切换到旋转模式 |
| R | 切换到缩放模式 |
| Delete | 删除选中物体 |
| Ctrl+Z | 撤销 |
| Ctrl+Shift+Z | 重做 |
| Ctrl+S | 保存场景 |
| F | 聚焦选中物体 |

---

## 4. 技术方案

### 4.1 技术栈

| 层级 | 技术选型 | 版本 | 选型理由 |
|------|----------|------|----------|
| 3D 引擎 | Three.js | ^0.175 | WebGL 领域最成熟的 3D 库，GLTF 支持一流 |
| React 3D 渲染 | React Three Fiber (R3F) | ^9 | 声明式 3D 开发，React 组件化 |
| 3D 工具库 | @react-three/drei | ^10 | TransformControls、OrbitControls 等开箱即用 |
| 前端框架 | React | ^19 | 用户指定 |
| 状态管理 | Zustand | ^5 | 轻量、与 R3F 深度集成、序列化友好 |
| UI 组件库 | Ant Design | ^5 | 国内生态好，表格/表单/树形控件齐全 |
| 编辑器布局 | allotment | ^1 | 可拖拽调整大小的分栏面板 |
| 构建工具 | Vite | ^6 | 极速 HMR，3D 资源热更新友好 |
| 语言 | TypeScript | ^5 | 类型安全 |

### 4.2 核心依赖

```json
{
  "dependencies": {
    "react": "^19",
    "react-dom": "^19",
    "@react-three/fiber": "^9",
    "@react-three/drei": "^10",
    "three": "^0.175",
    "zustand": "^5",
    "antd": "^5",
    "allotment": "^1"
  },
  "devDependencies": {
    "vite": "^6",
    "@types/three": "^0.175",
    "typescript": "^5"
  }
}
```

### 4.3 架构设计

```
┌─────────────────────────────────────────────────┐
│                  React App                       │
│  ┌──────────────┐  ┌──────────────────────────┐ │
│  │  Editor UI   │  │     3D Viewport          │ │
│  │  (Ant Design)│  │  (React Three Fiber)     │ │
│  │              │  │                          │ │
│  │ ┌──────────┐ │  │  ┌────────────────────┐  │ │
│  │ │场景树     │ │  │  │ OrbitControls      │  │ │
│  │ │属性面板   │ │  │  │ TransformControls  │  │ │
│  │ │工具栏     │ │  │  │ GLTF Models        │  │ │
│  │ │导出按钮   │ │  │  │ Grid Reference     │  │ │
│  │ └──────────┘ │  │  └────────────────────┘  │ │
│  └──────────────┘  └──────────────────────────┘ │
│         │                    │                   │
│         └────────┬───────────┘                   │
│                  ▼                               │
│           Zustand Store                          │
│     (Scene State + Serialization)                │
└─────────────────────────────────────────────────┘
```

### 4.4 数据模型

#### 场景数据结构

```typescript
interface SceneData {
  version: string;
  objects: SceneObject[];
  camera: CameraState;
}

interface SceneObject {
  id: string;
  name: string;
  gltfUrl: string;
  transform: Transform3D;
  visible: boolean;
  locked: boolean;
}

interface Transform3D {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
}
```

#### Zustand Store 设计

```typescript
interface SceneStore {
  objects: SceneObject[];
  selectedId: string | null;
  transformMode: 'translate' | 'rotate' | 'scale';
  camera: CameraState;

  addObject: (obj: SceneObject) => void;
  removeObject: (id: string) => void;
  updateTransform: (id: string, transform: Partial<Transform3D>) => void;
  selectObject: (id: string | null) => void;
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => void;

  exportScene: () => SceneData;
  importScene: (data: SceneData) => void;
  exportGLTF: () => Promise<ArrayBuffer>;
}
```

### 4.5 关键技术点

#### GLTF 模型加载

- 使用 `@react-three/drei` 的 `useGLTF` Hook 加载模型
- 支持 URL 加载和本地文件上传（FileReader → ObjectURL）
- 加载过程显示进度条

#### 物体变换控制

- 使用 `@react-three/drei` 的 `TransformControls`
- 支持 translate / rotate / scale 三种模式切换
- 变换过程中实时同步到 Zustand Store 和属性面板

#### 场景序列化

- **JSON 序列化**：Zustand state → `SceneData` JSON → 下载/存储
- **GLTF 导出**：Three.js `GLTFExporter` → 标准 GLTF 二进制文件
- **JSON 加载**：JSON → 恢复 Zustand state → R3F 重新渲染

#### 光照策略

- 无需复杂光照，使用简单环境光 + 方向光即可
- 材质可使用 `MeshStandardMaterial` 保证模型基本外观
- 背景使用纯色或简单渐变

---

## 5. 非功能需求

| 维度 | 要求 |
|------|------|
| 浏览器兼容 | Chrome 90+、Edge 90+、Safari 15+（需支持 WebGL 2） |
| 性能 | 单场景支持 50+ 模型流畅交互（60fps） |
| 模型大小 | 单个 GLTF 模型 ≤ 50MB，总场景 ≤ 200MB |
| 响应时间 | 模型加载 ≤ 3s（10MB 模型），变换操作 ≤ 16ms |
| 数据安全 | 场景数据可本地存储，不强制上传服务器 |

---

## 6. 里程碑规划

| 阶段 | 内容 | 交付物 |
|------|------|--------|
| M1 — 基础框架 | 项目脚手架、编辑器布局、3D 视口、OrbitControls | 可运行的空场景编辑器 |
| M2 — 核心编辑 | GLTF 导入、TransformControls、物体选择、属性面板 | 可拖拽摆放模型的原型 |
| M3 — 数据持久化 | 场景 JSON 序列化/反序列化、GLTF 导出 | 可保存和导出场景 |
| M4 — 体验优化 | 场景树、撤销/重做、模型库、快捷键 | 可日常使用的编辑器 |
| M5 — 增强功能 | 多选、视角预设、截图、图层 | 功能完整的导演台 |
