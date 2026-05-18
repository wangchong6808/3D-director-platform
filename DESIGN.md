# 3D 导演台 — 详细设计文档

> 基于 PRD.md，借鉴 leva 等成熟三方库能力，面向实现的设计文档。

---

## 1. 架构总览

```
┌──────────────────────────────────────────────────────────────┐
│                        App.tsx                               │
│  ┌─────────┐  ┌──────────────────────────┐  ┌─────────────┐ │
│  │ Toolbar  │  │       Allotment           │  │  StatusBar  │ │
│  │          │  │  ┌──────────┬───────────┐ │  │             │ │
│  │ W/E/R/G  │  │  │ SceneTree│  Viewport  │ │  │ 选中数      │ │
│  │ 撤销/重做│  │  │          │  ┌───────┐ │ │  │ 模式/网格   │ │
│  │ 保存/导出│  │  │ 树形列表 │  │Canvas │ │ │  │ 日志       │ │
│  │ 导入     │  │  │ 拖拽排序 │  │ R3F   │ │ │  │             │ │
│  └─────────┘  │  │          │  │ThreeJS│ │ │  └─────────────┘ │
│               │  │          │  └───────┘ │ │                  │
│               │  ├──────────┴───────────┤ │                  │
│               │  │    PropertyPanel      │ │                  │
│               │  │  ┌─────────────────┐  │ │                  │
│               │  │  │  leva (flat)    │  │ │                  │
│               │  │  │  useControls()  │  │ │                  │
│               │  │  │  动态属性面板   │  │ │                  │
│               │  │  └─────────────────┘  │ │                  │
│               │  └──────────────────────┘ │                  │
│               └──────────────────────────┘                  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │            useKeyboardShortcuts (全局 Hook)             │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              sceneStore (Zustand)                        │  │
│  │  objects[] / selectedId / tool / showGrid / history[]   │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 分层设计

| 层级 | 职责 | 核心模块 |
|------|------|----------|
| 布局层 | 面板分割、拖拽调整大小 | allotment, App.tsx |
| UI 层 | 工具栏、场景树、状态栏 | Ant Design |
| 属性面板层 | 动态控件、颜色选择器、滑块 | **leva** (useControls + Leva flat) |
| 渲染层 | 3D 场景渲染、光线、网格、Gizmo | R3F + Three.js + Drei |
| 状态层 | 场景数据、选中态、历史栈、工具模式 | Zustand |
| 工具层 | 序列化、导入导出、示例场景、日志 | utils/* |

---

## 2. 核心三方库

### 2.1 leva — 属性面板

[leva](https://github.com/pmndrs/leva) 是 pmndrs 生态下的 React GUI 控件库，专为创意编程和 3D 场景设计。它提供的 `useControls` hook 能以极简代码生成包含滑块、颜色选择器、开关、下拉菜单等控件的属性面板。

**leva 在项目中的角色：替代手工搭建的 PropertyPanel 表单。**

| 能力 | leva 提供的控件 | 传统方式 (Ant Design) |
|------|----------------|----------------------|
| 数值输入 | `{ value: { value: 0, min: -10, max: 10, step: 0.1 } }` | InputNumber + 手动绑定 |
| 颜色选择 | `{ color: '#ff0000' }` → 内置拾色器 | ColorPicker 组件 |
| 布尔开关 | `{ visible: true }` → 自动 Switch | Switch 组件 |
| 下拉选择 | `{ tool: { value: 'translate', options: [...] } }` | Select 组件 |
| 文本输入 | `{ name: 'box_1' }` → 自动 Input | Input 组件 |
| 分组折叠 | `{ Transform: { x: 0, y: 0, z: 0 } }` | 手写 Collapse + Form |
| 拖拽滑块 | 所有数值自带拖拽调节 | 需额外实现 |

**使用方式：**

```typescript
// PropertyPanel.tsx — 用 leva 动态生成属性面板
import { Leva, useControls, folder } from 'leva';
import { useStore } from '../../store/sceneStore';

