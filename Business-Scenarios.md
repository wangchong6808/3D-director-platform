# 3D 导演台 — BDD 需求场景文档

> 采用 Given-When-Then 格式，覆盖全部功能模块的行为规格。每个场景可独立作为验收标准与自动化测试依据。

---

## Feature: 场景物体管理

作为 3D 场景编辑器的用户，我希望能够向场景中添加、选择、修改和删除物体，以便搭建我需要的三维布景。

### Scenario: 添加基础几何体到空场景

- **ID:** SCN-ADD-001
- **Given** 场景中没有物体
- **When** 用户添加一个 box 几何体
- **Then** 场景中物体数量为 1
- **And** 该物体的 kind 为 "box"
- **And** 该物体的 id 为非空字符串
- **And** 该物体的 position 为 { x: 0, y: 0, z: 0 }
- **And** 该物体的 rotation 为 { x: 0, y: 0, z: 0 }
- **And** 该物体的 scale 为 { x: 1, y: 1, z: 1 }
- **And** 该物体的 color 为预设默认颜色
- **And** 该物体的 visible 为 true
- **And** 该物体的 locked 为 false

### Scenario: 添加物体到指定位置

- **ID:** SCN-ADD-002
- **Given** 场景中没有物体
- **When** 用户添加一个 sphere 几何体，并指定位置为 { x: 5, y: 2, z: -3 }
- **Then** 该物体的 position.x 为 5
- **And** 该物体的 position.y 为 2
- **And** 该物体的 position.z 为 -3
- **And** 该物体的 rotation 和 scale 保持默认值

### Scenario: 添加物体后自动选中

- **ID:** SCN-ADD-003
- **Given** 场景中没有物体
- **When** 用户添加一个 box 几何体
- **Then** 当前选中的物体 id 等于新添加物体的 id

### Scenario: 添加物体后记录历史

- **ID:** SCN-ADD-004
- **Given** 场景中没有物体
- **When** 用户添加一个 box 几何体
- **Then** 历史栈中有 1 条记录
- **And** 该历史记录的类型为 "add"
- **And** 历史指针指向第 0 条记录

### Scenario: 连续添加物体时遮挡层级自动递增

- **ID:** SCN-ADD-005
- **Given** 场景中已有一个物体，其 occlusionIndex 为 0
- **When** 用户再添加一个 sphere 几何体
- **Then** 新物体的 occlusionIndex 为 1

### Scenario: 添加所有五种基础几何体

- **ID:** SCN-ADD-006
- **Given** 场景中没有物体
- **When** 用户依次添加 box、sphere、cylinder、cone、torus
- **Then** 场景中物体数量为 5
- **And** 每个物体的 kind 分别为 "box"、"sphere"、"cylinder"、"cone"、"torus"

### Scenario: 添加所有十种常见物体

- **ID:** SCN-ADD-007
- **Given** 场景中没有物体
- **When** 用户依次添加 person、house、table、chair、cup、tree、car、sofa、bed、fence
- **Then** 场景中物体数量为 10
- **And** 每个物体的 kind 与添加时指定的一致

### Scenario: 添加导入的 GLTF 模型物体

- **ID:** SCN-ADD-008
- **Given** 用户有一个名为 "test.glb" 的模型文件数据
- **When** 用户导入该模型并添加到场景
- **Then** 新物体的 modelPath 为 "test.glb"
- **And** 新物体的 modelData 非空

### Scenario: 添加物体时自动生成名称

- **ID:** SCN-ADD-009
- **Given** 场景中没有物体
- **When** 用户添加一个 box 几何体
- **Then** 该物体的 name 包含 "box" 字样

### Scenario: 连续添加同类型物体时名称不重复

- **ID:** SCN-ADD-010
- **Given** 场景中没有物体
- **When** 用户连续添加三个 box 几何体
- **Then** 三个物体的 name 互不相同

---

### Scenario: 删除当前选中的物体

- **ID:** SCN-DEL-001
- **Given** 场景中有物体 A（已选中）和物体 B
- **When** 用户删除物体 A
- **Then** 场景中物体数量为 1
- **And** 当前选中的物体 id 为 null
- **And** 剩余的物体为 B

### Scenario: 删除非选中的物体不影响选中状态

- **ID:** SCN-DEL-002
- **Given** 场景中有物体 A 和物体 B，其中 B 为选中状态
- **When** 用户删除物体 A
- **Then** 场景中物体数量为 1
- **And** 当前选中的物体 id 仍为 B 的 id

### Scenario: 删除物体后记录历史

- **ID:** SCN-DEL-003
- **Given** 场景中有一个物体 A，历史栈有 1 条记录
- **When** 用户删除物体 A
- **Then** 历史栈有 2 条记录
- **And** 最新历史记录的类型为 "remove"
- **And** 历史指针递增 1

### Scenario: 删除物体后遮挡层级重新排列

- **ID:** SCN-DEL-004
- **Given** 场景中有 A(occlusionIndex=0)、B(occlusionIndex=1)、C(occlusionIndex=2)
- **When** 用户删除物体 B
- **Then** A 的 occlusionIndex 为 0
- **And** C 的 occlusionIndex 为 1

### Scenario: 删除不存在的物体不产生副作用

- **ID:** SCN-DEL-005
- **Given** 场景中有一个物体 A(id="a")
- **When** 用户尝试删除 id 为 "nonexistent" 的物体
- **Then** 场景中物体数量保持为 1
- **And** 不抛出异常
- **And** 历史栈不增加新记录

---

### Scenario: 选中一个存在的物体

- **ID:** SCN-SEL-001
- **Given** 场景中有物体 A(id="a")
- **When** 用户选中物体 A
- **Then** 当前选中的物体 id 为 "a"

### Scenario: 取消选中

- **ID:** SCN-SEL-002
- **Given** 当前选中的物体 id 为 "a"
- **When** 用户点击空白区域（传入 null）
- **Then** 当前选中的物体 id 为 null

### Scenario: 选中已被锁定的物体

- **ID:** SCN-SEL-003
- **Given** 场景中有物体 A(id="a", locked=true)
- **When** 用户选中物体 A
- **Then** 当前选中的物体 id 为 "a"
- **And** 属性面板可以查看该物体属性

### Scenario: 选中不可见的物体

- **ID:** SCN-SEL-004
- **Given** 场景中有物体 A(id="a", visible=false)
- **When** 用户选中物体 A
- **Then** 当前选中的物体 id 为 "a"
- **And** 属性面板可以查看和修改该物体属性

### Scenario: 选中不存在的 id 不改变当前选中

- **ID:** SCN-SEL-005
- **Given** 当前选中的物体 id 为 "a"
- **When** 用户尝试选中 id 为 "nonexistent" 的物体
- **Then** 当前选中的物体 id 保持为 "a"

---

### Scenario: 更新物体的名称

- **ID:** SCN-UPD-001
- **Given** 场景中有物体 A(name="old_name")
- **When** 用户将 A 的名称修改为 "new_name"
- **Then** 物体 A 的 name 为 "new_name"
- **And** 物体 A 的其他字段保持不变

### Scenario: 更新物体的颜色

- **ID:** SCN-UPD-002
- **Given** 场景中有物体 A(color="#ff0000")
- **When** 用户将 A 的颜色修改为 "#00ff00"
- **Then** 物体 A 的 color 为 "#00ff00"

### Scenario: 将物体设置为不可见

- **ID:** SCN-UPD-003
- **Given** 场景中有物体 A(visible=true)
- **When** 用户将 A 的 visible 切换为 false
- **Then** 物体 A 的 visible 为 false
- **And** 视口中该物体不再渲染

### Scenario: 将物体设置为锁定

- **ID:** SCN-UPD-004
- **Given** 场景中有物体 A(locked=false)
- **When** 用户将 A 的 locked 切换为 true
- **Then** 物体 A 的 locked 为 true
- **And** 视口中选中该物体时不显示 TransformControls

### Scenario: 批量更新物体的多个属性

- **ID:** SCN-UPD-005
- **Given** 场景中有物体 A
- **When** 用户同时修改 A 的 name 为 "X"、color 为 "#000000"、visible 为 false
- **Then** 物体 A 的 name 为 "X"
- **And** 物体 A 的 color 为 "#000000"
- **And** 物体 A 的 visible 为 false
- **And** 物体 A 的其他字段保持不变

### Scenario: 更新物体属性后记录历史

- **ID:** SCN-UPD-006
- **Given** 场景中有物体 A(name="old")
- **When** 用户将 A 的名称修改为 "new"
- **Then** 历史栈新增一条类型为 "property" 的记录
- **And** 该记录的 patch 中包含 oldValue "old" 和 newValue "new"

---

### Scenario: 更新物体的位置

- **ID:** SCN-TRF-001
- **Given** 场景中有物体 A(position={0,0,0})
- **When** 用户拖拽 Gizmo 将 A 移动到 position { x:10, y:0, z:-5 }
- **Then** 物体 A 的 position.x 为 10
- **And** 物体 A 的 position.y 为 0
- **And** 物体 A 的 position.z 为 -5
- **And** 物体 A 的 rotation 和 scale 保持不变

### Scenario: 更新物体的旋转

- **ID:** SCN-TRF-002
- **Given** 场景中有物体 A(rotation={0,0,0})
- **When** 用户拖拽旋转 Gizmo 将 A 绕 Y 轴旋转 180 度
- **Then** 物体 A 的 rotation.y 约为 Math.PI
- **And** 物体 A 的 position 和 scale 保持不变

### Scenario: 更新物体的缩放

