import { Node, NodeSpec } from 'prosemirror-model';
import { Transaction } from 'prosemirror-state';

import { ApiContent, ApiNode } from '../Api';
// These two would be recursive imports, but both should be resolved by the
// time we need them
import schema from '../schema';
import serializeDoc, { apiFactory, convertTexts } from '../serialize-doc';

export default interface DocNodeSpec extends NodeSpec {
  name: string;
  factory: (...args: any[]) => Node;
  // Make any changes to the document necessary to get to a valid doc
  canFixup: (node: Node, pos: number) => boolean;
  fixup: (transaction: Transaction, node: Node, pos: number) => Transaction;
  canParseApiNode: (node: ApiNode) => boolean;
  parseApiNode: (node: ApiNode) => Node;
  toApiNode: (node: Node) => (ApiNode | void);
}

export const defaultSpec = {
  canParseApiNode: (node: ApiNode) => node.node_type === this.name,
  toApiNode(node: Node) {
    const children: ApiNode[] = [];
    let content: ApiContent[] = [];
    node.content.forEach((child) => {
      if (child.type === schema.nodes.inline) {
        content = convertTexts(child.content);
      } else {
        children.push(serializeDoc(child));
      }
    });
    return apiFactory.node(
      this.name,
      { children, content },
    );
  },
};
