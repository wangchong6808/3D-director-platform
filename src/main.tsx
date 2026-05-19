import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';
import { useSceneStore } from './store/sceneStore';
import App from './App';
import './index.css';

if (import.meta.env.DEV) {
  (window as any).__ZUSTAND_STORE__ = useSceneStore;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: { colorPrimary: '#1677ff' },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>
);