- **ID:** SCN-TRF-003
- **Given** 场景中有物体 A(scale={1,1,1})
- **When** 用户拖拽缩放 Gizmo 将 A 缩放为 {2,2,2}
- **Then** 物体 A 的 scale.x 为 2
- **And** 物体 A 的 scale.y 为 2
- **And** 物体 A 的 scale.z 为 2

### Scenario: 仅更新位置 X 轴不影响 Y 和 Z

- **ID:** SCN-TRF-004
- **Given** 场景中有物体 A(position={1,2,3})
- **When** 用户仅修改 A 的 position.x 为 99
- **Then** 物体 A 的 position.x 为 99
- **And** 物体 A 的 position.y 为 2
- **And** 物体 A 的 position.z 为 3

### Scenario: 变换操作后记录历史

- **ID:** SCN-TRF-005
- **Given** 场景中有物体 A(position={0,0,0})
- **When** 用户将 A 移动到 position {x:5}
- **Then** 历史栈新增一条类型为 "transform" 的记录
- **And** 该记录包含变换前后的位置快照

---

### Scenario: 将物体置顶

- **ID:** SCN-OCC-001
- **Given** 场景中有 A(oi=0)、B(oi=1)、C(oi=2)
- **When** 用户将物体 A 置顶
- **Then** A.occlusionIndex 变为所有物体中最大
- **And** B.occlusionIndex 为 1
- **And** C.occlusionIndex 为 2

### Scenario: 将物体置底

- **ID:** SCN-OCC-002
- **Given** 场景中有 A(oi=0)、B(oi=1)、C(oi=2)
- **When** 用户将物体 C 置底
- **Then** C.occlusionIndex 变为 0
- **And** A.occlusionIndex 为 1
- **And** B.occlusionIndex 为 2

### Scenario: 将物体上移一层

- **ID:** SCN-OCC-003
- **Given** 场景中有 A(oi=0)、B(oi=1)
- **When** 用户将物体 A 上移一层
- **Then** A.occlusionIndex 为 1
- **And** B.occlusionIndex 为 0

### Scenario: 将物体下移一层

- **ID:** SCN-OCC-004
- **Given** 场景中有 A(oi=0)、B(oi=1)
- **When** 用户将物体 B 下移一层
- **Then** B.occlusionIndex 为 0
- **And** A.occlusionIndex 为 1

### Scenario: 已将顶部的物体再次置顶无变化

- **ID:** SCN-OCC-005
- **Given** 场景中有 A(oi=2)、B(oi=0)、C(oi=1)，A 已是最顶层
- **When** 用户将物体 A 置顶
- **Then** A.occlusionIndex 保持为最大
- **And** B 和 C 的 occlusionIndex 不变

### Scenario: 已将底部的物体再次置底无变化

- **ID:** SCN-OCC-006
- **Given** 场景中仅有一个物体 A(oi=0)
- **When** 用户将物体 A 置底
- **Then** A.occlusionIndex 保持为 0

### Scenario: 遮挡操作后记录历史

- **ID:** SCN-OCC-007
- **Given** 场景中有 A(oi=0)、B(oi=1)
- **When** 用户将物体 A 置顶
- **Then** 历史栈新增一条类型为 "property" 的记录

---

## Feature: 撤销与重做

作为 3D 场景编辑器的用户，我希望能够撤销和重做我的操作，以便安全地尝试不同的编辑，并在出错时回退到之前的状态。

### Scenario: 单步撤销恢复添加操作

- **ID:** UND-001
- **Given** 场景为空，用户添加了一个 box
- **When** 用户执行撤销操作
- **Then** 场景中物体数量恢复为 0
- **And** 历史指针为 -1

### Scenario: 撤销后可以重做

- **ID:** UND-002
- **Given** 场景为空，用户添加了一个 box 后又撤销
- **When** 用户执行重做操作
- **Then** 场景中物体数量恢复为 1
- **And** 历史指针指向第 0 条记录

### Scenario: 连续多步撤销

- **ID:** UND-003
- **Given** 用户依次添加了物体 A、B、C
- **When** 用户连续执行 3 次撤销
- **Then** 第 1 次撤销后物体数量为 2
- **And** 第 2 次撤销后物体数量为 1
- **And** 第 3 次撤销后物体数量为 0

### Scenario: 连续多步撤销后再连续重做

- **ID:** UND-004
- **Given** 用户依次添加了物体 A、B、C
- **And** 用户已执行 2 次撤销
- **When** 用户连续执行 2 次重做
- **Then** 场景中物体数量恢复为 3
- **And** 历史指针指向第 2 条记录

### Scenario: 撤销后执行新操作截断重做分支

- **ID:** UND-005
- **Given** 用户依次添加了物体 A、B
- **And** 用户撤销了一次（此时 redo 中还有 "添加 B"）
- **When** 用户添加物体 C
- **Then** "添加 B" 的重做记录被清除
- **And** 重做操作不可用
- **And** 历史指针指向最新记录

### Scenario: 空历史时执行撤销不报错

- **ID:** UND-006
- **Given** 场景为空，无任何历史记录
- **When** 用户执行撤销操作
- **Then** 不抛出异常
- **And** 场景状态保持不变

### Scenario: 无可重做记录时执行重做不报错

- **ID:** UND-007
- **Given** 用户添加了一个 box 后撤销，再重做恢复
- **When** 用户再次执行重做操作
- **Then** 不抛出异常
- **And** 场景状态保持不变

### Scenario: 撤销变换操作恢复位置

- **ID:** UND-008
- **Given** 场景中有物体 A(position={1,2,3})
- **And** 用户将 A 的 position.x 改为 10
- **When** 用户执行撤销操作
- **Then** 物体 A 的 position.x 恢复为 1

### Scenario: 撤销属性修改操作

- **ID:** UND-009
- **Given** 场景中有物体 A(color="#ff0000")
- **And** 用户将 A 的 color 改为 "#00ff00"
- **When** 用户执行撤销操作
- **Then** 物体 A 的 color 恢复为 "#ff0000"

### Scenario: 撤销删除操作恢复被删物体

- **ID:** UND-010
- **Given** 用户添加了物体 A，然后删除了 A
- **When** 用户执行撤销操作
- **Then** 场景中重新出现物体 A
- **And** A 的所有属性（position、rotation、scale、color 等）还原为删除前的状态

### Scenario: 撤销遮挡操作

- **ID:** UND-011
- **Given** 场景中有 A(oi=0)、B(oi=1)
- **And** 用户将 A 置顶（此时 A.oi=1, B.oi=0）
- **When** 用户执行撤销操作
- **Then** A.occlusionIndex 恢复为 0
- **And** B.occlusionIndex 恢复为 1

### Scenario: 历史栈只保留最近 50 步

- **ID:** UND-012
- **Given** 场景为空
- **When** 用户连续执行 51 次添加物体操作
- **Then** 历史栈中仅有 50 条记录
- **And** 最早的第 1 次添加记录已被移出
- **And** 历史指针为 49

### Scenario: 第 51 步后最多 undo 50 次

- **ID:** UND-013
- **Given** 用户已连续添加 51 个物体
- **When** 用户连续执行 50 次撤销
- **Then** 场景中剩余 1 个物体（最早的记录已被移出历史栈，无法撤销）
- **And** 历史指针为 -1

### Scenario: 第 51 步后执行第 51 次 undo 不报错

- **ID:** UND-014
- **Given** 用户已连续添加 51 个物体并撤销了 50 次
- **When** 用户执行第 51 次撤销
- **Then** 不抛出异常
- **And** 场景中仍为 1 个物体

### Scenario: 在历史栈中间位置 undo 后执行新操作

- **ID:** UND-015
- **Given** 用户依次添加了 A、B、C
- **And** 用户执行了 1 次撤销（回到 2 个物体）
- **When** 用户添加物体 D
- **Then** 之前的 "添加 C" 记录被截断
- **And** 重做操作不可用

---

## Feature: 编辑器工具模式

作为 3D 场景编辑器的用户，我希望能够切换不同的变换工具模式，以便分别控制物体的移动、旋转和缩放。

### Scenario: 切换到移动模式

- **ID:** TOL-001
- **Given** 当前工具模式为 "rotate"
- **When** 用户切换到 "translate" 模式
- **Then** 当前工具模式变为 "translate"

### Scenario: 切换到旋转模式

- **ID:** TOL-002
- **Given** 当前工具模式为 "translate"
- **When** 用户切换到 "rotate" 模式
- **Then** 当前工具模式变为 "rotate"

### Scenario: 切换到缩放模式

- **ID:** TOL-003
- **Given** 当前工具模式为 "translate"
- **When** 用户切换到 "scale" 模式
- **Then** 当前工具模式变为 "scale"

### Scenario: 切换网格显示为关

- **ID:** TOL-004
- **Given** 当前网格为显示状态
- **When** 用户切换网格显示
- **Then** 网格变为隐藏状态

### Scenario: 切换网格显示为开

- **ID:** TOL-005
- **Given** 当前网格为隐藏状态
- **When** 用户切换网格显示
- **Then** 网格变为显示状态

---

## Feature: 序列化与持久化

作为 3D 场景编辑器的用户，我希望能够保存场景为 JSON 文件并在之后加载恢复，以便在不同会话之间保留我的工作进度。

### Scenario: 导出场景为 JSON 数据

- **ID:** SER-001
- **Given** 场景中有 2 个物体，场景名称为 "my_scene"
- **When** 用户执行获取场景数据操作
- **Then** 返回的 SceneData 中 version 字段非空
- **And** objects 数组长度为 2
- **And** metadata.name 为 "my_scene"
- **And** metadata.createdAt 为合法的 ISO 8601 时间格式
- **And** metadata.updatedAt 为合法的 ISO 8601 时间格式

