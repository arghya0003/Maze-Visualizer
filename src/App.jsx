import React from 'react';
import Grid from './components/Grid';
import './index.css';

function App() {
  return (
    <div className="app-container">
      <header>
        <h1>Maze Visualizer: Dijkstra vs A*</h1>
      </header>
      <main>
        <Grid />
      </main>
    </div>
  );
}

export default App;
