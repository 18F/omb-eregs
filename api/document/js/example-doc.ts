import { Node } from 'prosemirror-model';

import schema from './schema';

const EXAMPLE_DOC = {
  type: 'doc',
  content: [{
    type: 'paragraph',
    content: [{
      type: 'text',
      text: 'Hello, I am a paragraph.',
    }],
  }],
};

const exampleDoc = Node.fromJSON(schema, EXAMPLE_DOC);

export default exampleDoc;
