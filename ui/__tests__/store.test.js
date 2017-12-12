import {
  closeFootnote,
  enterSection,
  exitSection,
  loadDocument,
  openFootnote,
} from '../store/actions';
import initialState from '../store/initial-state';
import reducer from '../store/reducer';

describe('footnote functionality', () => {
  it('has the correct initial state', () => {
    expect(initialState.openedFootnote).toBe('');
  });
  it('reduces openFootnote appropriately', () => {
    const result = reducer(initialState, openFootnote('some-id'));
    expect(result.openedFootnote).toBe('some-id');
  });
  it('reduces closeFootnote appropriately', () => {
    const state = { ...initialState, openedFootnote: 'aaa_1__bbb_2' };
    const result = reducer(state, closeFootnote());
    expect(result.openedFootnote).toBe('');
  });
});

describe('loading a new document', () => {
  it('clears existing footnotes', () => {
    const state = { ...initialState, openedFootnote: 'footnote' };
    const result = reducer(state, loadDocument({ children: [] }));
    expect(result.openedFootnote).toBe('');
  });
  it('sets the table of contents', () => {
    const tableOfContents = {
      children: [],
      identifier: 'idid',
      title: 'ttt',
    };
    const result = reducer(initialState, loadDocument(tableOfContents));
    expect(result.tableOfContents).toEqual(tableOfContents);
  });
  it('trims the table of contents', () => {
    const tableOfContents = {
      identifier: 'root',
      children: [{
        identifier: 'level-1',
        children: [{
          identifier: 'level-2',
          children: [{
            identifier: 'level-3',
            children: [],
          }],
        }],
      }],
    };
    const { tableOfContents: root } = reducer(
      initialState, loadDocument(tableOfContents));
    expect(root.identifier).toBe('root');
    expect(root.children).toHaveLength(1);
    const [level1] = root.children;
    expect(level1.identifier).toBe('level-1');
    expect(level1.children).toHaveLength(1);
    const [level2] = level1.children;
    expect(level2.identifier).toBe('level-2');
    expect(level2.children).toHaveLength(0);
  });
});


describe('current section tracking', () => {
  const tableOfContents = {
    identifier: 'root',
    children: [
      {
        identifier: 'root-1',
        children: [
          { identifier: 'root-1-a', children: [] },
          { identifier: 'root-1-b', children: [] },
        ],
      },
      { identifier: 'root-2', children: [] },
    ],
  };

  it('picks last relevant section', () => {
    let state = { ...initialState, tableOfContents };
    state = reducer(state, enterSection('root-1'));
    expect(state.currentSection).toBe('root-1');
    state = reducer(state, enterSection('root-1-a'));
    expect(state.currentSection).toBe('root-1-a');
    state = reducer(state, enterSection('root-1-b'));
    expect(state.currentSection).toBe('root-1-b');
    state = reducer(state, exitSection('root-1-a'));
    expect(state.currentSection).toBe('root-1-b');
    state = reducer(state, exitSection('root-1-b'));
    expect(state.currentSection).toBe('root-1');
    state = reducer(state, enterSection('root-2'));
    expect(state.currentSection).toBe('root-2');
  });
  it('defaults to the root', () => {
    let state = reducer(initialState, loadDocument(tableOfContents));
    expect(state.currentSection).toBe('root');
    state = reducer(state, enterSection('doesnt-exist'));
    expect(state.currentSection).toBe('root');
  });
});
