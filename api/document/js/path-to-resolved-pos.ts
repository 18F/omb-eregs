import { Node, NodeType, ResolvedPos } from 'prosemirror-model';

import schema from './schema';

export class NthType {
  nth: number;
  nodeType: NodeType;

  constructor(nth: number, nodeType: string | NodeType) {
    this.nth = nth;
    this.nodeType = nodeType instanceof NodeType ? nodeType : schema.nodes[nodeType];
  }
}

export type Selector = string | number | NthType;
export type SelectionPath = Selector[];

// Position of the nth child with of type nodeType
function getNodeTypeChildPos(initial: ResolvedPos, selector: NthType): ResolvedPos {
  let remainingInstances = selector.nth;
  let updatedPos: number = initial.start(initial.depth);
  for (let idx = 0; idx < initial.parent.content.childCount; idx += 1) {
    const child = initial.parent.content.child(idx);
    if (child.type === selector.nodeType && remainingInstances > 0) {
      remainingInstances -= 1;
    } else if (child.type === selector.nodeType) {
      return initial.doc.resolve(updatedPos + 1); // now inside that el
    }
    updatedPos += child.nodeSize;
  }
  throw new Error(`Could not find ${selector.nodeType.name} ${selector.nth}`);
}


function getChildPos(initial: ResolvedPos, selector: Selector): ResolvedPos {
  if (typeof selector === 'string') {
    return getNodeTypeChildPos(initial, new NthType(0, selector));
  }
  if (typeof selector === 'number') {
    return initial.doc.resolve(initial.pos + selector);
  }
  return getNodeTypeChildPos(initial, selector);
}

export default function pathToResolvedPos(
  initial: (ResolvedPos | Node),
  path: SelectionPath,
) {
  const initialPos = initial instanceof Node ? initial.resolve(0) : initial;
  return path.reduce(getChildPos, initialPos);
}