function PropertyPanel() {
  const selectedId = useStore(s => s.selectedId);
  const object = useStore(s => s.objects.find(o => o.id === selectedId));

  // leva flat 模式嵌入面板区域
  return (
    <div className="property-panel">
      <Leva flat collapsed={false} />
      {object ? <ObjectControls object={object} /> : <EmptyState />}
    </div>
  );
}

function ObjectControls({ object }: { object: SceneObject }) {
  const updateObject = useStore(s => s.updateObject);
  const updateTransform = useStore(s => s.updateTransform);
  const bringToFront = useStore(s => s.bringToFront);
  // ...

  useControls(() => ({
    '基本信息': folder({
      name: {
        value: object.name,
        onChange: (v) => updateObject(object.id, { name: v }),
      },
      kind: {
        value: object.kind,
        disabled: true,        // 类型只读
      },
    }),
    '变换': folder({
      '位置 X': {
        value: object.position.x,
        min: -50, max: 50, step: 0.1,
        onChange: (v) => updateTransform(object.id, { ...object.position, x: v }),
      },
      '位置 Y': {
        value: object.position.y,
        min: -50, max: 50, step: 0.1,
        onChange: (v) => updateTransform(object.id, { ...object.position, y: v }),
      },
      '位置 Z': {
        value: object.position.z,
        min: -50, max: 50, step: 0.1,
        onChange: (v) => updateTransform(object.id, { ...object.position, z: v }),
      },
      // 旋转、缩放同理...
    }),
    '外观': folder({
      color: {
        value: object.color,
        onChange: (v) => updateObject(object.id, { color: v }),
      },
      visible: {
        value: object.visible,
        onChange: (v) => updateObject(object.id, { visible: v }),
      },
      locked: {
        value: object.locked,
        onChange: (v) => updateObject(object.id, { locked: v }),
      },
    }),
    '遮挡': folder({
      occlusionIndex: {
        value: object.occlusionIndex,
        disabled: true,
      },
    }),
  }), [object]);

  return null; // leva 控件由 Leva 面板渲染
}
```

**关键注意点：**
- `useControls` 的 schema 依赖 `object`，必须在 deps 数组中传入 `[object]`，选中物体切换时控件自动重建。
- leva flat 模式嵌入 DOM 节点，与 allotment 面板布局兼容。
- leva 本身暗色主题，与编辑器整体风格一致。

### 2.2 react-three-fiber + @react-three/drei — 3D 渲染

文章中的核心结论：

> "用声明式的语法，配合可复用、自包含的组件来创建可以根据状态响应的可轻松交互的三维场景"
> "任何在 Three.js 中可以用的，在 react-three-fiber 中都可以用，没有任何例外"
> "组件的渲染是在 React 之外的。基于 React 的调度能力，它在某些方面的性能还优于直接使用 Three.js"

项目依赖 Drei 提供的现成组件：

| Drei 组件 | 用途 |
|-----------|------|
| `OrbitControls` | 相机轨道控制（旋转/平移/缩放） |
| `TransformControls` | 物体移动/旋转/缩放 Gizmo |
| `Grid` | 无限参考网格 |
| `GizmoHelper` / `GizmoViewport` | 方位轴指示器 |
| `useGLTF` | GLTF/GLB 模型加载 |
| `useCursor` | 悬停鼠标样式 |

### 2.3 Zustand — 状态管理

文章提及 GPT 推荐技术栈中包含 zustand。轻量、无 Provider、选择器模式与 R3F 天然契合。

### 2.4 物体几何体策略

文章指出 GLM5.1 生成的角色模型"更可能只是由一些基础几何体组合而成，比如球体、圆柱体、胶囊体、关节结构、简单层级组合"。项目中的常见物体（人物、房子、桌子等）同样采用 Three.js 基础几何体组合而成，无需外部模型文件。

---

## 3. 组件树

```
App
├── Toolbar
│   ├── ModeButtons         (W-移动 / E-旋转 / R-缩放)
│   ├── GridToggle          (G-网格显隐)
│   ├── UndoRedoButtons     (撤销 / 重做)
│   ├── FileActions         (导入GLTF / 保存JSON / 加载JSON / 导出GLB)
│   └── ExampleSceneMenu    (6 个示例场景)
│
├── Allotment (三区可拖拽布局)
│   ├── SceneTree (左侧面板)
│   │   ├── SearchInput
│   │   ├── TreeView        (Ant Design Tree)
│   │   └── OcclusionToolbar (置顶 / 上移 / 下移 / 置底)
│   │
│   ├── Viewport (中央主区)
│   │   ├── R3F Canvas
│   │   │   ├── ambientLight + directionalLight
│   │   │   ├── Grid               (Drei, 受 showGrid 控制)
│   │   │   ├── GizmoHelper        (Drei, 方位指示)
│   │   │   ├── OrbitControls      (Drei, 轨道控制)
│   │   │   ├── SceneObject3D[]    (场景物体)
│   │   │   └── TransformControls  (Drei, 附着于选中物体)
│   │   └── SelectionHelper        (raycasting 点击选中)
│   │
│   └── PropertyPanel (右侧面板)
│       ├── <Leva flat collapsed={false} />   ← leva 渲染目标
│       └── <ObjectControls />                ← useControls 动态 schema
│           ├── 基本信息 (folder)
│           ├── 变换     (folder)
│           ├── 外观     (folder)
│           └── 遮挡     (folder)
│
└── StatusBar
    ├── SelectedCount
    ├── CurrentTool
    ├── GridStatus
    └── LogMessage
