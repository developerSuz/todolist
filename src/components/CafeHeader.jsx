import React from 'react';

const CafeHeader = ({ leftImageUrl, rightImageUrl }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top:'0', left: '0', backgroundColor: 'white', zIndex: '1000', width:'100vw !important', margin: '0 auto' }}>
      <img src={leftImageUrl} alt="Left Cafe Logo" style={{ width: '15vw', height: 'auto' }} />
      <h1 style={{ flex: 1, textAlign: 'center', margin: '0' }}>Academy Cafe</h1>
      <img src={rightImageUrl} alt="Right Cafe Logo" style={{ width: '15vw', height: 'auto' }} />
    </div>
  );
};

export default CafeHeader;
