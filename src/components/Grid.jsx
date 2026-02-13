import React, { useState, useEffect, useRef } from 'react';
import Node from './Node';
import Legend from './Legend';
import { dijkstra, getNodesInShortestPathOrder } from '../algorithms/dijkstra';
import { astar } from '../algorithms/astar';
import './Grid.css';

const Grid = () => {
    const [grid, setGrid] = useState([]);
    const [mouseIsPressed, setMouseIsPressed] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [stats, setStats] = useState({ visitedNodes: 0, pathLength: 0, time: 0 });
    const [selectedAlgorithm, setSelectedAlgorithm] = useState('dijkstra');

    // Ref to track if we are dragging special nodes
    const draggingNode = useRef(null); // 'start', 'finish', or null

    useEffect(() => {
        randomizeBoard();
    }, []);

    const getRandomCoords = () => {
        const row = Math.floor(Math.random() * ROWS);
        const col = Math.floor(Math.random() * COLS);
        return { row, col };
    }

    const randomizeBoard = () => {
        if (isRunning) return;
        setStats({ visitedNodes: 0, pathLength: 0, time: 0 });

        const start = getRandomCoords();
        let finish = getRandomCoords();

        // Ensure they are not the same
        while (start.row === finish.row && start.col === finish.col) {
            finish = getRandomCoords();
        }

        const initialGrid = getInitialGrid(start.row, start.col, finish.row, finish.col);
        setGrid(initialGrid);

        // Clear DOM classes
        clearDomClasses();
    };

    const handleMouseDown = (row, col) => {
        if (isRunning) return;

        const node = grid[row][col];
        if (node.isStart) {
            draggingNode.current = 'start';
        } else if (node.isFinish) {
            draggingNode.current = 'finish';
        } else {
            const newGrid = getNewGridWithWallToggled(grid, row, col);
            setGrid(newGrid);
        }
        setMouseIsPressed(true);
    };

    const handleMouseEnter = (row, col) => {
        if (!mouseIsPressed || isRunning) return;

        if (draggingNode.current) {
            const newGrid = getNewGridWithMovedNode(grid, row, col, draggingNode.current);
            setGrid(newGrid);
        } else {
            const newGrid = getNewGridWithWallToggled(grid, row, col);
            setGrid(newGrid);
        }
    };

    const handleMouseUp = () => {
        setMouseIsPressed(false);
        draggingNode.current = null;
    };

    const animateAlgorithm = (visitedNodesInOrder, nodesInShortestPathOrder, executionTime) => {
        for (let i = 0; i <= visitedNodesInOrder.length; i++) {
            if (i === visitedNodesInOrder.length) {
                setTimeout(() => {
                    animateShortestPath(nodesInShortestPathOrder);
                    setStats(prev => ({ ...prev, visitedNodes: visitedNodesInOrder.length, pathLength: nodesInShortestPathOrder.length, time: executionTime }));
                }, 10 * i);
                return;
            }
            setTimeout(() => {
                const node = visitedNodesInOrder[i];
                const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
                if (nodeElement && !node.isStart && !node.isFinish) {
                    nodeElement.className = 'node node-visited';
                }
            }, 10 * i);
        }
        // Update intermediate stats? Maybe too much re-render.
        // Let's just show final stats.
    };

    const animateShortestPath = (nodesInShortestPathOrder) => {
        for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
            setTimeout(() => {
                const node = nodesInShortestPathOrder[i];
                const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
                if (nodeElement && !node.isStart && !node.isFinish) {
                    nodeElement.className = 'node node-path';
                }
            }, 50 * i);
        }
        setIsRunning(false);
    };

    const visualize = () => {
        if (isRunning) return;
        setIsRunning(true);
        resetVisuals();

        const startNode = getStartNode(grid);
        const finishNode = getFinishNode(grid);

        const startTime = performance.now();
        let visitedNodesInOrder;
        if (selectedAlgorithm === 'dijkstra') {
            visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
        } else {
            visitedNodesInOrder = astar(grid, startNode, finishNode);
        }
        const endTime = performance.now();
        const executionTime = (endTime - startTime).toFixed(2);

        const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);

        animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder, executionTime);
    };

    // Helper to clear only paths/visited
    const resetVisuals = () => {
        // We also need to loop through DOM to remove classes because we manipulated DOM directly
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[0].length; col++) {
                const node = grid[row][col];
                node.isVisited = false;
                node.distance = Infinity;
                node.totalDistance = Infinity; // A*
                node.heuristicDistance = Infinity; // A*
                node.previousNode = null;

                const elem = document.getElementById(`node-${node.row}-${node.col}`);
                if (elem) {
                    let className = 'node';
                    if (node.isStart) className += ' node-start';
                    else if (node.isFinish) className += ' node-finish';
                    else if (node.isWall) className += ' node-wall';
                    elem.className = className;
                }
            }
        }
    }

    const clearDomClasses = () => {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const elem = document.getElementById(`node-${row}-${col}`);
                // Safely reset class, but we need to know if it's start/finish/wall?
                // Actually, when we setGrid(initialGrid), React will re-render and set classes based on props.
                // BUT, the 'node-visited' and 'node-path' classes were added manually to DOM, so persisting walls might be tricky if we don't clean them.
                // However, setGrid causes re-render. The Node component uses props to determine class.
                // The `extraClassName` in Node.jsx is derived from props.
                // The manual classes are added ON TOP.
                // So if we re-render, we should be fine IF the key changes or if we explicitly clean up.
                // To be safe, we should clean.
                if (elem) {
                    elem.classList.remove('node-visited', 'node-path');
                }
            }
        }
    }

    const clearBoard = () => {
        if (isRunning) return;
        setStats({ visitedNodes: 0, pathLength: 0, time: 0 });

        // Find current start and finish
        const startNode = getStartNode(grid);
        const finishNode = getFinishNode(grid);

        // Create new grid with SAME start/finish but no walls
        const initialGrid = getInitialGrid(startNode.row, startNode.col, finishNode.row, finishNode.col);
        setGrid(initialGrid);

        // DOM clear
        // Since we are resetting grid, we can just rely on re-render for base classes, 
        // but we must remove animation classes
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const elem = document.getElementById(`node-${row}-${col}`);
                if (elem) {
                    // Reset to basic class based on the NEW grid state (which is clean)
                    // But we can't easily access the new grid state inside this loop before render.
                    // Simpler: Just remove the extra classes.
                    elem.classList.remove('node-visited', 'node-path');
                    // Note: Walls are removed in state, so React will remove node-wall class.
                    // Start/Finish are kept, so React will keep node-start/finish.
                }
            }
        }
    }

    return (
        <div className="grid-wrapper">
            <Legend />
            <div className="controls">
                <select
                    value={selectedAlgorithm}
                    onChange={(e) => setSelectedAlgorithm(e.target.value)}
                    disabled={isRunning}
                    className="algo-select"
                >
                    <option value="dijkstra">Dijkstra's Algorithm</option>
                    <option value="astar">A* Algorithm</option>
                </select>
                <button onClick={visualize} disabled={isRunning}>
                    Visualize {selectedAlgorithm === 'dijkstra' ? "Dijkstra" : "A*"}
                </button>
                <button onClick={randomizeBoard} disabled={isRunning}>
                    Randomize Board
                </button>
                <button onClick={clearBoard} disabled={isRunning}>
                    Clear Board
                </button>
                <div className="stats">
                    <span>Visited: {stats.visitedNodes}</span>
                    <span>Path: {stats.pathLength}</span>
                    <span>Time: {stats.time}ms</span>
                </div>
            </div>
            <div className="grid">
                {grid.map((row, rowIdx) => {
                    return (
                        <div key={rowIdx} className="row">
                            {row.map((node, nodeIdx) => {
                                const { row, col, isFinish, isStart, isWall } = node;
                                return (
                                    <Node
                                        key={nodeIdx}
                                        col={col}
                                        row={row}
                                        isFinish={isFinish}
                                        isStart={isStart}
                                        isWall={isWall}
                                        mouseIsPressed={mouseIsPressed}
                                        onMouseDown={handleMouseDown}
                                        onMouseEnter={handleMouseEnter}
                                        onMouseUp={handleMouseUp}
                                    />
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- Helpers ---

const ROWS = 20;
const COLS = 50;

const getInitialGrid = (startRow, startCol, finishRow, finishCol) => {
    const grid = [];
    for (let row = 0; row < ROWS; row++) {
        const currentRow = [];
        for (let col = 0; col < COLS; col++) {
            currentRow.push(createNode(col, row, startRow, startCol, finishRow, finishCol));
        }
        grid.push(currentRow);
    }
    return grid;
};

const createNode = (col, row, startRow, startCol, finishRow, finishCol) => {
    return {
        col,
        row,
        isStart: row === startRow && col === startCol,
        isFinish: row === finishRow && col === finishCol,
        distance: Infinity,
        isVisited: false,
        isWall: false,
        previousNode: null,
    };
};

const getNewGridWithWallToggled = (grid, row, col) => {
    const newGrid = grid.slice();
    const node = newGrid[row][col];
    if (node.isStart || node.isFinish) return newGrid; // locked

    const newNode = {
        ...node,
        isWall: !node.isWall,
    };
    newGrid[row][col] = newNode;
    return newGrid;
};

const getNewGridWithMovedNode = (grid, row, col, nodeType) => {
    const newGrid = grid.slice();
    let prevRow, prevCol;

    for (let r = 0; r < newGrid.length; r++) {
        for (let c = 0; c < newGrid[r].length; c++) {
            if (nodeType === 'start' && newGrid[r][c].isStart) {
                prevRow = r; prevCol = c;
            } else if (nodeType === 'finish' && newGrid[r][c].isFinish) {
                prevRow = r; prevCol = c;
            }
        }
    }

    if (prevRow !== undefined) {
        newGrid[prevRow][prevCol] = {
            ...newGrid[prevRow][prevCol],
            isStart: false,
            isFinish: false
        };
    }

    newGrid[row][col] = {
        ...newGrid[row][col],
        isStart: nodeType === 'start',
        isFinish: nodeType === 'finish',
        isWall: false
    };

    return newGrid;
};

const getStartNode = (grid) => {
    for (const row of grid) {
        for (const node of row) {
            if (node.isStart) return node;
        }
    }
    return null;
}

const getFinishNode = (grid) => {
    for (const row of grid) {
        for (const node of row) {
            if (node.isFinish) return node;
        }
    }
    return null;
}

export default Grid;
