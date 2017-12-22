import assert from 'assert';

import convertDoc from './convert-doc';

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
