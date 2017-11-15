import { closeFootnote, openFootnote } from '../store/actions';
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
