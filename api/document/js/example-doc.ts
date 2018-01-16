import { Node } from 'prosemirror-model';

import schema from './schema';

const EXAMPLE_DOC = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{
        type: 'text',
        text: 'Hello, I am a paragraph.',
      }],
    },
    {
      type: 'unimplemented_node',
      attrs: { data: '{"some": "stuff"}' },
      content: [{
        type: 'text',
        text: 'node_type_here',
      }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Some words then a ' },
        {
          type: 'text',
          text: 'link',
          marks: [{
            type: 'unimplemented_content',
            attrs: { data: '{"some": "content"}' },
          }],
        },
        { type: 'text', text: '.' },
      ],
    },
  ],
};

const exampleDoc = Node.fromJSON(schema, EXAMPLE_DOC);

export default exampleDoc;
