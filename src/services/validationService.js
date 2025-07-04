/**
 * Validation service for DAG rules
 */

export function hasMinimumNodes(nodes) {
  return nodes.length >= 2;
}

export function hasNoSelfLoops(edges) {
  return edges.every(edge => edge.source !== edge.target);
}

export function hasValidEdgeDirections(edges) {
  // Validate that edges connect outgoing (sourceHandle) to incoming (targetHandle)
  // Assuming edge objects have sourceHandle and targetHandle properties
  return edges.every(edge => {
    // sourceHandle should be 'source' or 'right' (outgoing)
    // targetHandle should be 'target' or 'left' (incoming)
    // Adjust based on how handles are named in the app
    if (!edge.sourceHandle || !edge.targetHandle) {
      // If handles are missing, consider invalid
      return false;
    }
    // For this app, sourceHandle should be 'right' and targetHandle should be 'left'
    return edge.sourceHandle === 'right' && edge.targetHandle === 'left';
  });
}

export function areAllNodesConnected(nodes, edges) {
  const connectedNodeIds = new Set();
  edges.forEach(edge => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });
  return nodes.every(node => connectedNodeIds.has(node.id));
}

export function hasNoCycles(nodes, edges) {
  // Build adjacency list
  const adjacency = {};
  nodes.forEach(node => {
    adjacency[node.id] = [];
  });
  edges.forEach(edge => {
    adjacency[edge.source].push(edge.target);
  });

  const visited = new Set();
  const recStack = new Set();

  function dfs(nodeId) {
    if (!visited.has(nodeId)) {
      visited.add(nodeId);
      recStack.add(nodeId);

      for (const neighbor of adjacency[nodeId]) {
        if (!visited.has(neighbor) && dfs(neighbor)) {
          return true;
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }
    }
    recStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (dfs(node.id)) {
      return false; // cycle detected
    }
  }
  return true; // no cycles
}

/**
 * Main validation function
 * Returns { isValid: boolean, errors: string[] }
 */
export function validateDAG(nodes, edges) {
  const errors = [];

  if (!hasMinimumNodes(nodes)) {
    errors.push('Pipeline must have at least 2 nodes.');
  }
  if (!hasNoSelfLoops(edges)) {
    errors.push('Self-loops are not allowed.');
  }
  if (!hasValidEdgeDirections(edges)) {
    errors.push('Edges must connect outgoing to incoming handles.');
  }
  if (!areAllNodesConnected(nodes, edges)) {
    errors.push('All nodes must be connected to at least one edge.');
  }
  if (!hasNoCycles(nodes, edges)) {
    errors.push('Pipeline must not contain cycles.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
