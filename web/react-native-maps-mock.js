import React from 'react';

// Mock components and exports that react-native-maps typically provides
const MapView = (props) => (
  <div 
    {...props} 
    style={{ 
      width: '100%', 
      height: '100%', 
      backgroundColor: '#2c2c2c', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      color: '#f5f5f5',
      border: '1px solid #999999',
      borderRadius: '12px'
    }}
  >
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
        Mapa Interactivo
      </div>
      <div style={{ fontSize: '14px', opacity: 0.8 }}>
        Vista web del mapa de Argentina
      </div>
    </div>
  </div>
);

const Marker = () => null;
const Polygon = () => null;

export default MapView;
export const PROVIDER_GOOGLE = 'google';
export { Marker, Polygon };