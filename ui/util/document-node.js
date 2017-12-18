import Policy from './policy';

export class Meta {
  constructor(args) {
    const fieldValues = args || {};
    // policy meta data (e.g. slugs, pdf url, etc.)  associated with this
    // document
    this.policy = new Policy(fieldValues.policy || {});

    // footnotes referenced in this DocumentNode or its children. E.g. used to
    // consolidate footnotes in tables
    // DocumentNode will be defined before this constructor is called
    /* eslint-disable no-use-before-define */
    this.descendantFootnotes = (
      fieldValues.descendantFootnotes || fieldValues.descendant_footnotes || []
    ).map(f => new DocumentNode(f));
    /* eslint-enable no-use-before-define */

    // title of this DocumentNode and any of its children. E.g. used in
    // navigation
    this.tableOfContents = (
      fieldValues.table_of_contents || fieldValues.tableOfContents || {}
    );
  }
}

export default class DocumentNode {
  constructor(args) {
    const fieldValues = args || {};
    // a unique (with a single document) string that's composed of
    // __-divided components
    this.identifier = fieldValues.identifier || '';

    // a string that gives some semantic meaning to each node.
    // @see https://github.com/18F/omb-eregs/wiki/Content-Types
    this.nodeType = fieldValues.node_type || fieldValues.nodeType || '';

    // a way to distinguish children within a single parent
    // Parent identifier + node_type + type_emblem == identifier
    this.typeEmblem = fieldValues.type_emblem || fieldValues.typeEmblem || '';

    // the plain text for a node (sans any markers). We generally don't want
    // to access this as it doesn't deal with inline elements
    this.text = fieldValues.text || '';

    // text like "a)" or "Section 22"; not essential to understanding a list
    // item, footnote, etc. but essential to correct display
    this.marker = fieldValues.marker || '';

    // an array of "content" objects, inline links, citations, etc.
    this.content = fieldValues.content || [];

    // an array of nested DocumentNodes
    this.children = (fieldValues.children || []).map(c => new DocumentNode(c));

    // node-level meta data, such as footnotes within a table
    this.meta = new Meta(fieldValues.meta);
  }

  linearize() {
    return this.children.reduce(
      (soFar, nextNode) => soFar.concat(nextNode.linearize()), [this]);
  }

  firstMatch(filterFn) {
    if (filterFn(this)) {
      return this;
    }
    // Use for loop so we can short-circuit
    for (let idx = 0; idx < this.children.length; idx += 1) {
      const result = this.children[idx].firstMatch(filterFn);
      if (result) {
        return result;
      }
    }
    return null;
  }

  firstWithNodeType(nodeType) {
    return this.firstMatch(n => n.nodeType === nodeType);
  }

  /* Cleanup: does this node have nodeType in its lineage/ as a parent.
   * e.g. table */
  hasAncestor(nodeType) {
    const ancestorTypes = this.identifier.split('__').map(
      ident => ident.split('_')[0]);
    return ancestorTypes.includes(nodeType);
  }
}
