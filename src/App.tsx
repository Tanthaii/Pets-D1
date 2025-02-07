import React from 'react';
import { Home } from './pages/Home';
import { Detection } from './pages/Detection';
import { Register } from './pages/Register';

function App() {
  const path = window.location.pathname;

  return (
    <div className="app-container">
      {path === '/detection' ? <Detection /> :
       path === '/register' ? <Register /> :
       <Home />}
    </div>
  );
}

export default App;