### Scenario: 从 JSON 数据加载场景

- **ID:** SER-002
- **Given** 有一份包含 3 个物体的合法 SceneData
- **When** 用户加载该场景数据
- **Then** 场景中物体数量为 3
- **And** 所有物体的全部字段被完整恢复
- **And** 当前选中的物体 id 为 null

### Scenario: 加载场景后清空历史

- **ID:** SER-003
- **Given** 当前有 2 条历史记录
- **When** 用户加载一份新的场景数据
- **Then** 历史栈被清空
- **And** 历史指针为 -1

### Scenario: 序列化与反序列化往返一致

- **ID:** SER-004
- **Given** 场景中包含各种 kind 的物体
- **When** 用户先导出场景数据，再加载同一份数据，再次导出
- **Then** 两次导出的 JSON 字符串完全相同

### Scenario: 清空整个场景

- **ID:** SER-005
- **Given** 场景中有 3 个物体
- **When** 用户执行清空场景操作
- **Then** 场景中物体数量为 0
- **And** 当前选中的物体 id 为 null
- **And** 历史栈被清空

### Scenario: 加载场景覆盖当前内容

- **ID:** SER-006
- **Given** 场景中有 2 个物体
- **When** 用户加载一份包含 5 个物体的场景数据
- **Then** 场景中物体数量为 5
- **And** 原来的 2 个物体不再存在

---

### Scenario: 校验缺少 version 字段的场景数据失败

- **ID:** VAL-001
- **Given** 一份只包含 objects 数组但不包含 version 字段的数据
- **When** 系统校验该场景数据
- **Then** 校验失败
- **And** 返回明确的错误信息

### Scenario: 校验 objects 不是数组的场景数据失败

- **ID:** VAL-002
- **Given** 一份 version 合法但 objects 为字符串的数据
- **When** 系统校验该场景数据
- **Then** 校验失败

### Scenario: 校验 object 缺少 id 字段的场景数据失败

- **ID:** VAL-003
- **Given** 一份 objects 数组中的物体缺少 id 字段的数据
- **When** 系统校验该场景数据
- **Then** 校验失败

### Scenario: 校验 object.position 不是合法向量的数据失败

- **ID:** VAL-004
- **Given** 一份 objects 数组中的物体 position 为字符串类型的数据
- **When** 系统校验该场景数据
- **Then** 校验失败

### Scenario: 校验合法的空场景数据通过

- **ID:** VAL-005
- **Given** 一份 version 合法、objects 为空数组、metadata 完整的数据
- **When** 系统校验该场景数据
- **Then** 校验通过

---

### Scenario: 将场景序列化为 JSON 字符串

- **ID:** JSON-001
- **Given** 一份合法的 SceneData
- **When** 系统执行序列化操作
- **Then** 返回合法的 JSON 字符串
- **And** JSON.parse 可正常解析

### Scenario: 将 JSON 字符串反序列化为场景数据

- **ID:** JSON-002
- **Given** 一段合法的场景 JSON 字符串
- **When** 系统执行反序列化操作
- **Then** 返回完整的 SceneData 对象
- **And** 所有字段完整还原

### Scenario: 序列化保留 modelData

- **ID:** JSON-003
- **Given** 场景数据中包含带有 ArrayBuffer 类型 modelData 的物体
- **When** 系统序列化后立即反序列化
- **Then** modelData 被正确编码和解码还原

### Scenario: 反序列化非法 JSON 字符串失败

- **ID:** JSON-004
- **Given** 一段非 JSON 格式的字符串
- **When** 系统执行反序列化操作
- **Then** 抛出异常

---

### Scenario: 下载 JSON 文件

- **ID:** DL-001
- **Given** 已生成场景数据的 Blob 对象
- **When** 系统触发文件下载，文件名为 "scene.json"
- **Then** 浏览器开始下载文件
- **And** 下载文件名为 "scene.json"
- **And** 下载内容与 Blob 内容一致

### Scenario: 下载 GLB 文件

- **ID:** DL-002
- **Given** 已生成 GLB 数据的 Blob 对象
- **When** 系统触发文件下载，文件名为 "scene.glb"
- **Then** 下载文件名为 "scene.glb"

### Scenario: 下载空内容不报错

- **ID:** DL-003
- **Given** 一个内容为空的 Blob 对象
- **When** 系统触发文件下载
- **Then** 不抛出异常

---

## Feature: GLTF/GLB 导入导出

作为 3D 场景编辑器的用户，我希望能够导入 GLTF/GLB 模型文件到场景中，并将当前场景导出为标准 GLB 文件。

### Scenario: 解析合法的 GLB 文件

- **ID:** GLB-001
- **Given** 一份合法的 GLB 二进制数据
- **When** 系统解析该 GLB 数据
- **Then** 返回 Three.js Scene 对象
- **And** Scene 中包含模型的所有 mesh

### Scenario: 解析非法的 GLB 数据失败

- **ID:** GLB-002
- **Given** 一段随机二进制数据（非 GLB 格式）
- **When** 系统尝试解析该数据
- **Then** 抛出异常

### Scenario: 导出空场景为 GLB

- **ID:** GLB-003
- **Given** 一个不包含任何物体的场景
- **When** 系统执行 GLB 导出
- **Then** 返回合法的 ArrayBuffer
- **And** 导出的文件可被 GLTFLoader 再次解析

### Scenario: 导出含基础几何体的场景为 GLB

- **ID:** GLB-004
- **Given** 场景中包含一个 box 物体
- **When** 系统执行 GLB 导出
- **Then** 返回合法的 ArrayBuffer
- **And** 导出内容包含该 box 的几何体数据

### Scenario: 导出含导入模型的场景为 GLB

- **ID:** GLB-005
- **Given** 场景中有一个通过 GLTF 导入的物体，其 modelData 非空
- **When** 系统执行 GLB 导出
- **Then** 导出文件包含该模型的数据

### Scenario: buildThreeScene 构建正确的 Three.js 场景

- **ID:** GLB-006
- **Given** 场景数据包含一个 box 和一个 sphere
- **When** 系统构建 Three.js Scene
- **Then** 返回的 Scene 对象中包含 2 个 mesh
- **And** 每个 mesh 的 geometry 类型与物体的 kind 匹配

---

## Feature: 示例场景

作为 3D 场景编辑器的用户，我希望能够加载预设的示例场景，以便快速了解工具能力或以此为起点进行创作。

### Scenario: 办公室场景包含必要物体

- **ID:** DEM-001
- **Given** 系统内置了办公室示例场景
- **When** 用户加载办公室场景
- **Then** 场景中物体数量大于 0
- **And** 包含桌子、椅子、杯子、人物类型的物体

### Scenario: 客厅场景包含必要物体

- **ID:** DEM-002
- **Given** 系统内置了客厅示例场景
- **When** 用户加载客厅场景
- **Then** 场景中物体数量大于 0
- **And** 包含沙发、桌子、椅子类型的物体

### Scenario: 街道场景包含必要物体

- **ID:** DEM-003
- **Given** 系统内置了街道示例场景
- **When** 用户加载街道场景
- **Then** 场景中物体数量大于 0
- **And** 包含房屋、汽车、树木、栅栏、人物类型的物体

### Scenario: 卧室场景包含必要物体

- **ID:** DEM-004
- **Given** 系统内置了卧室示例场景
- **When** 用户加载卧室场景
- **Then** 场景中物体数量大于 0
- **And** 包含床、柜子、椅子、桌子类型的物体

### Scenario: 公园场景包含必要物体

- **ID:** DEM-005
- **Given** 系统内置了公园示例场景
- **When** 用户加载公园场景
- **Then** 场景中物体数量大于 0
- **And** 包含树木、栅栏、人物、椅子类型的物体

### Scenario: 餐厅场景包含必要物体

- **ID:** DEM-006
- **Given** 系统内置了餐厅示例场景
- **When** 用户加载餐厅场景
- **Then** 场景中物体数量大于 0
- **And** 包含桌子、椅子、杯子、人物类型的物体

### Scenario: 场景中所有物体 id 唯一

- **ID:** DEM-007
- **Given** 任意一个示例场景
- **When** 检查场景中所有物体的 id
- **Then** 同一场景内不存在重复的 id

### Scenario: 场景中所有物体字段完整

- **ID:** DEM-008
- **Given** 任意一个示例场景中的任意物体
- **When** 检查该物体的结构
- **Then** 该物体具备 id、name、kind、position、rotation、scale、color、visible、locked、occlusionIndex 所有字段

### Scenario: 物体位置值为合法有限数值

- **ID:** DEM-009
- **Given** 任意一个示例场景中的任意物体
- **When** 检查该物体的 position
- **Then** position.x、position.y、position.z 均为有限数值（非 NaN、非 Infinity）

### Scenario: 物体旋转值为合法有限数值

- **ID:** DEM-010
- **Given** 任意一个示例场景中的任意物体
- **When** 检查该物体的 rotation
- **Then** rotation.x、rotation.y、rotation.z 均为有限数值

### Scenario: 物体缩放值为正数

- **ID:** DEM-011
- **Given** 任意一个示例场景中的任意物体
- **When** 检查该物体的 scale
- **Then** scale.x > 0、scale.y > 0、scale.z > 0

### Scenario: 物体颜色为合法十六进制格式

- **ID:** DEM-012
- **Given** 任意一个示例场景中的任意物体
- **When** 检查该物体的 color
- **Then** color 匹配 `^#[0-9a-fA-F]{6}$` 格式

### Scenario: 场景中遮挡层级连续且从 0 开始

