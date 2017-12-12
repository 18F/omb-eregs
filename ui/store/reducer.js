import {
  CLOSE_FOOTNOTE,
  ENTER_SECTION,
  EXIT_SECTION,
  LOAD_DOCUMENT,
  OPEN_FOOTNOTE,
} from './actions';
import initialState from './initial-state';

export function allIds(toc) {
  const recurse = toc.children.map(allIds);
  return [toc.identifier].concat(...recurse);
}

export function deriveCurrentSection(tableOfContents, visibleSections) {
  const ids = allIds(tableOfContents);
  ids.reverse();
  const match = ids.find(id => visibleSections.includes(id));
  return match || (ids.length ? ids[ids.length - 1] : '');
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CLOSE_FOOTNOTE:
      return {
        ...state,
        openedFootnote: '',
      };
    case ENTER_SECTION: {
      const visibleSections = state.visibleSections.concat(
        [action.sectionIdentifier]);
      return {
        ...state,
        currentSection: deriveCurrentSection(state.tableOfContents, visibleSections),
        visibleSections,
      };
    }
    case EXIT_SECTION: {
      const visibleSections = state.visibleSections.filter(
        s => s !== action.sectionIdentifier);
      return {
        ...state,
        currentSection: deriveCurrentSection(state.tableOfContents, visibleSections),
        visibleSections,
      };
    }
    case LOAD_DOCUMENT: {
      const { tableOfContents } = action;
      const { openedFootnote, visibleSections } = initialState;
      return {
        ...state,
        currentSection: deriveCurrentSection(tableOfContents, visibleSections),
        openedFootnote,
        tableOfContents,
        visibleSections,
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
