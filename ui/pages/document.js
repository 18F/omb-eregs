import PropTypes from 'prop-types';
import React from 'react';
import Sticky from 'react-stickynode';

import wrapPage from '../components/app-wrapper';
import Footnotes from '../components/document/footnotes';
import DocumentNav from '../components/document/navigation';
import { loadDocument } from '../store/actions';
import { documentData, propagate404 } from '../util/api/queries';
import DocumentNode from '../util/document-node';
import renderNode from '../util/render-node';

const headerFooterParams = {
  showSearch: true,
};

/* react-stickynode has an annoying bug
 * https://github.com/yahoo/react-stickynode/issues/61 around not loading
 * correctly if linking to the middle of a page. This hacks around that by
 * sending a mock scroll event (resizing won't get us into the "fixed" state)
 * on mount to the DOM.
 */
class StartupSticky extends Sticky {
  componentDidMount() {
    super.componentDidMount();
    const scrollEvent = {
      scroll: {
        delta: 1, // down
        top: window.scrollY,
      },
    };
    // react-sticky's initialization isn't actually complete until the state
    // change *after* componentDidMount. Therefore, we add a callback to fire
    // after that state change...
    /* eslint-disable react/no-did-mount-set-state */
    this.setState({}, () => this.handleScroll(null, scrollEvent));
    /* eslint-enable react/no-did-mount-set-state */
  }
}

export function Document({ docNode }) {
  const doc = new DocumentNode(docNode);
  const footnotes = doc.meta.descendantFootnotes;
  return (
    <div className="document-container clearfix max-width-4">
      <div className="col col-3 sm-hide xs-hide">
        <StartupSticky bottomBoundary=".document-container">
          <DocumentNav isRoot />
        </StartupSticky>
      </div>
      <div className="col col-1 sm-hide xs-hide">&nbsp;</div>
      <div className="col-12 md-col-6 col">
        { renderNode(doc) }
        { footnotes.length ?
          <Footnotes footnotes={footnotes} id="document-footnotes" /> : null }
      </div>
    </div>
  );
}
Document.propTypes = {
  docNode: PropTypes.shape({}).isRequired,
};

export async function getInitialProps(props) {
  return propagate404(async () => {
    const { docNode } = await documentData(props);
    const tableOfContents = docNode.meta.table_of_contents;
    const hasFootnotes = docNode.meta.descendant_footnotes.length > 0;
    props.store.dispatch(loadDocument(tableOfContents, hasFootnotes));
    return { docNode };
  });
}

export default wrapPage(Document, getInitialProps, headerFooterParams);