- **ID:** DEM-013
- **Given** 任意一个示例场景
- **When** 按 occlusionIndex 升序排列所有物体
- **Then** occlusionIndex 依次为 0, 1, 2, ..., n-1

### Scenario: 物体 kind 为合法枚举值

- **ID:** DEM-014
- **Given** 任意一个示例场景中的任意物体
- **When** 检查该物体的 kind
- **Then** kind 为 ObjectKind 联合类型中的合法值

---

## Feature: 日志系统

作为开发者或高级用户，我希望系统具备日志功能，以便追踪操作记录和排查问题。

### Scenario: 输出 info 级别日志

- **ID:** LOG-001
- **Given** 日志系统已初始化
- **When** 调用 logger.info("操作完成")
- **Then** 输出内容包含 "[INFO]" 前缀
- **And** 输出内容包含 "操作完成"

### Scenario: 输出 warn 级别日志

- **ID:** LOG-002
- **Given** 日志系统已初始化
- **When** 调用 logger.warn("请注意")
- **Then** 输出内容包含 "[WARN]" 前缀
- **And** 输出内容包含 "请注意"

### Scenario: 输出 error 级别日志

- **ID:** LOG-003
- **Given** 日志系统已初始化
- **When** 调用 logger.error("发生错误")
- **Then** 输出内容包含 "[ERROR]" 前缀
- **And** 输出内容包含 "发生错误"

### Scenario: 非生产模式下输出 debug 日志

- **ID:** LOG-004
- **Given** 当前为非生产环境模式
- **When** 调用 logger.debug("调试信息")
- **Then** 输出内容包含 "[DEBUG]" 前缀
- **And** 输出内容包含 "调试信息"

### Scenario: 日志包含时间戳

- **ID:** LOG-005
- **Given** 日志系统已初始化
- **When** 调用任意级别的日志方法
- **Then** 输出内容中包含时间信息

### Scenario: 日志级别过滤

- **ID:** LOG-006
- **Given** 日志级别设置为 "warn"
- **When** 分别调用 logger.info、logger.debug、logger.warn、logger.error
- **Then** info 和 debug 不输出
- **And** warn 和 error 正常输出

### Scenario: 多参数日志拼接输出

- **ID:** LOG-007
- **Given** 日志系统已初始化
- **When** 调用 logger.info("物体", "box", { id: "1" })
- **Then** 输出内容包含所有参数的拼接信息

### Scenario: 空消息不报错

- **ID:** LOG-008
- **Given** 日志系统已初始化
- **When** 调用 logger.info("")
- **Then** 不抛出异常

---

## Feature: 键盘快捷键

作为 3D 场景编辑器的用户，我希望使用键盘快捷键来高效操作，包括切换工具、删除物体、撤销重做和快速保存。

### Scenario: 按下 W 键切换到移动模式

- **ID:** KEY-001
- **Given** 当前工具模式为 "rotate"
- **When** 用户按下 W 键（无修饰键）
- **Then** 当前工具模式变为 "translate"

### Scenario: 按下 E 键切换到旋转模式

- **ID:** KEY-002
- **Given** 当前工具模式为 "translate"
- **When** 用户按下 E 键（无修饰键）
- **Then** 当前工具模式变为 "rotate"

### Scenario: 按下 R 键切换到缩放模式

- **ID:** KEY-003
- **Given** 当前工具模式为 "translate"
- **When** 用户按下 R 键（无修饰键）
- **Then** 当前工具模式变为 "scale"

### Scenario: 按下 G 键切换网格显示

- **ID:** KEY-004
- **Given** 当前网格为显示状态
- **When** 用户按下 G 键（无修饰键）
- **Then** 网格变为隐藏状态

### Scenario: 按下 Delete 键删除选中物体

- **ID:** KEY-005
- **Given** 场景中有物体 A，且 A 为选中状态
- **When** 用户按下 Delete 键
- **Then** 物体 A 从场景中被删除

### Scenario: 无选中时按 Delete 键不报错

- **ID:** KEY-006
- **Given** 当前没有选中任何物体
- **When** 用户按下 Delete 键
- **Then** 不抛出异常
- **And** 场景状态不变

### Scenario: 按下 Ctrl+Z 撤销

- **ID:** KEY-007
- **Given** 历史栈中有可撤销的记录
- **When** 用户同时按下 Ctrl 和 Z 键
- **Then** 执行一次撤销操作

### Scenario: 按下 Ctrl+Shift+Z 重做

- **ID:** KEY-008
- **Given** 历史栈中有可重做的记录
- **When** 用户同时按下 Ctrl、Shift 和 Z 键
- **Then** 执行一次重做操作

### Scenario: 按下 Ctrl+S 快速保存

- **ID:** KEY-009
- **Given** 场景中有物体
- **When** 用户同时按下 Ctrl 和 S 键
- **Then** 触发场景保存流程
- **And** 浏览器的默认保存行为被阻止（preventDefault）

### Scenario: 仅按 Z 键不触发撤销

- **ID:** KEY-010
- **Given** 历史栈中有可撤销的记录
- **When** 用户按下 Z 键（没有按住 Ctrl）
- **Then** 不执行撤销操作

### Scenario: 仅按 Shift+Z 不触发重做

- **ID:** KEY-011
- **Given** 历史栈中有可重做的记录
- **When** 用户同时按下 Shift 和 Z 键（没有按住 Ctrl）
- **Then** 不执行重做操作

### Scenario: 输入框聚焦时快捷键不触发

- **ID:** KEY-012
- **Given** 光标正在一个文本输入框（input）中
- **When** 用户按下 W、E、R、G 或 Delete 键
- **Then** 快捷键不生效
- **And** 编辑器状态不改变

### Scenario: 文本域聚焦时 Ctrl+Z 使用浏览器默认行为

- **ID:** KEY-013
- **Given** 光标正在一个文本域（textarea）中
- **When** 用户按下 Ctrl+Z
- **Then** 使用浏览器默认的撤销行为（文本撤销）
- **And** 编辑器的 undo 不被调用

### Scenario: leva 输入框聚焦时不触发热键

- **ID:** KEY-014
- **Given** 光标正在 leva 属性面板的输入框中
- **When** 用户按下 W 键
- **Then** 编辑器工具模式不改变

### Scenario: 未绑定的按键不产生副作用

- **ID:** KEY-015
- **Given** 编辑器正常运行
- **When** 用户按下未绑定快捷键的按键（如 X 键）
- **Then** 不抛出异常
- **And** 编辑器状态不变

---

## Feature: 工具栏（Toolbar）

作为 3D 场景编辑器的用户，我希望工具栏提供直观的按钮来切换工具模式、控制网格、管理撤销重做、导入导出文件以及加载示例场景。

### Scenario: 工具栏渲染三种模式按钮

- **ID:** TLB-001
- **Given** 编辑器已启动
- **When** 渲染工具栏
- **Then** 工具栏中存在三个模式按钮：移动、旋转、缩放

### Scenario: 移动模式时移动按钮处于激活态

- **ID:** TLB-002
- **Given** 当前工具模式为 "translate"
- **When** 检查工具栏
- **Then** 移动按钮显示为激活/选中状态
- **And** 旋转和缩放按钮显示为普通状态

### Scenario: 点击旋转按钮切换模式

- **ID:** TLB-003
- **Given** 当前工具模式为 "translate"
- **When** 用户点击工具栏中的旋转按钮
- **Then** 当前工具模式变为 "rotate"
- **And** 旋转按钮显示为激活状态

### Scenario: 点击缩放按钮切换模式

- **ID:** TLB-004
- **Given** 当前工具模式为 "translate"
- **When** 用户点击工具栏中的缩放按钮
- **Then** 当前工具模式变为 "scale"
- **And** 缩放按钮显示为激活状态

### Scenario: 网格开关显示当前状态

- **ID:** TLB-005
- **Given** 当前网格为显示状态
- **When** 检查工具栏中的网格按钮
- **Then** 网格按钮显示为开启状态

### Scenario: 点击网格按钮切换状态

- **ID:** TLB-006
- **Given** 当前网格为显示状态
- **When** 用户点击网格按钮
- **Then** 网格变为隐藏状态
- **And** 网格按钮显示为关闭状态

### Scenario: 有历史时撤销按钮可用

- **ID:** TLB-007
- **Given** 历史栈中存在可撤销的记录
- **When** 检查工具栏中的撤销按钮
- **Then** 撤销按钮处于启用状态

### Scenario: 无历史时撤销按钮禁用

- **ID:** TLB-008
- **Given** 历史栈为空（无任何历史记录）
- **When** 检查工具栏中的撤销按钮
- **Then** 撤销按钮处于禁用状态

### Scenario: 可重做时重做按钮可用

- **ID:** TLB-009
- **Given** 历史指针不在最新位置（存在可重做记录）
- **When** 检查工具栏中的重做按钮
- **Then** 重做按钮处于启用状态

### Scenario: 不可重做时重做按钮禁用

- **ID:** TLB-010
- **Given** 历史指针在最新位置
- **When** 检查工具栏中的重做按钮
- **Then** 重做按钮处于禁用状态

### Scenario: 点击撤销按钮执行撤销

- **ID:** TLB-011
- **Given** 历史栈中有可撤销的记录
- **When** 用户点击撤销按钮
- **Then** 执行一次撤销操作

### Scenario: 点击重做按钮执行重做

- **ID:** TLB-012
- **Given** 历史栈中有可重做的记录
- **When** 用户点击重做按钮
- **Then** 执行一次重做操作

### Scenario: 点击导入按钮弹出文件选择

