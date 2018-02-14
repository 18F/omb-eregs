import { Fragment, Mark, Node } from 'prosemirror-model';

import { ApiNode, ApiContent } from './Api';
import schema from './schema';

export const apiFactory = {
  node(nodeType, overrides): ApiNode {
    return {
      node_type: nodeType,
      children: [],
      content: [],
      ...(overrides || {}),
    };
  },
  content(contentType, overrides): ApiContent {
    return {
      content_type: contentType,
      inlines: [],
      text: '',
      ...(overrides || {}),
    };
  },
  text: value => ({
    content_type: '__text__',
    inlines: [],
    text: value,
  }),
};

type NodeConverterMap = {
  [nodeName: string]: (node: Node) => ApiNode,
};

const NODE_CONVERTERS: NodeConverterMap = {
  heading: node => apiFactory.node(
    node.type.name,
    // Text isn't in an 'inline' block
    { content: convertTexts(node.content) },
  ),
  listitem(node) {
    const children: ApiNode[] = [];
    node.content.forEach(child => children.push(serializeDoc(child)));
    const marker = node.attrs.marker;
    const typeEmblem = marker.replace(/[^a-zA-Z0-9]/, '');
    return apiFactory.node(
      node.type.name,
      typeEmblem ?
        { children, marker, type_emblem: typeEmblem } :
        { children, marker },
    );
  },
  sec(node) {
    const headerNode = node.content.child(0);
    const title = headerNode.textContent;
    const sec = defaultNodeConverter(node);
    sec.title = title;

    return sec;
  },
  unimplementedNode: node => node.attrs.data,
};

function defaultNodeConverter(node: Node): ApiNode {
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
    node.type.name,
    { children, content },
  );
}

const MARK_CONVERTERS = {
  unimplementedMark: mark =>
    apiFactory.content(mark.type.name, mark.attrs.data),
  external_link: mark =>
  apiFactory.content(mark.type.name, { href: mark.attrs.href }),
};


export default function serializeDoc(node: Node): ApiNode {
  const converter = NODE_CONVERTERS[node.type.name] || defaultNodeConverter;
  return converter(node);
}

// This doesn't combine adjacent marks at all; instead we'll make a "tall" set
// of nested annotations to wrap each chunk of text.
export function nestMarks(text: string, marks: Mark[]): ApiContent {
  if (marks.length === 0) {
    return apiFactory.text(text);
  }
  const mark = marks[0];
  const converted = MARK_CONVERTERS[mark.type.name](mark);
  converted.inlines = [nestMarks(text, marks.slice(1))];
  return converted;
}

export function convertTexts(textNodes: Fragment): ApiContent[] {
  const result: any[] = [];
  textNodes.forEach((textNode) => {
    result.push(nestMarks(textNode.text || '', textNode.marks));
  });
  return result;
}
