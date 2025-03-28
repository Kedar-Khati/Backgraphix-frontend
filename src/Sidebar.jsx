import React, { useState, useEffect } from 'react';
import { useDnD } from './DnDContext';

const nodeTypes = [
  { label: 'Class', value: 'class', color: '#FFD700' },
  { label: 'Interface', value: 'interface', color: '#87CEFA' },
  { label: 'Abstract', value: 'abstract', color: '#98FB98' },
  { label: 'Enum', value: 'enum', color: '#FFA07A' },
];

export default ({ nodes, setNodes, lastUpdate }) => {
  const [_, setType] = useDnD();
  const [jsonValue, setJsonValue] = useState('');
  const [isValidJson, setIsValidJson] = useState(true);
  const [selectedNodeType, setSelectedNodeType] = useState('class');

  const onDragStart = (event) => {
    setType(selectedNodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Update JSON when nodes change (excluding positions)
  useEffect(() => {
    const nodesWithoutPositions = nodes.map(({ position, ...node }) => node);
    setJsonValue(JSON.stringify(nodesWithoutPositions, null, 2));
  }, [nodes, lastUpdate]);

  // Handle JSON changes
  const handleJsonChange = (e) => {
    const value = e.target.value;
    setJsonValue(value);
    
    try {
      const parsed = JSON.parse(value);
      setIsValidJson(true);
      
      // Add default positions if not present
      const nodesWithPositions = parsed.map((node, index) => ({
        ...node,
        position: { x: index * 250, y: 0 } // Default position
      }));
      
      setNodes(nodesWithPositions);
    } catch (err) {
      setIsValidJson(false);
    }
  };

  return (
    <aside>
      <div className="node-creation-section">
        <div className="description">Select node type and drag to canvas</div>
        
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
            marginTop: '10px'
          }}
        >
          {selectedNodeType.toUpperCase()} Node
        </div>
      </div>

      <div className="json-editor-container">
        <h4>Nodes JSON (without positions)</h4>
        <textarea
          className={`json-editor ${!isValidJson ? 'invalid' : ''}`}
          value={jsonValue}
          onChange={handleJsonChange}
          spellCheck="false"
        />
        {!isValidJson && <div className="json-error">Invalid JSON</div>}
      </div>
    </aside>
  );
};