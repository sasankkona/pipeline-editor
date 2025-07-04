import React from 'react';

export default function JsonPreview({ nodes, edges }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 10,
      right: 10,
      width: 300,
      maxHeight: 200,
      overflowY: 'auto',
      backgroundColor: '#1e1e1e',
      color: '#d4d4d4',
      fontFamily: 'monospace',
      fontSize: 12,
      padding: 10,
      borderRadius: 5,
      boxShadow: '0 0 10px rgba(0,0,0,0.5)',
      zIndex: 100,
    }}>
      <h4 style={{ marginTop: 0, marginBottom: 10, color: '#61dafb' }}>DAG JSON Preview</h4>
      <pre>
        {JSON.stringify({ nodes, edges }, null, 2)}
      </pre>
    </div>
  );
}
