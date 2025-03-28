import React, { useState, useEffect } from 'react';
import { useDnD } from './DnDContext';

const nodeTypes = [
  { label: 'Class', value: 'class', color: '#FFD700' },
  { label: 'Interface', value: 'interface', color: '#87CEFA' },
  { label: 'Abstract', value: 'abstract', color: '#98FB98' },
  { label: 'Enum', value: 'enum', color: '#FFA07A' },
];

const cleanNodeForExport = (node) => ({
  id: node.id,
  type: node.type,
  data: {
    className: node.data.className,
    ...(node.data.attributes && { attributes: node.data.attributes }),
    ...(node.data.methods && { methods: node.data.methods })
  }
});

export default ({ nodes, setNodes, lastUpdate, selectedNodeId, deleteSelectedNode }) => {
  const [_, setType] = useDnD();
  const [jsonValue, setJsonValue] = useState('');
  const [isValidJson, setIsValidJson] = useState(true);
  const [selectedNodeType, setSelectedNodeType] = useState('class');

  const onDragStart = (event) => {
    setType(selectedNodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Update JSON when selected node changes
  useEffect(() => {
    if (selectedNodeId) {
      const selectedNode = nodes.find(node => node.id === selectedNodeId);
      if (selectedNode) {
        setJsonValue(JSON.stringify(cleanNodeForExport(selectedNode), null, 2));
      }
    } else {
      setJsonValue(''); // Clear when no node selected
    }
  }, [selectedNodeId, nodes, lastUpdate]);

  const handleJsonChange = (e) => {
    const value = e.target.value;
    setJsonValue(value);
    
    if (!selectedNodeId) return;
    
    try {
      const parsedNode = JSON.parse(value);
      setIsValidJson(true);
      
      setNodes(prevNodes => 
        prevNodes.map(node => {
          if (node.id === selectedNodeId) {
            // Preserve position and visual properties while updating data
            return {
              ...node,
              type: parsedNode.type || node.type,
              data: {
                ...node.data,
                ...parsedNode.data,
                className: parsedNode.data?.className || node.data.className,
                attributes: parsedNode.data?.attributes || node.data.attributes,
                methods: parsedNode.data?.methods || node.data.methods
              }
            };
          }
          return node;
        })
      );
    } catch (err) {
      setIsValidJson(false);
    }
  };

  return (
    <aside>
      <div className="sidebar-header">
        <h3>Website Model Editor</h3>
        <div className="sidebar-divider"></div>
      </div>

      <div className="node-creation-section">
        <div className="description">
          Select a node type below and drag it onto the canvas to begin modeling.
        </div>
        
        <div className="node-type-selector">
          {nodeTypes.map((type) => (
            <button
              key={type.value}
              className={`node-type-btn ${selectedNodeType === type.value ? 'active' : ''}`}
              style={{ backgroundColor: type.color }}
              onClick={() => setSelectedNodeType(type.value)}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div 
          className="dndnode" 
          onDragStart={onDragStart}
          draggable
          style={{ 
            backgroundColor: nodeTypes.find(t => t.value === selectedNodeType).color,
            margin: '15px 0'
          }}
        >
          {selectedNodeType.toUpperCase()} Node
        </div>

        <button
          className="delete-btn"
          onClick={deleteSelectedNode}
          disabled={!selectedNodeId}
        >
          {selectedNodeId ? 'Delete Selected Node' : 'No Node Selected'}
        </button>
      </div>

      <div className="json-editor-container">
        <h4>Selected Node Definition (JSON)</h4>
        {selectedNodeId ? (
          <>
            <textarea
              className={`json-editor ${!isValidJson ? 'invalid' : ''}`}
              value={jsonValue}
              onChange={handleJsonChange}
              spellCheck="false"
              placeholder="Edit the selected node's JSON..."
            />
            {!isValidJson && (
              <div className="json-error">
                <i className="error-icon">⚠️</i> Invalid JSON format
              </div>
            )}
          </>
        ) : (
          <div className="no-selection-message">
            Select a node on canvas to edit its properties
          </div>
        )}
      </div>
    </aside>
  );
};