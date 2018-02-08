import { Node, ResolvedPos } from 'prosemirror-model';

import schema from './schema';

const defaultBullet = '●';
const bulletFollows = {
  '●': '○',
  '○': '■',
};

function parentListItem(pos: ResolvedPos): Node | void {
  let depth = pos.depth;
  // Walk up the document until we hit a list
  while (depth >= 0) {
    const node = pos.node(depth);
    if (node.type === schema.nodes.listitem) {
      return node;
    }
    depth -= 1;
  }
}

export function deeperBullet(pos: ResolvedPos): string {
  const parListItem = parentListItem(pos);
  if (parListItem) {
    return bulletFollows[parListItem.attrs.marker] || defaultBullet;
  }
  return defaultBullet;
}
