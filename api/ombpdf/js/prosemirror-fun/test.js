// This is a horriby janky ad-hoc test suite because I
// don't have a spare day to figure out how to set up Jest with
// Babel.

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

const TESTS = {
  testConvertDocChecksDoc() {
    assert.throws(() => {
      convertDoc({children: []});
    }, /Invalid content for node doc/);
  },
  testEmptySectionFails() {
    assert.throws(() => {
      Node.fromJSON(schema, {
        type: 'doc',
        content: [{type: 'section', content: []}],
      }).check();
    }, /Invalid content for node section/);
  },
  testUnimplementedChildWorks() {
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
  },
  testUnimplementedContentWorks() {
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
  },
};

export default function runTests() {
  let currTest;

  console.groupCollapsed('Running tests.');

  try {
    Object.keys(TESTS).forEach(name => {
      currTest = name;
      console.log(`Running test ${name}...`);
      TESTS[name]();
    });
    console.groupEnd();
    console.log(`All ${Object.keys(TESTS).length} tests passed.`);
  } catch (e) {
    console.groupEnd();
    console.error(currTest, 'failed with exception', e);
  }
}
