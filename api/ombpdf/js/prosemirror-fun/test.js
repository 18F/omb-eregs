// This is a horriby janky ad-hoc test suite because I
// don't have a spare day to figure out how to set up Jest with
// Babel.

import * as convertDocTests from './test-convert-doc';
import * as saveDocTests from './test-save-doc';

const TESTS = [
  [convertDocTests, './test-convert-doc'],
  [saveDocTests, './test-save-doc'],
];

function collectTests() {
  const tests = {};

  TESTS.forEach(args => {
    const [moduleTests, prefix] = args;
    Object.keys(moduleTests).forEach(name => {
      tests[`${prefix}/${name}`] = moduleTests[name];
    });
  });

  return tests;
}

export default function runTests() {
  let currTest;
  const tests = collectTests();

  let testCount = Object.keys(tests).length;

  console.groupCollapsed('Running tests.');

  try {
    Object.keys(tests).forEach(name => {
      currTest = name;
      console.log(`Running test ${name}...`);
      tests[name]();
    });
    console.groupEnd();
    console.log(`All ${testCount} tests passed.`);
  } catch (e) {
    console.groupEnd();
    console.error(currTest, 'failed with exception', e);
    console.log(e.message);
  }
}
