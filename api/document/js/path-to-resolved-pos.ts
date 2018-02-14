// Exports a function to make generating ResolvedPos easier
import { Node, NodeType, ResolvedPos } from 'prosemirror-model';

import schema from './schema';

// Represents a query for the nth element of some type
export class NthType {
  nth: number;
  nodeType: NodeType;

  constructor(nth: number, nodeType: string | NodeType) {
    this.nth = nth;
    this.nodeType = nodeType instanceof NodeType ? nodeType : schema.nodes[nodeType];
  }

  // find the nth node of the right type, return the position within that node
  fromStart(initial: ResolvedPos): ResolvedPos {
    let remainingInstances = this.nth;
    let updatedPos: number = initial.start(initial.depth);
    for (let idx = 0; idx < initial.parent.childCount; idx += 1) {
      const child = initial.parent.content.child(idx);
      if (child.type === this.nodeType && remainingInstances > 0) {
        remainingInstances -= 1;
      } else if (child.type === this.nodeType) {
        return initial.doc.resolve(updatedPos + 1); // now inside that el
      }
      updatedPos += child.nodeSize;
    }
    throw new Error(`Could not find ${this.nodeType.name} ${this.nth}`);
  }
}

// string: select the first child with that node type
// number: increment the position this much
// NthType: select the nth child with that node type
export type Selector = string | number | NthType;


function getChildPos(initial: ResolvedPos, selector: Selector): ResolvedPos {
  if (typeof selector === 'string') {
    return new NthType(0, selector).fromStart(initial);
  }
  if (typeof selector === 'number') {
    return initial.doc.resolve(initial.pos + selector);
  }
  return selector.fromStart(initial);
}

// Create a new ResolvedPos by digging into the children of the first
// argument.
export default function pathToResolvedPos(
  initial: (ResolvedPos | Node),
  ...path: Selector[],
) {
  const initialPos = initial instanceof Node ? initial.resolve(0) : initial;
  return path.reduce(getChildPos, initialPos);
}

