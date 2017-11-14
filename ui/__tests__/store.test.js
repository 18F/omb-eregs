import { openFootnote } from '../store/actions';
import initialState from '../store/initial-state';
import reducer from '../store/reducer';

describe('footnote functionality', () => {
  it('has the correct initial state', () => {
    expect(initialState.openedFootnote).toBeNull();
  });
  it('reduces appropriately', () => {
    const result = reducer(initialState, openFootnote('some-id'));
    expect(result).toEqual({ openedFootnote: 'some-id' });
  });
});
