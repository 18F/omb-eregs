import { Mark, Node } from 'prosemirror-model';

import { ApiNode, ApiContent } from './Api';

interface FootnoteMap {
  [typeEmblem: string]: ApiNode;
}

function mungeContent(content: ApiContent,
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
      content_type: 'inline_footnote',
    };
  }

  const inlines = content.inlines.map(content =>
    mungeContent(content, footnotes));
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
    mungeContent(content, footnotes));
  const children = node.children.map(child =>
    inlineFootnotes(child, footnotes));
  return { ...node, children, content };
}

export function munge(node: ApiNode): ApiNode {
  const footnotes: FootnoteMap = {};
  const withoutFootnotes = removeFootnotes(node, footnotes);
  return inlineFootnotes(withoutFootnotes, footnotes);
}

interface Uninlined {
  content: ApiContent[];
  footnotes: ApiNode[];
}

function combineUninlineds(uninlineds: Uninlined[]): Uninlined {
  return uninlineds.reduce(
    (acc, u) => ({
      content: acc.content.concat(u.content),
      footnotes: acc.footnotes.concat(u.footnotes),
    }),
    { content: [], footnotes: [] },
  );
}

function uninlineFootnotes(content: ApiContent): Uninlined {
  if (content.content_type === 'inline_footnote') {
    const footnoteNum = content.footnote_number;
    if (!footnoteNum) {
      throw new Error('inline footnotes must have footnote numbers!');
    }
    const citation: ApiContent = {
      content_type: 'footnote_citation',
      inlines: [],
      text: footnoteNum,
    };
    const footnote: ApiNode = {
      node_type: 'footnote',
      type_emblem: footnoteNum,
      marker: footnoteNum,
      children: [],
      content: content.inlines,
    };
    return {
      content: [citation],
      footnotes: [footnote],
    };
  }
  return combineUninlineds(content.inlines.map(uninlineFootnotes));
}

export function unmunge(node: ApiNode): ApiNode {
  const uninlined = combineUninlineds(node.content.map(uninlineFootnotes));
  const children = uninlined.footnotes.concat(node.children.map(unmunge));

  return { ...node, children, content: uninlined.content };
}