```

---

## 4. 核心类型定义

```typescript
// types.ts

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

type EditorTool = 'translate' | 'rotate' | 'scale';

type ObjectKind =
  | 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus'
  | 'person' | 'house' | 'table' | 'chair' | 'cup'
  | 'tree' | 'car' | 'sofa' | 'bed' | 'fence';

interface SceneObject {
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

interface SceneData {
  version: string;
  objects: SceneObject[];
  metadata: {
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface HistoryEntry {
  type: 'add' | 'remove' | 'transform' | 'property';
  timestamp: number;
  patches: ScenePatch[];
}

interface ScenePatch {
  op: 'add' | 'remove' | 'replace';
  path: string;
  value?: unknown;
  oldValue?: unknown;
}
```

---

## 5. 状态管理

### 5.1 Store 结构

```typescript
// store/sceneStore.ts
interface SceneStore {
  objects: SceneObject[];
  selectedId: string | null;
  tool: EditorTool;
  showGrid: boolean;
  sceneName: string;
  history: HistoryEntry[];
  historyIndex: number;

  // 物体操作
  addObject: (kind: ObjectKind, position?: Vec3) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  updateObject: (id: string, patch: Partial<SceneObject>) => void;
  updateTransform: (id: string, position?: Vec3, rotation?: Vec3, scale?: Vec3) => void;

  // 编辑器
  setTool: (tool: EditorTool) => void;
  toggleGrid: () => void;

  // 历史
  undo: () => void;
  redo: () => void;
  pushHistory: (entry: HistoryEntry) => void;

  // 遮挡
  bringToFront: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  sendToBack: (id: string) => void;

  // 序列化
  loadScene: (data: SceneData) => void;
  getSceneData: () => SceneData;
  clearScene: () => void;
}
```

### 5.2 历史栈

```
        historyIndex
            │
            ▼
  ┌───┬───┬───┬───┬───┬───┐
  │ 0 │ 1 │ 2 │ 3 │   │   │   history[]  maxLength=50
  └───┴───┴───┴───┴───┴───┘
            ▲           ▲
        current     maxLength=50

规则：
1. 新操作 → historyIndex++，截断后续条目
2. 超过 50 → shift 最早条目，historyIndex--
3. undo → 应用逆补丁，historyIndex--
4. redo → 应用正补丁，historyIndex++
```

### 5.3 数据流

```
用户交互 (点击/拖拽/快捷键/leva onChange)
       │
       ▼
┌──────────────┐     ┌──────────────────┐
│  组件层       │────▶│  sceneStore      │
│  Toolbar     │     │  .addObject()    │
│  SceneTree   │     │  .updateObject() │
│  leva onChange│    │  .removeObject() │
│  Viewport    │     │  .undo()/.redo() │
│  Gizmo       │     └────────┬─────────┘
└──────────────┘              │
                              ▼
                    ┌──────────────────┐
                    │  Zustand 通知     │
                    │  订阅组件 re-render│
                    └────────┬─────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                 ▼
     SceneTree 更新    Viewport 更新    leva 控件重建
     (物体列表刷新)   (3D 物体增删/变换)  (useControls deps 触发)
```

**leva 与 Store 的同步链路：**

```
用户在 leva 滑块拖拽位置 X
    │
    ▼
useControls onChange → store.updateTransform(id, newPosition)
    │
    ▼
Zustand 更新 objects[] 中对应 object.position
    │
    ├──▶ Viewport 订阅 → SceneObject3D 重新渲染 (mesh.position 变化)
    │
    └──▶ leva useControls deps=[object] → 控件值与 store 保持一致
```

---

## 6. 3D 渲染管线

### 6.1 Canvas 配置

```typescript
<Canvas
  shadows
  camera={{ position: [8, 6, 8], fov: 50, near: 0.1, far: 1000 }}
  gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
>
```

### 6.2 渲染层级

```
R3F Canvas
├── <ambientLight intensity={0.4} />
├── <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
├── <Grid />                           ← Drei, showGrid 控制
├── <GizmoHelper alignment="bottom-right" />
├── <OrbitControls enableDamping dampingFactor={0.1} />
├── {objects.map(obj => (
│     <SceneObject3D key={obj.id} object={obj} />
│   ))}
└── {selectedId && !locked && (
      <TransformControls
        mode={tool}
        object={selectedObjectRef}
        space={tool === 'scale' ? 'local' : 'world'}
        onObjectChange={handleTransform}
      />
    )}
```

### 6.3 物体渲染策略

| ObjectKind | 渲染方式 | 几何体参数 |
|------------|----------|------------|
| box | `<boxGeometry>` | [1, 1, 1] |
| sphere | `<sphereGeometry>` | [0.5, 32, 32] |
| cylinder | `<cylinderGeometry>` | [0.5, 0.5, 1, 32] |
| cone | `<coneGeometry>` | [0.5, 1, 32] |
| torus | `<torusGeometry>` | [0.5, 0.2, 16, 32] |
| person/house/... | 组合几何体 Group | 多 mesh 组合 |
| GLTF 导入 | `useGLTF` | modelPath/modelData |

### 6.4 选中与高亮

```
选中态表现：
  - TransformControls 显示 Gizmo（箭头/弧线/方块）
  - SceneTree 节点高亮
  - leva 属性面板显示该物体控件

选中流程：
  1. Viewport 内点击 → raycasting 命中
  2. store.selectedId 更新
  3. TransformControls 附着到选中 mesh ref
  4. PropertyPanel 中 useControls deps 变化 → 重建控件 schema
```

---

## 7. 导入导出

### 7.1 导入 GLTF/GLB

```
Toolbar "导入" → <input accept=".gltf,.glb">
  → FileReader.readAsArrayBuffer
  → store.addObject({ kind: 'imported', modelData, modelPath })
  → Viewport useGLTF 解析渲染
  → pushHistory
```

### 7.2 保存/加载 JSON

```typescript
// 保存 → 下载 .json 文件
const save = () => {
  const data = store.getSceneData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadFile(blob, `${store.sceneName}.json`);
};

// 加载 → 解析 → 恢复场景
const load = async (file: File) => {
  const data = JSON.parse(await file.text()) as SceneData;
  validateSceneData(data);
  store.loadScene(data);
};
```

### 7.3 导出 GLB

```typescript
import { GLTFExporter } from 'three-stdlib';

const exportGLB = async () => {
  const scene = buildThreeScene(store.objects);
  const glb = await new GLTFExporter().parseAsync(scene, { binary: true });
  downloadFile(new Blob([glb]), `${store.sceneName}.glb`);
};
```

---

## 8. 快捷键系统

```typescript
// App.tsx — useKeyboardShortcuts
const KEY_MAP = {
  'w':      () => store.setTool('translate'),
  'e':      () => store.setTool('rotate'),
  'r':      () => store.setTool('scale'),
  'g':      () => store.toggleGrid(),
  'Delete': () => { if (store.selectedId) store.removeObject(store.selectedId); },
  'z':      (ctrl, shift) => ctrl && !shift ? store.undo() : null,
  'Z':      (ctrl, shift) => ctrl && shift ? store.redo() : null,
  's':      (ctrl) => ctrl ? handleSave() : null,
};
// 输入框聚焦时跳过，Ctrl+S 阻止浏览器默认行为
```

---

## 9. 示例场景

| 场景 | 物体清单 | 特点 |
|------|----------|------|
| 办公室 | 桌子×4, 椅子×4, 杯子×2, 人物×2, 方块隔断 | 室内办公 |
| 客厅 | 沙发×1, 桌子×1, 椅子×2, 柜子×2 | 家具布局 |
| 街道 | 房屋×2, 汽车×2, 树木×4, 栅栏×4, 人物×1 | 户外街道 |
| 卧室 | 床×1, 柜子×2, 椅子×1, 桌子×1 | 私密空间 |
| 公园 | 树木×6, 栅栏×8, 人物×2, 椅子×3 | 自然环境 |
| 餐厅 | 桌子×4, 椅子×8, 杯子×4, 人物×3 | 公共空间 |

---

## 10. 模块接口

### 10.1 Toolbar

```
Props: 无 (直接读 store)
子模块:
  ModeButtons      → store.tool, 三个 Radio/ButtonGroup
  GridToggle       → store.showGrid, Switch
  UndoRedoButtons  → store.undo/redo, 显示剩余步数
  FileActions      → 文件选择器 / 下载触发
  ExampleSceneMenu → Dropdown, 加载示例场景
```

### 10.2 SceneTree

```
Props: 无
功能:
  - Ant Design Tree 展示 objects，按 occlusionIndex 排序
  - 点击节点 → store.selectObject(id)
  - 双击 → 重命名
  - 右键/底部按钮 → 删除、遮挡层级调整
  - 搜索框 → 前端过滤
  - 可见性/锁定图标展示
```

### 10.3 Viewport

```
Props: 无
内部:
  - R3F Canvas 包裹全部 3D 内容
  - SceneObject3D 数量 = objects.length
  - 根据 kind 选择几何体渲染
  - TransformControls 在 selectedId 存在且未锁定时显示
  - 点击空白 → selectObject(null)
  - Gizmo onObjectChange → store.updateTransform + pushHistory
```

### 10.4 PropertyPanel (leva)

```
Props: 无

结构:
  <Leva flat collapsed={false} oneLineLabels />
  └── <ObjectControls>  (useControls 动态 schema)
      ├── 基本信息 folder: name (可编辑), kind (只读)
      ├── 变换 folder:   位置 X/Y/Z, 旋转 X/Y/Z, 缩放 X/Y/Z (滑块)
      ├── 外观 folder:   颜色 (ColorPicker), 可见 (Switch), 锁定 (Switch)
      └── 遮挡 folder:   occlusionIndex (只读)

未选中时: useControls({}) → 空面板 + "请在视口或场景树中选择物体" 占位提示
```

### 10.5 StatusBar

```
Props: 无
显示:
  - 选中物体名称 + 数量
  - 当前工具模式
  - 网格状态
  - 最近日志
```

---

## 11. 测试策略

### 11.1 单元测试

| 测试对象 | 覆盖点 |
|----------|--------|
| sceneStore | add/remove/select/update 对象；undo/redo 历史栈（50 步上限、截断、边界）；遮挡层级操作；loadScene/getSceneData 往返序列化 |
| sceneUtils | JSON 序列化/反序列化；GLB 导出完整性；GLTF 导入解析；validateSceneData 校验 |
| demoScenes | 6 个场景数据完整性；字段合法性 |
| logger | 日志级别过滤 |

### 11.2 组件测试

| 测试对象 | 覆盖点 |
|----------|--------|
| Viewport + SceneObject3D | 物体渲染数量；点击选中/取消；TransformControls 模式切换 |
| Toolbar | 模式切换触发 setTool；网格切换；撤销/重做按钮状态 |
| SceneTree | 树节点数量；选中同步；遮挡操作 |
| PropertyPanel | 选中时 leva 控件展示；修改 onChange 触发 store 更新；未选中占位 |

### 11.3 工具链

| 工具 | 用途 |
|------|------|
| Vitest | 测试运行器 |
| @testing-library/react | 组件渲染 |
| @testing-library/jest-dom | DOM 断言 |
| jsdom | DOM 环境 |

---

## 12. 文件结构

```
src/
├── main.tsx
├── App.tsx
├── App.css
├── types.ts
│
├── store/
│   ├── sceneStore.ts
│   └── __tests__/
│       └── sceneStore.test.ts
│
├── components/
│   ├── editor/
│   │   ├── Toolbar.tsx
│   │   ├── SceneTree.tsx
│   │   ├── PropertyPanel.tsx     ← <Leva flat> + useControls
│   │   ├── StatusBar.tsx
│   │   └── __tests__/
│   │       ├── Toolbar.test.tsx
│   │       ├── SceneTree.test.tsx
│   │       ├── PropertyPanel.test.tsx
│   │       └── StatusBar.test.tsx
│   │
│   └── viewport/
│       ├── Viewport.tsx
│       ├── SceneObject3D.tsx
│       └── __tests__/
│           ├── Viewport.test.tsx
│           └── SceneObject3D.test.tsx
│
├── utils/
│   ├── sceneUtils.ts
│   ├── demoScenes.ts
│   ├── logger.ts
│   ├── keyboardShortcuts.ts
│   └── __tests__/
│       ├── sceneUtils.test.ts
│       ├── demoScenes.test.ts
│       └── logger.test.ts
│
└── assets/
```

---

## 13. 关键设计决策

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 属性面板 | **leva** (useControls + flat) | 开箱即用的滑块/颜色选择器/开关/分组折叠，专为 3D 场景参数设计，替代手写 Ant Design 表单 |
| 状态管理 | Zustand | 轻量、无 Provider、selector 模式、与 R3F + leva 生态一致 |
| 3D 框架 | R3F + Drei | React 声明式操作 Three.js，Drei 提供 OrbitControls/TransformControls/Grid/Gizmo |
| UI 组件 | Ant Design | 主要供给 SceneTree (Tree) 和 Toolbar (Button/Dropdown)，属性面板由 leva 负责 |
| 布局 | allotment | 可拖拽分隔面板，leva flat 嵌入右侧区域 |
| 历史栈 | Patch-based (JSON Pointer) | 细粒度 undo/redo，内存可控 |
| 坐标系 | 移动/旋转用世界，缩放用局部 | 直觉正确，避免斜切 |
| ID | nanoid | 短、安全、低碰撞 |
| 常见物体 | 基础几何体组合 Group | 参考文章结论，GLM 模型也是几何体组合，无需外部文件 |
| leva flat | 嵌入 allotment 面板 | 保持编辑器统一布局，避免浮动面板遮挡视口 |