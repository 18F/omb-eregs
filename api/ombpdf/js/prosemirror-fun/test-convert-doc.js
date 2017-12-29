import assert from 'assert';
import {Node} from "prosemirror-model";

import convertDoc from './convert-doc';
import schema from './policy-schema';

function makeDbDoc(children) {
  return {node_type: 'policy', children: children};
}

function captureWarnings(fn) {
  const oldWarn = console.warn;
  const warnings = [];

  console.warn = msg => warnings.push(msg);

  try {
    fn();
  } finally {
    console.warn = oldWarn;
  }

  return warnings;
}

export function testConvertDocChecksDoc() {
  assert.throws(() => {
    convertDoc({children: []});
  }, /Invalid content for node doc/);
}

export function testEmptySectionFails() {
  assert.throws(() => {
    Node.fromJSON(schema, {
      type: 'doc',
      content: [{type: 'section', content: []}],
    }).check();
  }, /Invalid content for node section/);
}

export function testUnimplementedChildWorks() {
  let doc;
  const warnings = captureWarnings(() => {
    doc = convertDoc(makeDbDoc([{
      node_type: 'sec',
      children: [{node_type: 'boof', foo: 'barf'}],
    }]));
  });

  assert.deepEqual(warnings, ["Unknown node_type: boof"]);

  const child = doc.firstChild.firstChild;
  assert.deepEqual(JSON.parse(child.attrs.data), {
    node_type: 'boof',
    foo: 'barf'
  });
  assert.equal(child.type, schema.nodes.unimplemented_child);
}

export function testUnimplementedContentWorks() {
  let doc;
  const warnings = captureWarnings(() => {
    doc = convertDoc(makeDbDoc([{
      node_type: 'sec',
      children: [
        {
          node_type: 'para',
          content: [{content_type: 'blarg', foo: 'bar'}],
          children: [],
        }
      ],
    }]));
  });

  assert.deepEqual(warnings, ["Unknown content_type: blarg"]);

  const child = doc.firstChild.firstChild.firstChild;
  assert.deepEqual(JSON.parse(child.attrs.data), {
    content_type: 'blarg',
    foo: 'bar'
  });
  assert.equal(child.type, schema.nodes.unimplemented_content);
}
