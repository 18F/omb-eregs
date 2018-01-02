import assert from 'assert';

import {
  convertContent,
  ordinalToLetter,
} from './save-doc';

import {toArray} from './util';

function convertChildNode(node) {
  return convertContent({content: toArray(node)}, {}).children[0];
}

function convertContentNode(node) {
  return convertContent({content: [node]}, {}).content[0];
}

export function testSectionWorks() {
  assert.deepEqual(convertChildNode({
    "type": "section",
    "content": [{
        "type": "heading",
        "content": [{"type": "text", "text": "Background"}],
    }]
  }), {
    node_type: "sec",
    title: "Background",
    children: [{
      node_type: "heading",
      content: [{
        content_type: '__text__',
        text: 'Background',
      }],
    }],
  });
}

export function testUnimplementedChildWorks() {
  const originalDbNode = {foo: 'bar'};
  const recoveredDbNode = convertChildNode({
    type: 'unimplemented_child',
    attrs: {data: JSON.stringify(originalDbNode)},
    content: [],
  });
  assert.deepEqual(originalDbNode, recoveredDbNode);
}

export function testUnimplementedContentWorks() {
  const originalDbNode = {foo: 'bar'};
  const recoveredDbNode = convertContentNode({
    type: 'unimplemented_content',
    attrs: {data: JSON.stringify(originalDbNode)},
    content: [],
  });
  assert.deepEqual(originalDbNode, recoveredDbNode);
}

export function testBulletListWorks() {
  assert.deepEqual(convertChildNode({
    type: 'bullet_list',
    content: [{
      type: 'list_item',
      content: [{"type": "text", "text": "list item one"}],
    }, {
      type: 'list_item',
      content: [{"type": "text", "text": "list item two"}],
    }],
  }), {
    "node_type": "list",
    "children": [
      {
        "node_type": "listitem",
        "type_emblem": "0",
        "marker": "●",
        "content": [
          {
            "content_type": "__text__",
            "text": "list item one"
          }
        ]
      },
      {
        "node_type": "listitem",
        "type_emblem": "1",
        "marker": "●",
        "content": [
          {
            "content_type": "__text__",
            "text": "list item two"
          }
        ]
      }
    ]
  });
}

export function testFootnoteCitationWorks() {
  const dbNode = convertContentNode({
    type: 'text',
    text: '1',
    marks: [{type: 'footnote_citation'}],
  });
  assert.deepEqual(dbNode, {
    "content_type": "footnote_citation",
    "text": "1",
    "inlines": [{
        "content_type": "__text__",
        "text": "1"
    }]
  });
}

export function testExternalLinkWorks() {
  const dbNode = convertContentNode({
    type: 'text',
    text: 'example dot org',
    marks: [{
      type: 'external_link',
      attrs: {href: 'http://example.org/'},
    }],
  });
  assert.deepEqual(dbNode, {
    "content_type": "external_link",
    "text": "example dot org",
    "href": "http://example.org/",
    "inlines": [{
        "content_type": "__text__",
        "text": "example dot org"
    }]
  });
}

export function testParagraphWorks() {
  assert.deepEqual(convertChildNode([{
    "type": "paragraph",
    "content": [{"type": "text", "text": "Hi I am a paragraph"}],
  }, {
    "type": "footnote",
    "attrs": {"marker": "3"},
    "content": [{"type": "text", "text": "Hi I am a footnote"}],
  }]), {
    node_type: 'para',
    content: [{
      content_type: '__text__',
      text: 'Hi I am a paragraph',
    }],
    children: [{
      node_type: 'footnote',
      marker: '3',
      content: [{
        content_type: '__text__',
        text: 'Hi I am a footnote',
      }],
    }],
  });
}

export function testOrdinalToLetterWorks() {
  assert.equal(ordinalToLetter(1), 'a');
  assert.equal(ordinalToLetter(2), 'b');
}
