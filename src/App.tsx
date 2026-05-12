import { useEffect } from 'react';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import { Toolbar } from './components/editor/Toolbar';
import { SceneTree } from './components/editor/SceneTree';
import { PropertyPanel } from './components/editor/PropertyPanel';
import { StatusBar } from './components/editor/StatusBar';
import { Viewport } from './components/viewport/Viewport';
import { useSceneStore } from './store/sceneStore';

function App() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const store = useSceneStore.getState();

      switch (e.key.toLowerCase()) {
        case 'w':
          store.setTransformMode('translate');
          break;
        case 'e':
          store.setTransformMode('rotate');
          break;
        case 'r':
          store.setTransformMode('scale');
          break;
        case 'g':
          store.toggleGrid();
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.shiftKey) store.redo();
            else store.undo();
          }
          break;
        case 's':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const data = store.exportScene();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `scene_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Toolbar />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Allotment defaultSizes={[200, 600, 240]}>
          <Allotment.Pane minSize={150} maxSize={350}>
            <SceneTree />
          </Allotment.Pane>
          <Allotment.Pane minSize={400}>
            <Viewport />
          </Allotment.Pane>
          <Allotment.Pane minSize={180} maxSize={350}>
            <PropertyPanel />
          </Allotment.Pane>
        </Allotment>
      </div>
      <StatusBar />
    </div>
  );
}

export default App;
