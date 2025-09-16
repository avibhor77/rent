import React from 'react';

console.log('App component is loading...');

function App() {
  console.log('App component is rendering...');
  return React.createElement('div', null, 
    React.createElement('h1', null, 'Rent Management System'),
    React.createElement('p', null, 'Application is working!')
  );
}

export default App;