- **ID:** TLB-013
- **Given** 工具栏已渲染
- **When** 用户点击导入按钮
- **Then** 弹出系统文件选择对话框
- **And** 文件选择器仅接受 .gltf 和 .glb 格式

### Scenario: 有物体时点击保存按钮触发 JSON 下载

- **ID:** TLB-014
- **Given** 场景中至少有一个物体
- **When** 用户点击保存按钮
- **Then** 浏览器开始下载 JSON 文件

### Scenario: 点击加载按钮弹出文件选择

- **ID:** TLB-015
- **Given** 工具栏已渲染
- **When** 用户点击加载按钮
- **Then** 弹出系统文件选择对话框
- **And** 文件选择器仅接受 .json 格式

### Scenario: 有物体时点击导出 GLB 按钮触发下载

- **ID:** TLB-016
- **Given** 场景中至少有一个物体
- **When** 用户点击导出 GLB 按钮
- **Then** 浏览器开始下载 GLB 文件

### Scenario: 示例场景下拉菜单展示六个选项

- **ID:** TLB-017
- **Given** 工具栏已渲染
- **When** 用户打开示例场景下拉菜单
- **Then** 菜单中包含六个选项：办公室、客厅、街道、卧室、公园、餐厅

### Scenario: 选择示例场景加载

- **ID:** TLB-018
- **Given** 当前场景为空
- **When** 用户在示例场景菜单中选择"卧室"
- **Then** 场景中加载卧室示例场景数据
- **And** 视口和场景树展示卧室的物体

---

## Feature: 场景树面板（SceneTree）

作为 3D 场景编辑器的用户，我希望在左侧面板中查看场景物体的层级列表，支持搜索、选择、重命名、排序和遮挡层级调整。

### Scenario: 渲染场景中所有物体节点

- **ID:** TREE-001
- **Given** 场景中有物体 A、B、C
- **When** 渲染场景树面板
- **Then** 场景树中显示 3 个节点

### Scenario: 空场景时显示占位提示

- **ID:** TREE-002
- **Given** 场景中没有任何物体
- **When** 渲染场景树面板
- **Then** 显示空状态提示信息

### Scenario: 节点按遮挡层级排序

- **ID:** TREE-003
- **Given** 场景中有 A(oi=2)、B(oi=0)、C(oi=1)
- **When** 渲染场景树面板
- **Then** 节点从上到下的顺序为 B → C → A

### Scenario: 点击节点选中对应物体

- **ID:** TREE-004
- **Given** 场景中有物体 A，当前未选中任何物体
- **When** 用户点击场景树中 A 的节点
- **Then** 当前选中的物体 id 变为 A 的 id

### Scenario: 选中节点显示高亮

- **ID:** TREE-005
- **Given** 物体 A 为当前选中状态
- **When** 检查场景树面板
- **Then** A 对应的节点显示选中高亮样式

### Scenario: 双击节点进入重命名模式

- **ID:** TREE-006
- **Given** 场景树中有物体 A 的节点
- **When** 用户双击 A 的节点
- **Then** 节点变为可编辑的文本输入框
- **And** 输入框自动获取焦点

### Scenario: 重命名后按回车确认

- **ID:** TREE-007
- **Given** 用户已双击 A 的节点进入编辑模式
- **When** 用户输入新名称 "newname" 并按下 Enter 键
- **Then** 物体 A 的 name 更新为 "newname"
- **And** 节点退出编辑模式

### Scenario: 重命名后按 Escape 取消

- **ID:** TREE-008
- **Given** 用户已双击 A(name="old") 的节点进入编辑模式，并输入了 "x"
- **When** 用户按下 Escape 键
- **Then** 物体 A 的 name 保持为 "old"
- **And** 节点退出编辑模式，显示原始名称

### Scenario: 重命名为空不生效

- **ID:** TREE-009
- **Given** 用户已双击 A 的节点进入编辑模式
- **When** 用户清空输入框并按下 Enter
- **Then** 物体 A 的名称不变（或恢复为默认名称）

### Scenario: 可见物体显示眼睛睁开图标

- **ID:** TREE-010
- **Given** 物体 A 的 visible 为 true
- **When** 检查场景树中 A 的节点
- **Then** 节点旁显示眼睛睁开图标

### Scenario: 不可见物体显示眼睛闭合图标

- **ID:** TREE-011
- **Given** 物体 A 的 visible 为 false
- **When** 检查场景树中 A 的节点
- **Then** 节点旁显示眼睛闭合图标

### Scenario: 未锁定物体显示解锁图标

- **ID:** TREE-012
- **Given** 物体 A 的 locked 为 false
- **When** 检查场景树中 A 的节点
- **Then** 节点旁显示解锁图标

### Scenario: 锁定物体显示锁定图标

- **ID:** TREE-013
- **Given** 物体 A 的 locked 为 true
- **When** 检查场景树中 A 的节点
- **Then** 节点旁显示锁定图标

### Scenario: 搜索框过滤节点

- **ID:** TREE-014
- **Given** 场景中有 "box_1" 和 "sphere_1"
- **When** 用户在搜索框中输入 "box"
- **Then** 场景树中仅显示 "box_1" 节点
- **And** "sphere_1" 节点被隐藏

### Scenario: 搜索无匹配时显示空结果

- **ID:** TREE-015
- **Given** 场景中有 "box_1"
- **When** 用户在搜索框中输入 "nonexistent"
- **Then** 场景树显示无匹配结果的提示

### Scenario: 清空搜索框恢复全部节点

- **ID:** TREE-016
- **Given** 用户已搜索 "box" 导致仅显示部分节点
- **When** 用户清空搜索框
- **Then** 场景树恢复显示全部节点

### Scenario: 点击置顶按钮将选中物体置顶

- **ID:** TREE-017
- **Given** 场景中有 A(oi=0)、B(oi=1)、C(oi=2)，A 为选中状态
- **When** 用户点击置顶按钮
- **Then** A 的 occlusionIndex 变为最大值

### Scenario: 点击置底按钮将选中物体置底

- **ID:** TREE-018
- **Given** 场景中有 A(oi=0)、B(oi=1)、C(oi=2)，C 为选中状态
- **When** 用户点击置底按钮
- **Then** C 的 occlusionIndex 变为 0

### Scenario: 点击上移按钮将选中物体上移

- **ID:** TREE-019
- **Given** 场景中有 A(oi=0)、B(oi=1)，A 为选中状态
- **When** 用户点击上移按钮
- **Then** A.occlusionIndex 为 1
- **And** B.occlusionIndex 为 0

### Scenario: 点击下移按钮将选中物体下移

- **ID:** TREE-020
- **Given** 场景中有 A(oi=0)、B(oi=1)，B 为选中状态
- **When** 用户点击下移按钮
- **Then** B.occlusionIndex 为 0
- **And** A.occlusionIndex 为 1

---

## Feature: 属性面板（PropertyPanel）

作为 3D 场景编辑器的用户，我希望在右侧属性面板中查看和编辑选中物体的各项属性，包括基本信息、变换参数、外观和遮挡层级。

### Scenario: 未选中物体时显示占位提示

- **ID:** PROP-001
- **Given** 当前没有选中任何物体
- **When** 渲染属性面板
- **Then** 面板中显示"请在视口或场景树中选择物体"的提示
- **And** Leva 面板为空

### Scenario: 选中物体后显示四组属性 folder

- **ID:** PROP-002
- **Given** 场景中有物体 A，且 A 为选中状态
- **When** 渲染属性面板
- **Then** Leva 面板中包含四个 folder：基本信息、变换、外观、遮挡

### Scenario: 基本信息 folder 中 name 可编辑

- **ID:** PROP-003
- **Given** 选中物体 A(name="box_1")
- **When** 用户在属性面板中修改 name 输入框的值
- **Then** 物体 A 的 name 更新为新的值

### Scenario: 基本信息 folder 中 kind 为只读

- **ID:** PROP-004
- **Given** 选中物体 A(kind="box")
- **When** 检查 kind 控件
- **Then** kind 控件处于禁用状态
- **And** kind 控件显示 "box"

### Scenario: 变换 folder 中位置滑块有正确的范围和步长

- **ID:** PROP-005
- **Given** 选中物体 A
- **When** 检查位置 X 的滑块控件
- **Then** 滑块最小值为 -50
- **And** 滑块最大值为 50
- **And** 滑块步长为 0.1

### Scenario: 拖拽位置 X 滑块更新物体位置

- **ID:** PROP-006
- **Given** 选中物体 A(position.x=0)
- **When** 用户拖拽位置 X 滑块到 5
- **Then** 物体 A 的 position.x 更新为 5

### Scenario: 拖拽旋转 Y 滑块更新物体旋转

- **ID:** PROP-007
- **Given** 选中物体 A(rotation.y=0)
- **When** 用户拖拽旋转 Y 滑块到 3.14
- **Then** 物体 A 的 rotation.y 更新为约 3.14

### Scenario: 拖拽缩放滑块更新物体缩放

- **ID:** PROP-008
- **Given** 选中物体 A(scale.x=1)
- **When** 用户拖拽缩放 X 滑块到 3
- **Then** 物体 A 的 scale.x 更新为 3

### Scenario: 使用颜色选择器修改物体颜色

- **ID:** PROP-009
- **Given** 选中物体 A(color="#ff0000")
- **When** 用户在颜色选择器中选择 "#00ff00"
- **Then** 物体 A 的 color 更新为 "#00ff00"

### Scenario: 切换可见性开关隐藏物体

- **ID:** PROP-010
- **Given** 选中物体 A(visible=true)
- **When** 用户将可见性开关切换为关闭
- **Then** 物体 A 的 visible 变为 false

