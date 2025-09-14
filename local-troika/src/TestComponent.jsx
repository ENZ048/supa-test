import React from 'react';

const TestComponent = () => {
  console.log("TestComponent is rendering!");
  
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue', margin: '20px' }}>
      <h1>Test Component</h1>
      <p>This is a test component to verify React is working.</p>
    </div>
  );
};

export default TestComponent;
