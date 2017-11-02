export function linearize(docNode) {
  return docNode.children.reduce(
    (soFar, nextNode) => soFar.concat(linearize(nextNode)), [docNode]);
}

export function firstMatch(docNode, filterFn) {
  if (filterFn(docNode)) {
    return docNode;
  }
  // Use for loop so we can short-circuit
  for (let idx = 0; idx < docNode.children.length; idx += 1) {
    const result = firstMatch(docNode.children[idx], filterFn);
    if (result) {
      return result;
    }
  }
  return null;
}

export function firstWithNodeType(docNode, nodeType) {
  return firstMatch(docNode, n => n.node_type === nodeType);
}
