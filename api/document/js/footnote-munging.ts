import { Mark, Node } from 'prosemirror-model';

import { ApiNode, ApiContent } from './Api';

interface FootnoteMap {
  [typeEmblem: string]: ApiNode;
}

function mungeApiContent(content: ApiContent,
                         footnotes: FootnoteMap): ApiContent {
  if (content.content_type === 'footnote_citation') {
    const footnoteNum = content.text;
    const footnote = footnotes[footnoteNum];
    if (!footnote) {
      throw new Error(`Footnote ${footnoteNum} not found!`);
    }
    const inlines = footnote.content;
    return {
      ...content,
      inlines,
      footnote_number: footnoteNum,
      content_type: 'munged_footnote',
    };
  }

  const inlines = content.inlines.map(content =>
    mungeApiContent(content, footnotes));
  return { ...content, inlines };
}

function removeFootnotes(node: ApiNode, footnotes: FootnoteMap): ApiNode {
  const children = node.children.filter((child) => {
    if (child.node_type === 'footnote') {
      if (!child.type_emblem)
        throw new Error('footnotes must have emblems!');
      footnotes[child.type_emblem] = child;
      return false;
    }
    return true;
  }).map(child =>
    removeFootnotes(child, footnotes));
  return { ...node, children };
}

function inlineFootnotes(node: ApiNode, footnotes: FootnoteMap): ApiNode {
  const content = node.content.map(content =>
    mungeApiContent(content, footnotes));
  const children = node.children.map(child =>
    inlineFootnotes(child, footnotes));
  return { ...node, children, content };
}

export function mungeApiNode(node: ApiNode): ApiNode {
  const footnotes: FootnoteMap = {};
  const withoutFootnotes = removeFootnotes(node, footnotes);
  return inlineFootnotes(withoutFootnotes, footnotes);
}

export function mungeNode(node: Node): Node {
  throw new Error('Implement this!');
}
