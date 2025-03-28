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

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
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
  }, []);

  return (
    <div className="dndflow">
      <div className="reactflow-wrapper" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          style={{ backgroundColor: "#F7F9FB" }}
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      <Sidebar 
        nodes={nodes} 
        setNodes={setNodes} 
        lastUpdate={lastUpdate}
        selectedNodeId={selectedNodeId}
        deleteSelectedNode={deleteSelectedNode}
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