import { useEffect } from 'react';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import Toolbar from './components/editor/Toolbar';
import SceneTree from './components/editor/SceneTree';
import Viewport from './components/viewport/Viewport';
import PropertyPanel from './components/editor/PropertyPanel';
import StatusBar from './components/editor/StatusBar';
import { useSceneStore } from './store/sceneStore';
import { isEditableTarget } from './utils/keyboardShortcuts';
import { serializeScene, downloadFile } from './utils/sceneUtils';
import { logger } from './utils/logger';

export default function App() {
  const setTool = useSceneStore(s => s.setTool);
  const toggleGrid = useSceneStore(s => s.toggleGrid);
  const undo = useSceneStore(s => s.undo);
  const redo = useSceneStore(s => s.redo);
  const removeObject = useSceneStore(s => s.removeObject);
  const selectedId = useSceneStore(s => s.selectedId);
  const getSceneData = useSceneStore(s => s.getSceneData);
  const sceneName = useSceneStore(s => s.sceneName);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isEditableTarget(e.target)) return;
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const key = e.key;

      switch (key) {
        case 'w': setTool('translate'); break;
        case 'e': setTool('rotate'); break;
        case 'r': setTool('scale'); break;
        case 'g': toggleGrid(); break;
        case 'Delete':
          if (selectedId) removeObject(selectedId);
          break;
        case 'z':
          if (ctrl && !shift) { e.preventDefault(); undo(); }
          break;
        case 'Z':
          if (ctrl && shift) { e.preventDefault(); redo(); }
          break;
        case 's':
          if (ctrl) {
            e.preventDefault();
            const data = getSceneData();
            const json = serializeScene(data);
            downloadFile(new Blob([json], { type: 'application/json' }), `${sceneName}.json`);
            logger.info('场景已保存');
          }
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setTool, toggleGrid, undo, redo, removeObject, selectedId, getSceneData, sceneName]);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#141414', color: '#ccc' }}>
      <Toolbar />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Allotment>
          <Allotment.Pane preferredSize={240} minSize={180} maxSize={400}>
            <SceneTree />
          </Allotment.Pane>
          <Allotment.Pane minSize={400}>
            <Viewport />
          </Allotment.Pane>
          <Allotment.Pane preferredSize={280} minSize={220} maxSize={400}>
            <PropertyPanel />
          </Allotment.Pane>
        </Allotment>
      </div>
      <StatusBar />
    </div>
  );
}