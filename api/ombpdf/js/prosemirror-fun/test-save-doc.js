import assert from 'assert';

import {CHILD_CONVERTERS} from './save-doc';

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
