import { Node, ResolvedPos } from 'prosemirror-model';

export function getEl(selector: string): HTMLElement {
  const el = document.querySelector(selector);
  if (!el || !(el instanceof HTMLElement))
    throw new Error(`element with selector '${selector}' not found`);
  return el;
}

export function getElAttr(selector: string, attr: string): string {
  const value = getEl(selector).getAttribute(attr);

  if (value === null) {
    throw new Error(`'${selector}' has no ${attr} attribute`);
  }

  return value;
}

export function walkUpUntil(pos: ResolvedPos, predicate: (node: Node) => boolean) {
  let depth = pos.depth;
  while (depth >= 0) {
    const node = pos.node(depth);
    if (predicate(node)) {
      break;
    }
    depth -= 1;
  }
  return depth;
}
