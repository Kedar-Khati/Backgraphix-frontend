import React from 'react';

const ClassNode = ({ data, type }) => {
  const getTypeColor = () => {
    switch(type) {
      case 'class': return '#FFD700';
      case 'interface': return '#87CEFA';
      case 'abstract': return '#98FB98';
      case 'enum': return '#FFA07A';
      default: return '#DDD';
    }
  };

  return (
    <div 
      className="class-node" 
      style={{ 
        backgroundColor: getTypeColor(),
        border: '2px solid #333',
        borderRadius: '5px',
        padding: '10px',
        minWidth: '200px'
      }}
    >
      <div className="class-header" style={{ borderBottom: '1px solid #333', marginBottom: '8px' }}>
        <strong>{type.toUpperCase()}:</strong> {data.className || 'Unnamed'}
      </div>
      
      {data.attributes?.length > 0 && (
        <div className="attributes-section">
          <div style={{ fontWeight: 'bold' }}>Attributes:</div>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            {data.attributes.map((attr, i) => (
              <li key={i}>{attr.name}: {attr.type}</li>
            ))}
          </ul>
        </div>
      )}
      
      {data.methods?.length > 0 && (
        <div className="methods-section">
          <div style={{ fontWeight: 'bold' }}>Methods:</div>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            {data.methods.map((method, i) => (
              <li key={i}>{method.name}(): {method.returnType}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ClassNode;