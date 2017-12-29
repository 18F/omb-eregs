import assert from 'assert';

import {convertContent, CHILD_CONVERTERS} from './save-doc';

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

export function testParagraphWorks() {
  assert.deepEqual(convertContent({content: [{
    "type": "paragraph",
    "content": [{"type": "text", "text": "Hi I am a paragraph"}],
  }, {
    "type": "footnote",
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
        content: [{
          content_type: '__text__',
          text: 'Hi I am a footnote',
        }],
      }],
    }],
  });
}
