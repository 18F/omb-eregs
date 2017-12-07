export const CLOSE_FOOTNOTE = 'CLOSE_FOOTNOTE';
export const OPEN_FOOTNOTE = 'OPEN_FOOTNOTE';
export const RESET_DOCUMENT_STATE = 'RESET_DOCUMENT_STATE';

export const openFootnote = footnoteIdentifier => ({
  footnoteIdentifier,
  type: OPEN_FOOTNOTE,
});

export const closeFootnote = () => ({ type: CLOSE_FOOTNOTE });

export const resetDocumentState = () => ({ type: RESET_DOCUMENT_STATE });
