/* Note that we _aren't_ tracking url here at this time (preferring Next's
 * withRouter()). That may change in the future. */
export default {
  currentSection: '',
  openedFootnote: '',
  tableOfContents: {
    children: [],
    identifier: '',
    title: '',
  },
  visibleSections: [],
};
