import DocumentNode from '../../util/document-node';

const defaults = {
  children: [],
  content: [],
  identifier: '',
  marker: '',
  text: '',
};

export default function nodeFactory(attrs = null) {
  return new DocumentNode({
    ...defaults,
    ...(attrs || {}),
  });
}
