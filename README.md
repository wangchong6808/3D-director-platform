# 3D 导演台 (3D Director Platform)

Web 端 3D 场景编辑/布景工具，用于在浏览器中摆放、调整模型的空间位置关系，支持场景的序列化保存与导出。

## 功能特性

- **3D 视口**：Three.js Canvas + OrbitControls 轨道控制 + 无限网格 + 方位轴 Gizmo
- **物体变换**：TransformControls 支持移动/旋转/缩放三种模式，移动和旋转使用世界坐标系，缩放使用局部坐标系
- **基础几何体**：方块、球体、圆柱、圆锥、圆环
- **常见物体**：人物、房子、桌子、椅子、杯子、树木、汽车、沙发、床、栅栏
- **GLTF 导入**：支持导入 .gltf / .glb 模型文件
- **颜色修改**：通过颜色选择器实时修改物体颜色
- **遮挡层级**：支持置顶/上移/下移/置底，调整物体间遮挡关系
- **场景序列化**：保存为 JSON / 从 JSON 加载
- **GLTF 导出**：导出标准 GLTF 二进制文件
- **撤销/重做**：支持 50 步操作历史
- **示例场景**：内置 6 个电影典型场景（办公室、客厅、街道、卧室、公园、餐厅）
- **快捷键**：W/E/R 切换模式，G 切换网格，Ctrl+Z/Ctrl+Shift+Z 撤销重做，Ctrl+S 保存

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 3D 引擎 | Three.js | ^0.175 |
| React 3D 渲染 | React Three Fiber | ^9 |
| 3D 工具库 | @react-three/drei | ^10 |
| 前端框架 | React | ^19 |
| 状态管理 | Zustand | ^5 |
| UI 组件库 | Ant Design | ^5 |
| 编辑器布局 | allotment | ^1 |
| 构建工具 | Vite | ^6 |
| 语言 | TypeScript | ^5 |

## 前置条件

- Node.js v24.14.0（推荐使用 nvm 管理）
- npm v11+

## 快速开始

```bash
# 进入项目目录
cd 3D-director-platform

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

启动后访问 http://localhost:5173/

## 常用命令

| 命令 | 用途 |
|------|------|
| `npm run dev` | 启动开发服务器（HMR 热更新） |
| `npm run build` | 生产构建（TypeScript 编译 + Vite 打包） |
| `npm run preview` | 预览构建产物 |

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| W | 切换到移动模式 |
| E | 切换到旋转模式 |
| R | 切换到缩放模式 |
| G | 切换网格显隐 |
| Delete | 删除选中物体 |
| Ctrl+Z | 撤销 |
| Ctrl+Shift+Z | 重做 |
| Ctrl+S | 保存场景 |

## 项目结构

```
3D-director-platform/
├── PRD.md                              # 产品需求文档
├── index.html                          # 入口 HTML
├── package.json                        # 项目配置
├── vite.config.ts                      # Vite 配置
├── tsconfig.json                       # TypeScript 配置
└── src/
    ├── main.tsx                        # 应用入口
    ├── App.tsx                         # 主组件（布局 + 快捷键）
    ├── index.css                       # 全局样式（暗色主题）
    ├── types.ts                        # 类型定义
    ├── store/
    │   └── sceneStore.ts               # Zustand 状态管理
    ├── utils/
    │   ├── sceneUtils.ts               # 场景工具（导入/导出/序列化）
    │   ├── demoScenes.ts               # 示例场景数据
    │   └── logger.ts                   # 日志工具
    └── components/
        ├── viewport/
        │   ├── Viewport.tsx             # 3D 视口
        │   └── SceneObject3D.tsx        # 场景物体
        └── editor/
            ├── Toolbar.tsx             # 工具栏
            ├── SceneTree.tsx           # 场景树面板
            ├── PropertyPanel.tsx       # 属性面板
            └── StatusBar.tsx           # 状态栏
```
