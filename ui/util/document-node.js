export default class DocumentNode {
  constructor(docNode) {
    Object.assign(this, docNode);
    this.children = docNode.children.map(c => new DocumentNode(c));
  }

  linearize() {
    return this.children.reduce(
      (soFar, nextNode) => soFar.concat(nextNode.linearize()), [this]);
  }

  firstMatch(filterFn) {
    if (filterFn(this)) {
      return this;
    }
    // Use for loop so we can short-circuit
    for (let idx = 0; idx < this.children.length; idx += 1) {
      const result = this.children[idx].firstMatch(filterFn);
      if (result) {
        return result;
      }
    }
    return null;
  }

  firstWithNodeType(nodeType) {
    return this.firstMatch(n => n.node_type === nodeType);
  }
}
