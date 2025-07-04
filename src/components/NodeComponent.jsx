import React from 'react';
import { Handle, Position } from 'reactflow';

export default function NodeComponent({ data }) {
  // Determine badge color based on node type if provided
  const type = data.type || 'normal';
  const badgeColor = {
    source: '#4caf50',       // Green
    processing: '#2196f3',   // Blue
    output: '#ff9800',       // Orange
    normal: '#777',          // Gray
    validation: '#9c27b0',  // Purple
    error: '#f44336',       // Red
    warning: '#ffeb3b',     // Yellow
    info: '#00bcd4',        // Cyan
    } [type] || '#777';
    
    return (
    <div style={{
      padding: 10,
      border: '2px solid ' + badgeColor,
      borderRadius: 5,
      background: '#eee',
      position: 'relative',
      minWidth: 100,
      textAlign: 'center',
      userSelect: 'none',
      }}>
      <Handle type="target" position={Position.Left} id="left" style={{ background: '#555' }} />
      <div>
        {data.label}
      </div>
      <div style={{
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: badgeColor,
        color: 'white',
        borderRadius: '50%',
        width: 16,
        height: 16,
        fontSize: 10,
        lineHeight: '16px',
        fontWeight: 'bold',
        userSelect: 'none'
      }}>
        { type.charAt(0).toUpperCase() }
      </div>
      <Handle type="source" position={Position.Right} id="right" style={{ background: '#555' }} />
    </div>
  );
}