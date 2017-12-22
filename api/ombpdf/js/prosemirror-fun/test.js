// This is a horriby janky ad-hoc test suite because I
// don't have a spare day to figure out how to set up Jest with
// Babel.

import assert from 'assert';

import convertDoc from './convert-doc';
import schema from './policy-schema';

function makeDbDoc(children) {
  return {node_type: 'policy', children: children};
}

const TESTS = {
  testEmptySectionFails() {
    assert.throws(() => {
      convertDoc(makeDbDoc([{node_type: 'sec', children: []}]));
    }, /Invalid content for node section/);
  },
  testUnimplementedContentWorks() {
    const oldWarn = console.warn;
    const warnings = [];
    console.warn = msg => warnings.push(msg);

    try {
      const doc = convertDoc(makeDbDoc([{
        node_type: 'sec',
        children: [
          {
            node_type: 'para',
            content: [
              {
                content_type: 'blarg',
                foo: 'bar',
              },
            ],
            children: [],
          }
        ],
      }]));
      const marks = doc.firstChild.firstChild.firstChild.marks;
      assert.equal(marks.length, 1);
      const mark = marks[0];
      assert.deepEqual(JSON.parse(mark.attrs.data), {
        content_type: 'blarg',
        foo: 'bar'
      });
      assert.equal(mark.type, schema.marks.unimplemented_content);
    } finally {
      console.warn = oldWarn;
    }

    assert.deepEqual(warnings, ["Unknown content_type: blarg"]);
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
    console.log('All tests passed.');
  } catch (e) {
    console.groupEnd();
    console.error(currTest, 'failed with exception', e);
  }
}