### Scenario: 切换锁定开关锁定物体

- **ID:** PROP-011
- **Given** 选中物体 A(locked=false)
- **When** 用户将锁定开关切换为开启
- **Then** 物体 A 的 locked 变为 true

### Scenario: 遮挡层级显示为只读

- **ID:** PROP-012
- **Given** 选中物体 A(occlusionIndex=0)
- **When** 检查遮挡 folder 中的 occlusionIndex 控件
- **Then** occlusionIndex 控件处于禁用状态
- **And** 显示值为 0

### Scenario: 切换选中物体时控件自动重建为新的数据

- **ID:** PROP-013
- **Given** 先选中物体 A(box, name="box_1")
- **When** 用户改为选中物体 B(sphere, name="sphere_1")
- **Then** 属性面板中的 name 更新为 "sphere_1"
- **And** kind 更新为 "sphere"
- **And** 所有变换滑块值更新为 B 的数值

### Scenario: 删除选中物体后面板回到占位状态

- **ID:** PROP-014
- **Given** 选中物体 A，属性面板显示 A 的属性
- **When** 用户删除物体 A
- **Then** 属性面板回到占位提示状态

### Scenario: 属性 folder 支持折叠展开

- **ID:** PROP-015
- **Given** 选中物体 A，属性面板显示全部 folder
- **When** 用户点击"变换" folder 的标题
- **Then** "变换" folder 的内容折叠隐藏
- **And** 再次点击时内容展开

### Scenario: 外部修改 store 后 leva 控件值同步

- **ID:** PROP-016
- **Given** 选中物体 A(name="old")
- **When** 通过代码直接调用 store.updateObject 将 name 改为 "new"
- **Then** 属性面板中 name 控件的显示值变为 "new"

### Scenario: 锁定物体时属性面板仍可查看

- **ID:** PROP-017
- **Given** 选中物体 A(locked=true)
- **When** 检查属性面板
- **Then** 所有控件可见并可操作
- **And** 但视口中该物体不响应 TransformControls

---

## Feature: 状态栏（StatusBar）

作为 3D 场景编辑器的用户，我希望在底部状态栏看到当前选中信息、工具模式、网格状态和最新操作日志。

### Scenario: 显示当前选中物体名称

- **ID:** STAT-001
- **Given** 场景中有物体 A(name="box_1")，且 A 为选中状态
- **When** 检查状态栏
- **Then** 状态栏中显示 "box_1"

### Scenario: 显示选中物体数量和总数

- **ID:** STAT-002
- **Given** 场景中有 3 个物体，其中 1 个被选中
- **When** 检查状态栏
- **Then** 状态栏中显示选中数量为 1，总数为 3

### Scenario: 未选中物体时显示总数

- **ID:** STAT-003
- **Given** 场景中有 3 个物体，但没有选中任何物体
- **When** 检查状态栏
- **Then** 状态栏中显示物体总数为 3
- **And** 显示未选中状态

### Scenario: 显示当前工具为移动模式

- **ID:** STAT-004
- **Given** 当前工具模式为 "translate"
- **When** 检查状态栏
- **Then** 状态栏中显示"移动"或 translate 相关信息

### Scenario: 显示当前工具为旋转模式

- **ID:** STAT-005
- **Given** 当前工具模式为 "rotate"
- **When** 检查状态栏
- **Then** 状态栏中显示"旋转"或 rotate 相关信息

### Scenario: 显示当前工具为缩放模式

- **ID:** STAT-006
- **Given** 当前工具模式为 "scale"
- **When** 检查状态栏
- **Then** 状态栏中显示"缩放"或 scale 相关信息

### Scenario: 显示网格状态为开

- **ID:** STAT-007
- **Given** 当前网格为显示状态
- **When** 检查状态栏
- **Then** 状态栏中显示"网格: ON"或类似指示

### Scenario: 显示网格状态为关

- **ID:** STAT-008
- **Given** 当前网格为隐藏状态
- **When** 检查状态栏
- **Then** 状态栏中显示"网格: OFF"或类似指示

### Scenario: 显示最新操作日志

- **ID:** STAT-009
- **Given** 系统记录了一条日志"物体 box_1 已添加"
- **When** 检查状态栏
- **Then** 状态栏末尾显示"物体 box_1 已添加"

### Scenario: 日志消息自动更新为最新

- **ID:** STAT-010
- **Given** 状态栏当前显示"物体 box_1 已添加"
- **When** 系统记录新的日志"物体 sphere_1 已添加"
- **Then** 状态栏显示更新为"物体 sphere_1 已添加"

### Scenario: 空场景时状态栏正常显示

- **ID:** STAT-011
- **Given** 场景中没有物体，也没有选中
- **When** 检查状态栏
- **Then** 状态栏各区域均有合理默认显示
- **And** 不抛出异常

---

## Feature: 3D 视口（Viewport）

作为 3D 场景编辑器的用户，我希望在中央视口中以三维方式查看和交互场景物体，支持轨道旋转、Gizmo 变换和物体选中。

### Scenario: 视口中渲染 Canvas 元素

- **ID:** VPT-001
- **Given** 编辑器已启动
- **When** 渲染视口组件
- **Then** DOM 中存在 canvas 元素

### Scenario: 视口中渲染的物体数量与场景数据一致

- **ID:** VPT-002
- **Given** 场景中有 3 个物体
- **When** 渲染视口
- **Then** Canvas 中渲染 3 个 3D mesh

### Scenario: 添加物体后视口自动同步

- **ID:** VPT-003
- **Given** 场景中有 1 个物体
- **When** 用户添加一个 sphere 几何体
- **Then** Canvas 中物体数量从 1 变为 2

### Scenario: 删除物体后视口自动同步

- **ID:** VPT-004
- **Given** 场景中有 2 个物体
- **When** 用户删除其中一个物体
- **Then** Canvas 中物体数量从 2 变为 1

### Scenario: 网格显示状态下渲染网格

- **ID:** VPT-005
- **Given** 网格显示状态为 true
- **When** 渲染视口
- **Then** 视口中可见参考网格

### Scenario: 网格隐藏状态下不渲染网格

- **ID:** VPT-006
- **Given** 网格显示状态为 false
- **When** 渲染视口
- **Then** 视口中不显示参考网格

### Scenario: 点击物体将其选中

- **ID:** VPT-007
- **Given** 场景中有物体 A
- **When** 用户在视口中点击物体 A 对应的 mesh
- **Then** 物体 A 被选中

### Scenario: 点击空白区域取消选中

- **ID:** VPT-008
- **Given** 物体 A 为选中状态
- **When** 用户在视口中点击空白区域（无 mesh 处）
- **Then** 当前选中的物体 id 变为 null

### Scenario: 点击锁定物体时的行为

- **ID:** VPT-009
- **Given** 场景中有物体 A(locked=true)
- **When** 用户在视口中点击物体 A
- **Then** 视口中该物体不显示 TransformControls Gizmo

### Scenario: 选中未锁定物体时显示 TransformControls

- **ID:** VPT-010
- **Given** 物体 A(locked=false) 为选中状态
- **When** 渲染视口
- **Then** TransformControls Gizmo 附着在物体 A 上

### Scenario: 切换变换模式时 Gizmo 外观变化

- **ID:** VPT-011
- **Given** 物体 A 为选中状态，当前工具为 "translate"
- **When** 用户切换到 "rotate" 模式
- **Then** TransformControls 的 mode 变为 "rotate"
- **And** Gizmo 由移动箭头变为旋转圆环

### Scenario: 缩放模式下 TransformControls 使用局部坐标系

- **ID:** VPT-012
- **Given** 物体 A 为选中状态，当前工具为 "scale"
- **When** 检查 TransformControls 的 space 属性
- **Then** space 为 "local"

### Scenario: 移动模式下 TransformControls 使用世界坐标系

- **ID:** VPT-013
- **Given** 物体 A 为选中状态，当前工具为 "translate"
- **When** 检查 TransformControls 的 space 属性
- **Then** space 为 "world"

### Scenario: 旋转模式下 TransformControls 使用世界坐标系

- **ID:** VPT-014
- **Given** 物体 A 为选中状态，当前工具为 "rotate"
- **When** 检查 TransformControls 的 space 属性
- **Then** space 为 "world"

### Scenario: 视口右下角显示方位指示器

- **ID:** VPT-015
- **Given** 视口已渲染
- **When** 检查视口右下角
- **Then** 可见方位轴指示器 Gizmo

### Scenario: 鼠标拖拽旋转相机视角

- **ID:** VPT-016
- **Given** 视口已渲染
- **When** 用户在视口中拖拽鼠标左键
- **Then** 相机围绕场景中心旋转

### Scenario: 鼠标滚轮缩放相机

- **ID:** VPT-017
- **Given** 视口已渲染
- **When** 用户滚动鼠标滚轮
- **Then** 相机距离拉近或拉远

### Scenario: 鼠标右键拖拽平移相机

- **ID:** VPT-018
- **Given** 视口已渲染
- **When** 用户在视口中拖拽鼠标右键
- **Then** 相机在平面内平移

### Scenario: 场景中存在环境光和方向光

- **ID:** VPT-019
- **Given** 视口已渲染
- **When** 检查场景中的光源
- **Then** 场景中有环境光（ambientLight）
- **And** 场景中有方向光（directionalLight）

---

## Feature: 场景物体 3D 渲染（SceneObject3D）

作为系统，我需要根据物体定义正确地渲染对应的 Three.js 几何体，支持位置、旋转、缩放、颜色、可见性以及 GLTF 模型加载。

