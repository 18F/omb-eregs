import { CLOSE_FOOTNOTE, OPEN_FOOTNOTE } from './actions';
import initialState from './initial-state';


export default function reducer(state = initialState, action) {
  switch (action.type) {
    case OPEN_FOOTNOTE:
      return {
        ...state,
        openedFootnote: action.footnoteIdentifier,
      };
    case CLOSE_FOOTNOTE:
      return {
        ...state,
        openedFootnote: '',
      };
    default:
      return state;
  }
}