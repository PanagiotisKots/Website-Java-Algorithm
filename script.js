// Select DOM elements
const logOutput = document.getElementById("log-output");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const autoButton = document.getElementById("autoButton");
const svgGraph = document.getElementById("graph");

// Function to log messages into the log box with a delay
function log(message) {
  setTimeout(() => {
    logOutput.textContent += message + '\n'; // Append message to the log
    logOutput.scrollTop = logOutput.scrollHeight; // Auto-scroll to the bottom
  }, 500); // Delay for 500ms between each log
}

// Define the graph structure with nodes and weighted edges
let graph = [
  { from: 0, to: 2, weight: 2 },
  { from: 0, to: 5, weight: 6 },
  { from: 1, to: 0, weight: 3 },
  { from: 1, to: 4, weight: 5 },
  { from: 2, to: 1, weight: 1 },
  { from: 2, to: 3, weight: 3 },
  { from: 2, to: 3, weight: 4 },
  { from: 3, to: 4, weight: 2 },
  { from: 4, to: 5, weight: 1 },
];

// Number of nodes in the graph
const numNodes = 6;
const nodeRadius = 20; // Radius of the nodes for SVG circles
const nodePositions = [
  { x: 100, y: 100 }, // Node 0
  { x: 300, y: 100 }, // Node 1
  { x: 100, y: 300 }, // Node 2
  { x: 300, y: 300 }, // Node 3
  { x: 200, y: 500 }, // Node 4
  { x: 500, y: 300 }, // Node 5
];

// Function to render the graph in the SVG container
function renderGraph() {
  // Clear previous graph
  svgGraph.innerHTML = "";

  // Render edges
  graph.forEach(edge => {
    const fromNode = nodePositions[edge.from];
    const toNode = nodePositions[edge.to];

    // Draw an edge (line) between nodes
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", fromNode.x);
    line.setAttribute("y1", fromNode.y);
    line.setAttribute("x2", toNode.x);
    line.setAttribute("y2", toNode.y);
    line.setAttribute("stroke", "white");  // Default color
    line.setAttribute("stroke-width", 2);
    line.setAttribute("id", `edge-${edge.from}-${edge.to}`);  // Unique ID for each edge
    svgGraph.appendChild(line);

    // Add edge weight label
    const middleX = (fromNode.x + toNode.x) / 2;
    const middleY = (fromNode.y + toNode.y) / 2;
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", middleX);
    text.setAttribute("y", middleY);
    text.setAttribute("fill", "yellow");
    text.setAttribute("font-size", "16");
    text.textContent = edge.weight;
    svgGraph.appendChild(text);
  });

  // Render nodes (circles)
  nodePositions.forEach((position, index) => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", position.x);
    circle.setAttribute("cy", position.y);
    circle.setAttribute("r", nodeRadius);
    circle.setAttribute("fill", "#3498db");
    circle.setAttribute("id", `node-${index}`);
    svgGraph.appendChild(circle);

    // Add node label (node index)
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", position.x);
    text.setAttribute("y", position.y);
    text.setAttribute("fill", "white");
    text.setAttribute("font-size", "16");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("alignment-baseline", "middle");
    text.textContent = index;
    svgGraph.appendChild(text);
  });
}

// Dijkstra's algorithm to find the shortest path from a source node
function dijkstra(source, numNodes, edges, delay) {
  const dist = Array(numNodes).fill(Infinity);
  dist[source] = 0;
  const visited = new Set();
  const queue = [source];

  const visitNode = (node) => {
    visited.add(node);
    document.getElementById(`node-${node}`).setAttribute("fill", "green");
  };

  // Use a delay to animate the algorithm step by step
  return new Promise(resolve => {
    (function step() {
      if (queue.length === 0) return resolve(dist);

      const node = queue.shift();
      if (visited.has(node)) return step();

      visitNode(node);
      log(`Visiting node ${node} with current distance ${dist[node]}`);

      // Find all the neighbors of the current node
      const neighbors = edges.filter(edge => edge.from === node);
      neighbors.forEach(edge => {
        const newDist = dist[node] + edge.weight;
        if (newDist < dist[edge.to]) {
          dist[edge.to] = newDist;
          log(`Updated distance to node ${edge.to}: ${dist[edge.to]}`);
        }

        // Mark the edge being considered
        const line = document.querySelector(`line[x1="${nodePositions[node].x}"][y1="${nodePositions[node].y}"][x2="${nodePositions[edge.to].x}"][y2="${nodePositions[edge.to].y}"]`);
        if (line) {
          line.setAttribute("stroke", "yellow");  // Color edge yellow during processing
          line.style.transition = "stroke 1s ease-in-out";  // Smooth transition for the edge color
        }

        queue.push(edge.to);
      });

      // Wait for 2 seconds before proceeding to the next node
      setTimeout(step, delay); // Delay between each step
    })();
  });
}