### Scenario: 渲染 box 类型为立方体

- **ID:** OBJ-001
- **Given** 一个 kind 为 "box" 的物体定义
- **When** 渲染该物体
- **Then** 对应的 mesh 使用 BoxGeometry

### Scenario: 渲染 sphere 类型为球体

- **ID:** OBJ-002
- **Given** 一个 kind 为 "sphere" 的物体定义
- **When** 渲染该物体
- **Then** 对应的 mesh 使用 SphereGeometry

### Scenario: 渲染 cylinder 类型为圆柱体

- **ID:** OBJ-003
- **Given** 一个 kind 为 "cylinder" 的物体定义
- **When** 渲染该物体
- **Then** 对应的 mesh 使用 CylinderGeometry

### Scenario: 渲染 cone 类型为圆锥体

- **ID:** OBJ-004
- **Given** 一个 kind 为 "cone" 的物体定义
- **When** 渲染该物体
- **Then** 对应的 mesh 使用 ConeGeometry

### Scenario: 渲染 torus 类型为圆环体

- **ID:** OBJ-005
- **Given** 一个 kind 为 "torus" 的物体定义
- **When** 渲染该物体
- **Then** 对应的 mesh 使用 TorusGeometry

### Scenario: 渲染 person 为组合几何体

- **ID:** OBJ-006
- **Given** 一个 kind 为 "person" 的物体定义
- **When** 渲染该物体
- **Then** 渲染一个包含多个子 mesh 的 Group（头、身体、四肢等）

### Scenario: 渲染 house 为组合几何体

- **ID:** OBJ-007
- **Given** 一个 kind 为 "house" 的物体定义
- **When** 渲染该物体
- **Then** 渲染一个包含多个子 mesh 的 Group

### Scenario: 所有常见物体类型均可正常渲染

- **ID:** OBJ-008
- **Given** 每种 ObjectKind（person/house/table/chair/cup/tree/car/sofa/bed/fence）各一个物体
- **When** 渲染所有这些物体
- **Then** 每个物体都有对应的 Group 或 mesh 渲染
- **And** 不抛出异常

### Scenario: 物体渲染在正确的位置

- **ID:** OBJ-009
- **Given** 一个物体定义 position 为 { x: 5, y: 2, z: -3 }
- **When** 渲染该物体
- **Then** 对应 mesh 的 position 为 [5, 2, -3]

### Scenario: 物体应用正确的旋转

- **ID:** OBJ-010
- **Given** 一个物体定义 rotation 为 { x: 0, y: Math.PI / 2, z: 0 }
- **When** 渲染该物体
- **Then** 对应 mesh 的 rotation.y 约为 π/2

### Scenario: 物体应用正确的缩放

- **ID:** OBJ-011
- **Given** 一个物体定义 scale 为 { x: 2, y: 1, z: 3 }
- **When** 渲染该物体
- **Then** 对应 mesh 的 scale 为 [2, 1, 3]

### Scenario: 材质颜色与定义一致

- **ID:** OBJ-012
- **Given** 一个物体定义 color 为 "#ff5733"
- **When** 渲染该物体
- **Then** 对应 mesh 的 material.color 为 "#ff5733"

### Scenario: 不可见物体不渲染

- **ID:** OBJ-013
- **Given** 一个物体定义 visible 为 false
- **When** 渲染该物体
- **Then** 对应 mesh 的 visible 属性为 false

### Scenario: 渲染 GLTF 导入的物体

- **ID:** OBJ-014
- **Given** 一个物体带有合法的 modelData（GLB 二进制数据）
- **When** 渲染该物体
- **Then** 使用 useGLTF 加载模型
- **And** 渲染模型中的所有 mesh

### Scenario: GLTF 导入数据无效时的回退处理

- **ID:** OBJ-015
- **Given** 一个物体带有不合法的 modelData
- **When** 渲染该物体
- **Then** 不导致应用崩溃
- **And** 渲染默认几何体或空 Group 作为降级

### Scenario: 鼠标悬停时显示 pointer 光标

- **ID:** OBJ-016
- **Given** 一个未锁定的物体
- **When** 用户将鼠标悬停在该物体的 mesh 上
- **Then** 鼠标光标变为 pointer 样式

---

## Feature: 应用集成（App）

作为系统，我需要将所有面板和功能组件集成为一个协调工作的编辑器，确保各面板之间的交互和数据同步正确。

### Scenario: 应用渲染完整编辑器布局

- **ID:** APP-001
- **Given** 应用启动
- **When** 渲染 App 组件
- **Then** 从上到下依次显示：工具栏 → 面板区域（场景树 + 视口 + 属性面板）→ 状态栏

### Scenario: 面板可通过拖拽调整大小

- **ID:** APP-002
- **Given** 编辑器布局已渲染
- **When** 用户拖拽场景树和视口之间的分隔条
- **Then** 场景树和视口的宽度比例发生变化

### Scenario: 添加物体全链路同步

- **ID:** APP-003
- **Given** 编辑器已启动，场景为空
- **When** 用户在工具栏点击添加 box
- **Then** 场景树中新增一个节点
- **And** 视口中新增一个立方体 mesh
- **And** 属性面板显示该物体的属性

### Scenario: 选中物体全链路同步

- **ID:** APP-004
- **Given** 场景中有物体 A
- **When** 用户在视口中点击物体 A
- **Then** 场景树中 A 的节点高亮
- **And** 属性面板显示 A 的属性
- **And** 状态栏显示 A 的名称

### Scenario: 属性修改全链路同步

- **ID:** APP-005
- **Given** 选中物体 A(color="#ff0000")
- **When** 用户在属性面板中将颜色改为 "#00ff00"
- **Then** 视口中 A 的颜色变为绿色
- **And** store 中 A 的 color 更新为 "#00ff00"

### Scenario: 快捷键切换工具全链路同步

- **ID:** APP-006
- **Given** 当前工具为 "translate"
- **When** 用户按下 W 键
- **Then** 工具栏中移动按钮保持高亮
- **And** 状态栏显示移动模式
- **And** 视口中 Gizmo 为移动箭头

### Scenario: 快捷键删除物体全链路同步

- **ID:** APP-007
- **Given** 选中物体 A
- **When** 用户按下 Delete 键
- **Then** 场景树中 A 节点消失
- **And** 视口中 A 的 mesh 消失
- **And** 属性面板回到占位状态

### Scenario: 撤销恢复删除全链路同步

- **ID:** APP-008
- **Given** 用户刚删除了物体 A
- **When** 用户按 Ctrl+Z 撤销
- **Then** 场景树中重新出现 A 节点
- **And** 视口中重新出现 A 的 mesh

### Scenario: 加载示例场景全链路同步

- **ID:** APP-009
- **Given** 编辑器已启动
- **When** 用户在工具栏示例场景菜单中选择"卧室"
- **Then** 场景树中显示多个物体节点
- **And** 视口中渲染含床、柜子、椅子、桌子的场景
- **And** 属性面板可查看选中物体的属性

### Scenario: 切换选中物体时各面板同步

- **ID:** APP-010
- **Given** 场景中有 A 和 B，当前选中 A
- **When** 用户在场景树中点击 B 的节点
- **Then** 属性面板切换为 B 的数据
- **And** 视口中 Gizmo 附着到 B 上
- **And** 状态栏更新为 B 的名称

### Scenario: 锁定物体不可进行变换操作

- **ID:** APP-011
- **Given** 场景中有物体 A，当前未选中
- **When** 用户通过属性面板将 A 锁定，然后在视口中选中 A
- **Then** 视口中不显示 TransformControls Gizmo
- **And** 场景树中 A 显示锁定图标
- **And** 属性面板仍可查看和编辑 A 的属性

### Scenario: 多个物体各自独立渲染

- **ID:** APP-012
- **Given** 场景中有 2 个 box
- **When** 用户分别将它们设置为不同的颜色和位置
- **Then** 视口中两个物体独立渲染
- **And** 各自的颜色和位置正确

---

## Feature: 导入导出集成

作为 3D 场景编辑器的用户，我希望通过导入导出功能在文件与编辑器之间传递场景数据，包括 JSON 场景文件和 GLB 模型文件。

### Scenario: 保存 JSON 文件

- **ID:** IO-001
- **Given** 场景中有 2 个物体
- **When** 用户点击保存按钮
- **Then** 浏览器下载一个 .json 文件
- **And** 文件内容为合法的 SceneData 格式

### Scenario: 加载 JSON 文件恢复场景

- **ID:** IO-002
- **Given** 存在一份包含 3 个物体的合法 scene.json 文件
- **When** 用户点击加载并选择该文件
- **Then** 场景中物体数量变为 3
- **And** 视口中渲染这些物体

### Scenario: 加载后历史栈被清空

- **ID:** IO-003
- **Given** 当前有若干历史记录
- **When** 用户加载一份 JSON 场景文件
- **Then** 历史栈被清空
- **And** 撤销按钮变为禁用状态

### Scenario: 加载场景覆盖当前内容

- **ID:** IO-004
- **Given** 当前场景中有 3 个物体
- **When** 用户加载一份仅含 1 个物体的场景文件
- **Then** 场景中物体数量变为 1
- **And** 原来的 3 个物体不再存在

### Scenario: 加载无效的 JSON 文件显示错误

- **ID:** IO-005
- **Given** 存在一个内容为非 JSON 格式的文件
- **When** 用户尝试加载该文件
- **Then** 显示错误提示信息
- **And** 当前场景内容不变

### Scenario: 加载版本不兼容的场景文件

