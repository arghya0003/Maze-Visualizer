# Maze Visualizer

An interactive pathfinding visualizer built with **React** and **Vite**. This application demonstrates how different algorithms navigate a grid to find the shortest path between a start node and a target node.

## 🚀 Live Demo
*(Replace this with your deployed link, e.g., https://arghya0003.github.io/Maze-Visualizer/)*

## 🧠 Algorithms Implemented

### 1. Dijkstra's Algorithm
- **Type**: Weighted (though currently using uniform weights).
- **Behavior**: Guarantees the shortest path. Explores nodes in all directions equally (like a ripple in water).
- **Movement**: Supports 8-directional movement (cardinal + diagonal).

### 2. A* Search Algorithm
- **Type**: Weighted + Heuristic.
- **Behavior**: Guarantees the shortest path. Uses heuristics (Octile distance) to estimate the distance to the goal, making it much faster and more improved than Dijkstra for pathfinding.
- **Movement**: Supports 8-directional movement.

## ✨ Features

- **Interactive Grid**: 
  - **Draw Walls**: Click and drag to create obstacles.
  - **Move Nodes**: Drag the **Start (Green)** and **Target (Red)** nodes to any position.
- **Randomization**: Instantly generate random start and end positions.
- **Visualization**: Watch the algorithms explore candidates (blue) and trace the final path (yellow).
- **Real-time Stats**: Track visited nodes, path cost, and execution time.
- **Responsive Design**: Clean, modern UI with a dark theme.

## 🛠️ Installation & Usage

1. **Clone the repository**
   ```bash
   git clone https://github.com/arghya0003/Maze-Visualizer.git
   cd Maze-Visualizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` to view it in the browser.

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