// Reverse the graph (reverse the direction of each edge)
function reverseGraph(edges) {
  return edges.map(edge => ({ from: edge.to, to: edge.from, weight: edge.weight }));
}

// Run Dijkstra on the reversed graph starting from the destination
function runReverseDijkstra(source, numNodes, reverseEdges, delay) {
  const dist = Array(numNodes).fill(Infinity);
  dist[source] = 0;
  const visited = new Set();
  const queue = [source];

  const visitNode = (node) => {
    visited.add(node);
    document.getElementById(`node-${node}`).setAttribute("fill", "red");
  };

  // Use a delay to animate the algorithm step by step
  return new Promise(resolve => {
    (function step() {
      if (queue.length === 0) return resolve(dist);

      const node = queue.shift();
      if (visited.has(node)) return step();

      visitNode(node);
      log(`Visiting node ${node} with current distance ${dist[node]}`);

      // Find all the neighbors of the current node in the reverse graph
      const neighbors = reverseEdges.filter(edge => edge.from === node);
      neighbors.forEach(edge => {
        const newDist = dist[node] + edge.weight;
        if (newDist < dist[edge.to]) {
          dist[edge.to] = newDist;
          log(`Updated distance to node ${edge.to}: ${dist[edge.to]}`);
        }

        // Mark the edge being considered
        const line = document.querySelector(`line[x1="${nodePositions[node].x}"][y1="${nodePositions[node].y}"][x2="${nodePositions[edge.to].x}"][y2="${nodePositions[edge.to].y}"]`);
        if (line) {
          line.setAttribute("stroke", "orange");  // Color edge orange during reverse processing
          line.style.transition = "stroke 1s ease-in-out";  // Smooth transition for the edge color
        }

        queue.push(edge.to);
      });

      // Wait for 2 seconds before proceeding to the next node
      setTimeout(step, delay); // Delay between each step
    })();
  });
}

// Main function to calculate the minimum weight path
async function calculateMinimumWeight(src1, src2, dest, numNodes, edges, delay) {
  // Step 1: Dijkstra from src1 to all nodes
  log("Starting Dijkstra from src1: " + src1);
  const dist1 = await dijkstra(src1, numNodes, edges, delay);
  log(`Shortest paths from src1 completed. Distances: ${dist1}`);

  // Step 2: Dijkstra from src2 to all nodes
  log("Starting Dijkstra from src2: " + src2);
  const dist2 = await dijkstra(src2, numNodes, edges, delay);
  log(`Shortest paths from src2 completed. Distances: ${dist2}`);

  // Step 3: Dijkstra from dest (reverse graph)
  log("Starting Dijkstra to dest (reverse graph): " + dest);
  const reverseEdges = reverseGraph(edges);
  const distToDest = await runReverseDijkstra(dest, numNodes, reverseEdges, delay);
  log(`Shortest paths from dest completed. Distances: ${distToDest}`);

  // Step 4: Calculate the minimum combined path distance
  let minDistance = Infinity;
  for (let i = 0; i < numNodes; i++) {
    const combinedDist = dist1[i] + dist2[i] + distToDest[i];
    log(`Node ${i}: d1 = ${dist1[i]}, d2 = ${dist2[i]}, d3 = ${distToDest[i]}`);
    log(`  -> Combined distance: ${combinedDist}`);
    if (combinedDist < minDistance) {
      minDistance = combinedDist;
    }
  }

  log(`Final minimum weight: ${minDistance}`);
}

// Event listeners for button actions
startButton.addEventListener("click", () => {
  logOutput.textContent = ''; // Clear previous logs
  renderGraph(); // Render the graph
  calculateMinimumWeight(0, 1, 5, numNodes, graph, 2000); // Start animation and algorithm with src1=0, src2=1, dest=5
});

// Restart button to clear logs and graph
restartButton.addEventListener('click', () => {
  logOutput.textContent = ''; // Clear the log
  svgGraph.innerHTML = ''; // Clear the SVG graph
});