- **ID:** IO-006
- **Given** 存在一个 version 字段为 "99" 的场景文件
- **When** 用户尝试加载该文件
- **Then** 显示兼容性警告
- **And** 不覆盖当前场景或拒绝加载

### Scenario: 加载缺少 objects 字段的文件失败

- **ID:** IO-007
- **Given** 存在一个 JSON 内容为 `{ "version": "1" }` 的文件（无 objects 字段）
- **When** 用户尝试加载该文件
- **Then** 校验失败并报错
- **And** 当前场景内容不变

### Scenario: Ctrl+S 快捷键触发保存

- **ID:** IO-008
- **Given** 场景中有物体
- **When** 用户按下 Ctrl+S
- **Then** 触发 JSON 场景文件下载
- **And** 浏览器的默认保存对话框被阻止

### Scenario: 导出含物体的 GLB 文件

- **ID:** IO-009
- **Given** 场景中有 2 个物体
- **When** 用户点击导出 GLB 按钮
- **Then** 浏览器下载一个 .glb 文件
- **And** 该文件可被 Three.js GLTFLoader 成功解析

### Scenario: 导出空场景的 GLB 不报错

- **ID:** IO-010
- **Given** 场景中没有物体
- **When** 用户点击导出 GLB 按钮
- **Then** 下载一个最小合法 GLB 文件
- **And** 不抛出异常

### Scenario: 导入合法的 GLB 文件

- **ID:** IO-011
- **Given** 存在一个合法的 model.glb 文件
- **When** 用户点击导入并选择该文件
- **Then** 场景树中新增一个导入类型的物体
- **And** 视口中渲染该模型

### Scenario: 导入不合法的 GLB 文件显示错误

- **ID:** IO-012
- **Given** 存在一个非 GLB 格式的文件
- **When** 用户点击导入并选择该文件
- **Then** 显示错误提示信息
- **And** 当前场景内容不变

### Scenario: 导入大文件时不阻塞 UI

- **ID:** IO-013
- **Given** 存在一个超过 50MB 的 GLB 文件
- **When** 用户点击导入并选择该文件
- **Then** 显示加载进度指示
- **And** UI 保持响应，不卡死

### Scenario: 保存加载后遮挡层级保持一致

- **ID:** IO-014
- **Given** 场景中有 3 个物体，用户已调整过遮挡层级
- **When** 用户保存为 JSON，然后清空场景，再加载该 JSON
- **Then** 加载后的物体遮挡层级顺序与原场景一致

---

## Feature: 端到端工作流

作为 3D 场景编辑器的用户，我希望能够完成从零搭建场景、编辑修改、撤销恢复、保存加载的完整工作流。

### Scenario: 从零搭建简单场景并保存

- **ID:** E2E-001
- **Given** 编辑器已启动，场景为空
- **When** 用户依次执行以下操作：
  1. 添加一个 box
  2. 添加一个 sphere
  3. 选中 box
  4. 按 W 进入移动模式
  5. 拖拽 Gizmo 将 box 移动到 (3, 0, 0)
  6. 选中 sphere
  7. 在属性面板中将颜色修改为红色
  8. 按 Ctrl+S 保存
- **Then** 场景中共有 2 个物体
- **And** box 的 position.x 约为 3
- **And** sphere 的 color 为红色
- **And** JSON 文件已被下载

### Scenario: 编辑后多步撤销再部分重做

- **ID:** E2E-002
- **Given** 编辑器已启动
- **When** 用户依次执行：
  1. 添加 box
  2. 移动 box 到新位置
  3. 旋转 box
  4. 修改 box 颜色
  5. 按 3 次 Ctrl+Z
  6. 按 2 次 Ctrl+Shift+Z
- **Then** 第 5 步后 box 回到初始状态（位置、旋转、颜色均为初始值）
- **And** 第 6 步后 box 恢复了前 2 步的操作（移动和旋转），但颜色仍为初始值

### Scenario: 调整遮挡层级并验证排序

- **ID:** E2E-003
- **Given** 编辑器已启动
- **When** 用户依次执行：
  1. 添加 box（A）
  2. 添加 sphere（B）
  3. 添加 cylinder（C）
  4. 在场景树中选中 A，点击置顶
  5. 在场景树中选中 C，点击下移
- **Then** 第 4 步后 A.occlusionIndex 最大
- **And** 第 5 步后 C.occlusionIndex 减少 1
- **And** 场景树中节点顺序随遮挡层级更新

### Scenario: 锁定物体并切换可见性

- **ID:** E2E-004
- **Given** 编辑器已启动
- **When** 用户依次执行：
  1. 添加 box
  2. 在属性面板中锁定 box
  3. 在视口中尝试选中和移动 box
  4. 在属性面板中将 box 设置为不可见
  5. 在属性面板中将 box 恢复为可见
- **Then** 第 3 步：视口中 box 无 TransformControls Gizmo
- **And** 第 4 步：视口中 box 消失
- **And** 第 5 步：视口中 box 重新出现

### Scenario: 加载示例场景后修改并保存恢复

- **ID:** E2E-005
- **Given** 编辑器已启动
- **When** 用户依次执行：
  1. 在工具栏中选择加载"公园"示例场景
  2. 添加一个 car 物体
  3. 删除场景中的一棵树
  4. 移动人物到新位置
  5. 保存为 JSON 文件
  6. 清空场景
  7. 加载刚才保存的 JSON 文件
- **Then** 加载后场景包含公园原始物体 + car - 1 棵树
- **And** 人物的位置为修改后的新位置

### Scenario: 快捷键完整切换验证

- **ID:** E2E-006
- **Given** 编辑器已启动
- **When** 用户依次按下：
  1. W 键
  2. E 键
  3. R 键
  4. G 键
  5. G 键
- **Then** 第 1 步后：工具为移动模式，工具栏移动按钮高亮
- **And** 第 2 步后：工具为旋转模式
- **And** 第 3 步后：工具为缩放模式
- **And** 第 4 步后：网格隐藏
- **And** 第 5 步后：网格恢复显示

### Scenario: 导入 GLB 模型并调整后导出

- **ID:** E2E-007
- **Given** 编辑器已启动，有 chair.glb 文件
- **When** 用户依次执行：
  1. 导入 chair.glb
  2. 选中导入的模型
  3. 在属性面板中将缩放设为 2
  4. 在属性面板中将 Y 轴旋转设为 90 度
  5. 导出为 GLB 文件
- **Then** 导出的 GLB 文件包含缩放到 2 倍和旋转 90 度的变换

### Scenario: 多物体切换选中验证面板同步

- **ID:** E2E-008
- **Given** 场景中有 5 个不同类型的物体
- **When** 用户依次：
  1. 在视口中逐一点击选中每个物体
  2. 在场景树中逐一选中每个物体
  3. 点击视口空白区域
- **Then** 每次选中时：场景树节点高亮同步、属性面板数据更新、Gizmo 位置随物体变化、状态栏名称对应更新
- **And** 第 3 步后所有选中状态取消

### Scenario: 场景数据跨会话持久化

- **ID:** E2E-009
- **Given** 编辑器已启动，场景中有自定义搭建的物体
- **When** 用户依次执行：
  1. 保存场景为 JSON 文件
  2. 刷新页面（模拟新会话）
  3. 加载刚才保存的 JSON 文件
  4. 尝试执行撤销操作
- **Then** 第 3 步后场景完整还原
- **And** 第 4 步：撤销不可用（历史从零开始）

### Scenario: 搜索过滤与重命名

- **ID:** E2E-010
- **Given** 场景中有 box_1、box_2、sphere_1 三个物体
- **When** 用户依次执行：
  1. 在场景树搜索框中输入 "box"
  2. 将 box_1 重命名为 "cube_main"
  3. 清空搜索框
  4. 在搜索框中输入 "cube"
  5. 清空搜索框
- **Then** 第 1 步后：场景树仅显示 box_1 和 box_2
- **And** 第 2 步后：物体名称更新为 "cube_main"
- **And** 第 3 步后：场景树显示全部 3 个物体
- **And** 第 4 步后：场景树仅显示 "cube_main"
- **And** 第 5 步后：场景树恢复显示全部 3 个物体

---

## 附录 A：优先级分布

| 优先级 | 数量 | 说明 |
|--------|------|------|
| P0 | 98 | 核心状态管理（增删改查、undo/redo、序列化）+ 组件基础渲染 + 关键交互链路 |
| P1 | 63 | 边界条件、遮挡层级、快捷键、导入导出、示例场景、面板联动 |
| P2 | 25 | 异常降级、大文件处理、日志级别过滤 |

---

## 附录 B：测试数据工厂

```typescript
// 用于在测试中快速构造 Given 状态

function aSceneObject(overrides?: Partial<SceneObject>): SceneObject {
  return {
    id: nanoid(),
    name: 'test_box',
    kind: 'box',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    color: '#ff0000',
    visible: true,
    locked: false,
    occlusionIndex: 0,
    ...overrides,
  };
}

function aSceneData(objects: SceneObject[]): SceneData {
  return {
    version: '1.0.0',
    objects,
    metadata: {
      name: 'test_scene',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

function aStoreWithObjects(count: number): SceneStore {
  const store = useSceneStore.getState();
  for (let i = 0; i < count; i++) {
    store.addObject('box');
  }
  return store;
}

function aStoreWithObjectsOfKinds(kinds: ObjectKind[]): SceneStore {
  const store = useSceneStore.getState();
  for (const kind of kinds) {
    store.addObject(kind);
  }
  return store;
}

function aValidGLBBuffer(): ArrayBuffer {
  // 返回一个最小合法 GLB 二进制数据
  // 实际测试中替换为真实 GLB 文件内容
}
```