import React from 'react';

const BasicImpactSection = () => {
  return (
    <div style={{
      backgroundColor: 'lightgreen',
      padding: '50px 20px',
      textAlign: 'center',
      borderTop: '5px solid green',
      borderBottom: '5px solid green'
    }}>
      <h2 style={{
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '20px'
      }}>
        Our Environmental Impact
      </h2>
      
      <p style={{
        maxWidth: '800px',
        margin: '0 auto 40px',
        lineHeight: 1.6
      }}>
        Together with our community, we've made significant progress towards a more sustainable future.
      </p>
      
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '20px',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          minWidth: '200px'
        }}>
          <h3>Trees Planted</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>85,432</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          minWidth: '200px'
        }}>
          <h3>CO₂ Reduced</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>1.2M tons</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          minWidth: '200px'
        }}>
          <h3>Projects</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>342</div>
        </div>
      </div>
    </div>
  );
};

export default BasicImpactSection; 