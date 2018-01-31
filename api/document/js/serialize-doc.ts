import { Fragment, Mark, Node } from 'prosemirror-model';

import schema from './schema';

interface ApiNode {
  children: ApiNode[];
  content: ApiContent[];
  marker?: string;
  node_type: string;
  type_emblem?: string;
  // at some point, we'll need: title
}

interface ApiContent {
  content_type: string;
  inlines: ApiContent[];
  text: string;
}

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


const NODE_CONVERTERS = {
  heading: node => apiFactory.node(
    node.type.name,
    // Text isn't in an 'inline' block
    { content: convertTexts(node.content) },
  ),
  listitem(node) {
    // Note the existence of these two nodes is ensured by the schema
    const markerNode = node.content.child(0);
    const body = node.content.child(1);

    const children: ApiNode[] = [];
    body.forEach(child => children.push(serializeDoc(child)));
    const marker = markerNode.textContent;
    const typeEmblem = marker.replace(/[^a-zA-Z0-9]/, '');
    return apiFactory.node(
      node.type.name,
      typeEmblem ?
        { children, marker, type_emblem: typeEmblem } :
        { children, marker },
    );
  },
  unimplementedNode: node => node.attrs.data,
};

function defaultNodeConverter(node): ApiNode {
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
  unimplementedMark: node =>
    apiFactory.content(node.type.name, node.attrs.data),
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
