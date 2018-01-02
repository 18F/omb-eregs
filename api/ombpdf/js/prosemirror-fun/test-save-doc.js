import assert from 'assert';

import {
  convertContent,
  CHILD_CONVERTERS,
  ordinalToLetter,
} from './save-doc';

export function testSectionWorks() {
  assert.deepEqual(CHILD_CONVERTERS.section({
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

function convertChildNode(node) {
  return convertContent({content: [node]}, {}).children[0];
}

function convertContentNode(node) {
  return convertContent({content: [node]}, {}).content[0];
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
  assert.deepEqual(convertContent({content: [{
    type: 'bullet_list',
    content: [{
      type: 'list_item',
      content: [{"type": "text", "text": "list item one"}],
    }, {
      type: 'list_item',
      content: [{"type": "text", "text": "list item two"}],
    }],
  }]}, {}), {
    "children": [
      {
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
      }
    ]
  });
}

export function testParagraphWorks() {
  assert.deepEqual(convertContent({content: [{
    "type": "paragraph",
    "content": [{"type": "text", "text": "Hi I am a paragraph"}],
  }, {
    "type": "footnote",
    "attrs": {"marker": "3"},
    "content": [{"type": "text", "text": "Hi I am a footnote"}],
  }]}, {}), {
    children: [{
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
    }],
  });
}

export function testOrdinalToLetterWorks() {
  assert.equal(ordinalToLetter(1), 'a');
  assert.equal(ordinalToLetter(2), 'b');
}
