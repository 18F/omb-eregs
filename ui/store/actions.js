export const CLOSE_FOOTNOTE = 'CLOSE_FOOTNOTE';
export const ENTER_SECTION = 'ENTER_SECTION';
export const EXIT_SECTION = 'EXIT_SECTION';
export const LOAD_DOCUMENT = 'LOAD_DOCUMENT';
export const OPEN_FOOTNOTE = 'OPEN_FOOTNOTE';

export const closeFootnote = () => ({ type: CLOSE_FOOTNOTE });

export const enterSection = sectionIdentifier => ({
  sectionIdentifier,
  type: ENTER_SECTION,
});

export const exitSection = sectionIdentifier => ({
  sectionIdentifier,
  type: EXIT_SECTION,
});

/* Limit the depth of Table of Contents entries */
const trimTableOfContents = (depth, tableOfContents) => {
  if (depth <= 0) {
    return {
      ...tableOfContents,
      children: [],
    };
  }
  return {
    ...tableOfContents,
    children: tableOfContents.children.map(c => trimTableOfContents(depth - 1, c)),
  };
};

const footnotesToC = {
  children: [],
  identifier: 'document-footnotes',
  title: 'Footnotes',
};

export const loadDocument = (tableOfContents, hasFootnotes) => {
  const trimmed = trimTableOfContents(2, tableOfContents);
  if (hasFootnotes) {
    trimmed.children.push(footnotesToC);
  }
  return {
    tableOfContents: trimmed,
    type: LOAD_DOCUMENT,
  };
};

export const openFootnote = footnoteIdentifier => ({
  footnoteIdentifier,
  type: OPEN_FOOTNOTE,
});
