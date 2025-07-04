import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    Background,
    Controls,
    useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { validateDAG } from '../services/validationService';
import { applyAutoLayout } from '../services/layoutService';
import NodeComponent from './NodeComponent';
import JsonPreview from './JsonPreview';
import { FaTrash, FaUndo, FaRedo, FaLink, FaArrowsAlt } from 'react-icons/fa';

export default function PipelineEditor() {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [validationStatus, setValidationStatus] = useState({ isValid: true, errors: [] });
    const [contextMenu, setContextMenu] = useState(null);
    const [selectedElement, setSelectedElement] = useState(null);
    const { fitView } = useReactFlow();

    // History state for undo/redo
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const saveHistory = useCallback((newNodes, newEdges) => {
        const updatedHistory = history.slice(0, historyIndex + 1);
        updatedHistory.push({ nodes: newNodes, edges: newEdges });
        setHistory(updatedHistory);
        setHistoryIndex(updatedHistory.length - 1);
    }, [history, historyIndex]);

    // Save initial empty state to history on mount
    useEffect(() => {
        saveHistory(nodes, edges);
    }, []);

    const onConnect = useCallback(
        (params) => {
            // Disallow self-loop
            if (params.source === params.target) {
                alert('Self-connections are not allowed.');
                return;
            }
            // Disallow outgoing->outgoing or incoming->incoming connections
            if (params.sourceHandle === params.targetHandle) {
                alert('Invalid connection: must connect outgoing to incoming.');
                return;
            }
            setEdges((eds) => {
                const newEdges = addEdge(params, eds);
                saveHistory(nodes, newEdges);
                return newEdges;
            });
        },
        [nodes, saveHistory]
    );

    const onNodesChange = useCallback(
        (changes) => {
            setNodes((nds) => {
                const newNodes = applyNodeChanges(changes, nds);
                saveHistory(newNodes, edges);
                return newNodes;
            });
        },
        [edges, saveHistory]
    );

    const onEdgesChange = useCallback(
        (changes) => {
            setEdges((eds) => {
                const newEdges = applyEdgeChanges(changes, eds);
                saveHistory(nodes, newEdges);
                return newEdges;
            });
        },
        [nodes, saveHistory]
    );

    const handleAddNode = useCallback(() => {
        const label = prompt('Enter node name');
        if (!label) return;

        const nodeType = 'normal';

        setNodes((nds) => [
            ...nds,
            {
                id: `${Date.now()}`,
                type: 'customNode',
                data: { label, type: nodeType },
                position: { x: 100, y: 100 }, // adjust as you like
                sourcePosition: 'right',
                targetPosition: 'left',
            },
        ]);
    }, []);

    const handleAutoLayout = useCallback(() => {
        setNodes((nds) => {
            const { nodes: newNodes, edges: newEdges } = applyAutoLayout(nds, edges);
            setEdges(newEdges);
            return newNodes;
        });
        fitView();
    }, [edges, fitView]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Delete' || event.key === 'Backspace') {
                if (selectedElement) {
                    if (selectedElement.id) {
                        if (selectedElement.source) {
                            // It's an edge
                            const newEdges = edges.filter((e) => e.id !== selectedElement.id);
                            setEdges(newEdges);
                            saveHistory(nodes, newEdges);
                        } else {
                            // It's a node
                            const newNodes = nodes.filter((n) => n.id !== selectedElement.id);
                            const newEdges = edges.filter((e) => e.source !== selectedElement.id && e.target !== selectedElement.id);
                            setNodes(newNodes);
                            setEdges(newEdges);
                            saveHistory(newNodes, newEdges);
                        }
                    }
                    setSelectedElement(null);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedElement, nodes, edges, saveHistory]);

    useEffect(() => {
        const result = validateDAG(nodes, edges);
        setValidationStatus(result);
    }, [nodes, edges]);

    const onElementClick = useCallback((event, element) => {
        setSelectedElement(element);
        setContextMenu(null);
    }, []);

    const onContextMenu = useCallback((event) => {
        event.preventDefault();
        if (selectedElement) {
            setContextMenu({
                mouseX: event.clientX - 2,
                mouseY: event.clientY - 4,
            });
        } else {
            setContextMenu(null);
        }
    }, [selectedElement]);

    const handleDelete = () => {
        if (selectedElement) {
            if (selectedElement.id) {
                if (selectedElement.source) {
                    // It's an edge
                    setEdges((eds) => eds.filter((e) => e.id !== selectedElement.id));
                } else {
                    // It's a node
                    setNodes((nds) => nds.filter((n) => n.id !== selectedElement.id));
                    setEdges((eds) => eds.filter((e) => e.source !== selectedElement.id && e.target !== selectedElement.id));
                }
            }
            setSelectedElement(null);
            setContextMenu(null);
        }
    };

    return (
        <div style={{ width: '100%', height: '100vh' }} onContextMenu={onContextMenu}>
            <div style={{ position: 'absolute', zIndex: 10, left: 10, top: 10, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button onClick={handleAddNode} title="Add a new node" style={{ display: 'flex', alignItems: 'center' }}>
                    <FaLink style={{ marginRight: 5 }} />
                    Add Node
                </button>
                <button onClick={handleAutoLayout} title="Auto layout nodes" style={{ display: 'flex', alignItems: 'center' }}>
                <FaArrowsAlt style={{ marginRight: 5 }} />
                Auto Layout
            </button>
            <button onClick={() => {
                if (historyIndex > 0) {
                    const prevIndex = historyIndex - 1;
                    const { nodes: prevNodes, edges: prevEdges } = history[prevIndex];
                    setNodes(prevNodes);
                    setEdges(prevEdges);
                    setHistoryIndex(prevIndex);
                }
            }} title="Undo last action" style={{ display: 'flex', alignItems: 'center' }}>
                <FaUndo />
            </button>
            <button onClick={() => {
                if (historyIndex < history.length - 1) {
                    const nextIndex = historyIndex + 1;
                    const { nodes: nextNodes, edges: nextEdges } = history[nextIndex];
                    setNodes(nextNodes);
                    setEdges(nextEdges);
                    setHistoryIndex(nextIndex);
                }
            }} title="Redo last undone action" style={{ display: 'flex', alignItems: 'center' }}>
                <FaRedo />
            </button>
            <button onClick={handleDelete} title="Delete selected node or edge" style={{ display: 'flex', alignItems: 'center' }}>
                <FaTrash />
            </button>
            </div>
            <div style={{ position: 'absolute', zIndex: 10, right: 10, top: 10, maxWidth: '35%', color: validationStatus.isValid ? 'green' : 'red', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingLeft: 20 }}>
                {validationStatus.isValid ? 'Valid DAG' : `Invalid DAG: ${validationStatus.errors.join(', ')}`}
            </div>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onConnect={onConnect}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onElementClick={onElementClick}
                fitView
                nodeTypes={{ customNode: NodeComponent }}
                defaultEdgeOptions={{markerEnd: { type: 'arrowclosed' }}}
                // defaultEdgeOptions={{ animated: true, style: { stroke: '#000000' }, markerEnd: { type: 'arrowclosed' } }}
            >
                <Background />
                <Controls style={{ gap: '10px' }} />
            </ReactFlow>
            <JsonPreview nodes={nodes} edges={edges} />
            {contextMenu ? (
                <ul
                    style={{
                        position: 'absolute',
                        top: contextMenu.mouseY,
                        left: contextMenu.mouseX,
                        backgroundColor: 'white',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        padding: '10px',
                        borderRadius: '4px',
                        listStyle: 'none',
                        zIndex: 100,
                    }}
                >
                    <li
                        style={{ cursor: 'pointer', padding: '5px 10px' }}
                        onClick={handleDelete}
                    >
                        Delete
                    </li>
                </ul>
            ) : null}
        </div>
    );
}
