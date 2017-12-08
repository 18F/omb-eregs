import { CLOSE_FOOTNOTE, LOAD_DOCUMENT, OPEN_FOOTNOTE } from './actions';
import initialState from './initial-state';


export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CLOSE_FOOTNOTE:
      return {
        ...state,
        openedFootnote: '',
      };
    case LOAD_DOCUMENT: {
      const { tableOfContents } = action;
      const { openedFootnote } = initialState;
      return {
        ...state,
        openedFootnote,
        tableOfContents,
      };
    }
    case OPEN_FOOTNOTE:
      return {
        ...state,
        openedFootnote: action.footnoteIdentifier,
      };
    default:
      return state;
  }
}
