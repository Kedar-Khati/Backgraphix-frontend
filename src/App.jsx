import React, { useRef, useCallback, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  useReactFlow,
  Background,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Sidebar from './Sidebar';
import { DnDProvider, useDnD } from './DnDContext';
import ClassNode from './ClassNode';

const nodeTypes = {
  class: ClassNode,
  interface: ClassNode,
  abstract: ClassNode,
  enum: ClassNode,
};

const edgeTypes = {
  ASSOCIATION: {
    label: '→ Association',
    stroke: '#555',
    strokeWidth: 2,
    markerEnd: 'arrow'
  },
  INHERITANCE: {
    label: '▷ Inheritance',
    stroke: '#2563eb',
    strokeWidth: 2,
    markerEnd: 'arrowclosed'
  },
  COMPOSITION: {
    label: '◆ Composition',
    stroke: '#dc2626',
    strokeWidth: 2,
    markerEnd: 'diamond'
  },
  AGGREGATION: {
    label: '◇ Aggregation',
    stroke: '#d97706',
    strokeWidth: 2,
    markerEnd: 'diamond'
  }
};

let id = 0;
const getId = () => `dndnode_${id++}`;

const DnDFlow = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [selectedEdgeType, setSelectedEdgeType] = useState('ASSOCIATION');
  const [selectedNodeType, setSelectedNodeType] = useState('class');

  const onConnect = useCallback(
    (params) => {
      const edgeConfig = edgeTypes[selectedEdgeType] || edgeTypes.ASSOCIATION;
      const newEdge = {
        ...params,
        type: selectedEdgeType,
        markerEnd: edgeConfig.markerEnd,
        style: {
          stroke: edgeConfig.stroke,
          strokeWidth: edgeConfig.strokeWidth
        },
        data: {
          label: edgeConfig.label
        }
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [selectedEdgeType, setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const newNode = {
        id: getId(),
        type,
        position,
        data: { 
          className: `New${type.charAt(0).toUpperCase() + type.slice(1)}`,
          attributes: [
            { name: 'id', type: 'string' }
          ],
          methods: [
            { name: 'toString', returnType: 'string' }
          ]
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setLastUpdate(Date.now());
    },
    [screenToFlowPosition, type, setNodes]
  );

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNodeId) return;
    
    setNodes((nds) => nds.filter((node) => node.id !== selectedNodeId));
    setEdges((eds) => eds.filter((edge) => 
      edge.source !== selectedNodeId && edge.target !== selectedNodeId
    ));
    setSelectedNodeId(null);
    setLastUpdate(Date.now());
  }, [selectedNodeId, setNodes, setEdges]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeId(node.id);
    if (isConnecting) {
      if (!connectionStart) {
        setConnectionStart(node.id);
      } else if (connectionStart !== node.id) {
        const edgeConfig = edgeTypes[selectedEdgeType];
        const newEdge = {
          id: `edge_${connectionStart}_${node.id}_${Date.now()}`,
          source: connectionStart,
          target: node.id,
          type: selectedEdgeType,
          markerEnd: edgeConfig.markerEnd,
          style: {
            stroke: edgeConfig.stroke,
            strokeWidth: edgeConfig.strokeWidth
          },
          data: {
            label: edgeConfig.label
          }
        };
        setEdges((eds) => [...eds, newEdge]);
        setLastUpdate(Date.now());
        setIsConnecting(false);
        setConnectionStart(null);
      }
    }
  }, [isConnecting, connectionStart, selectedEdgeType, setEdges]);

  const onPaneClick = useCallback(() => {
    if (isConnecting) {
      setIsConnecting(false);
      setConnectionStart(null);
    }
  }, [isConnecting]);



  return (
    <div className="dndflow" style={{ display: 'flex', height: '100vh' }}>
      <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ flexGrow: 1 }}>
      <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      connectionMode="strict"
      fitView
      style={{ backgroundColor: "#F7F9FB" }}
      nodesDraggable={!isConnecting}
      >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      <Sidebar 
        nodes={nodes} 
        setNodes={setNodes} 
        edges={edges}
        setEdges={setEdges}
        lastUpdate={lastUpdate}
        setLastUpdate={setLastUpdate}
        selectedNodeId={selectedNodeId}
        deleteSelectedNode={deleteSelectedNode}
        isConnecting={isConnecting}
        setIsConnecting={setIsConnecting}
        selectedEdgeType={selectedEdgeType}
        setSelectedEdgeType={setSelectedEdgeType}
        connectionStart={connectionStart}
        setConnectionStart={setConnectionStart}
        selectedNodeType={selectedNodeType}
        setSelectedNodeType={setSelectedNodeType}
      />
    </div>
  );
};

export default () => (
  <ReactFlowProvider>
    <DnDProvider>
      <DnDFlow />
    </DnDProvider>
  </ReactFlowProvider>
);