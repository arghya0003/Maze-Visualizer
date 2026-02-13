export function astar(grid, startNode, finishNode) {
    const visitedNodesInOrder = [];
    startNode.distance = 0; // "g" score
    startNode.totalDistance = 0; // "f" score (g + h)

    // Note: We use the existing 'distance' property as 'g' score
    // We'll need to add a property or use a map for 'f' score usually,
    // but for simplicity let's assume we can attach 'f' and 'h' to the node object transiently,
    // OR we can just use a priority queue structure.
    // For the purpose of this visualizer, let's keep it consistent with the node structure.

    // Initialize
    const openSet = [startNode];

    while (openSet.length > 0) {
        // Sort by f score (totalDistance). If tie, assume h score breakage or FIFO.
        sortNodesByTotalDistance(openSet);
        const closestNode = openSet.shift(); // Pop best node

        if (closestNode.isWall) continue;
        if (closestNode.distance === Infinity) return visitedNodesInOrder; // Should not happen if openSet is managed right

        closestNode.isVisited = true;
        visitedNodesInOrder.push(closestNode);

        if (closestNode === finishNode) return visitedNodesInOrder;

        updateUnvisitedNeighborsAstar(closestNode, grid, finishNode, openSet);
    }

    return visitedNodesInOrder;
}

function sortNodesByTotalDistance(nodes) {
    nodes.sort((nodeA, nodeB) => {
        // Primary sort: f-score
        if (nodeA.totalDistance !== nodeB.totalDistance) {
            return nodeA.totalDistance - nodeB.totalDistance;
        }
        // Tie-breaker: h-score (heuristic)
        // This makes it prefer expanding towards goal when costs are equal
        return nodeA.heuristicDistance - nodeB.heuristicDistance;
    });
}

const OCTILE_COST = Math.SQRT2; // Approx 1.414

function updateUnvisitedNeighborsAstar(node, grid, finishNode, openSet) {
    const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
    for (const neighbor of unvisitedNeighbors) {
        const isDiagonal = node.row !== neighbor.row && node.col !== neighbor.col;
        const additionalDistance = isDiagonal ? OCTILE_COST : 1;

        // Tentative g score
        const tentativeG = node.distance + additionalDistance;

        // If we found a better path or it's unvisited (distance is Infinity)
        if (tentativeG < neighbor.distance) {
            neighbor.distance = tentativeG;
            // Calculate H score (Octile distance)
            neighbor.heuristicDistance = octileDistance(neighbor, finishNode);
            // F score
            neighbor.totalDistance = neighbor.distance + neighbor.heuristicDistance;
            neighbor.previousNode = node;

            // Add to open set if not present (simple check, for large sets use Set/Map)
            if (!openSet.includes(neighbor)) {
                openSet.push(neighbor);
            }
        }
    }
}

function getUnvisitedNeighbors(node, grid) {
    const neighbors = [];
    const { col, row } = node;

    // Cardinal
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);

    // Diagonal
    if (row > 0 && col > 0) neighbors.push(grid[row - 1][col - 1]);
    if (row > 0 && col < grid[0].length - 1) neighbors.push(grid[row - 1][col + 1]);
    if (row < grid.length - 1 && col > 0) neighbors.push(grid[row + 1][col - 1]);
    if (row < grid.length - 1 && col < grid[0].length - 1) neighbors.push(grid[row + 1][col + 1]);

    return neighbors.filter((neighbor) => !neighbor.isVisited);
}

// Heuristic for 8-way movement
function octileDistance(nodeA, nodeB) {
    const dx = Math.abs(nodeA.row - nodeB.row);
    const dy = Math.abs(nodeA.col - nodeB.col);
    // formula: (dx + dy) + (SQRT2 - 2) * min(dx, dy)
    // but simplified if cardinal cost is 1 and diag cost is SQRT2:
    // bigger difference - smaller difference + smaller difference * SQRT2
    // or: max(dx, dy) - min(dx, dy) + min(dx, dy) * SQRT2
    // which simplifies to: (dx + dy) + (SQRT2 - 2) * min(dx, dy)
    return (dx + dy) + (OCTILE_COST - 2) * Math.min(dx, dy);
}
