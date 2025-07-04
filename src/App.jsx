import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import PipelineEditor from './components/PipelineEditor.jsx';

function App() {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <ReactFlowProvider>
        <PipelineEditor />
      </ReactFlowProvider>
    </div>
  );
}

export default App;
