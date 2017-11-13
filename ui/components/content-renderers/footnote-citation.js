import PropTypes from 'prop-types';
import React from 'react';

import { renderContent } from '../../util/render-node';

import Footnote from '../node-renderers/footnote';
import Link from '../link';

const propTypes = {
  content: PropTypes.shape({
    footnote_node: PropTypes.shape({
      identifier: PropTypes.string.isRequired,
    }).isRequired,
    text: PropTypes.string.isRequired,
  }).isRequired,
};

export default class FootnoteCitation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: false,
    };
    this.shrinkFootnote = this.shrinkFootnote.bind(this);
    this.handleCitationClick = this.handleCitationClick.bind(this);
  }

  handleCitationClick(e) {
    e.preventDefault();
    this.setState({ expanded: !this.state.expanded });
  }

  shrinkFootnote(e) {
    e.preventDefault();
    if (this.citationLink) {
      // Focus on the citation button so keyboard focus isn't undefined.
      this.citationLink.focus();
    }
    this.setState({ expanded: false });
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.expanded && this.state.expanded && this.citationWrapper) {
      // Focus the footnote so screen-readers announce it, and to ensure
      // that keyboard focus moves to it.
      this.citationWrapper.focus();
    }
  }

  render() {
    let footnoteContent;
    const footnote = this.props.content.footnote_node;
    const expanded = this.state.expanded;
    const klass = `footnote-link nowrap${expanded ? ' active' : ''}`;
    const href = `#${this.props.content.footnote_node.identifier}`;
    const link = (
      <sup>
        <a className={klass} onClick={this.handleCitationClick} href={href}
          ref={(el) => { this.citationLink = el; }}>
          Footnote { this.props.content.text }
        </a>
      </sup>
    );
    if (expanded) {
      footnoteContent = (
        <span className="citation-wrapper" role="alertdialog"
          aria-label={"Footnote " + footnote.marker} tabIndex="-1"
          ref={(el) => { this.citationWrapper = el; }}>
          <Footnote docNode={footnote}>
            { renderContent(footnote.content) }
          </Footnote>
          <span className="clearfix" />
          <button className="close-button" onClick={this.shrinkFootnote}>Close</button>
        </span>
      );
    }
    return (
      <cite className="inline-citation" data-citation-target={href}>
        { link }
        { footnoteContent }
      </cite>
    );
  }
}

FootnoteCitation.propTypes = propTypes;
FootnoteCitation.defaultProps = {
  content: {
    footnote_node: {
      identifier: '',
    },
    text: '',
  },
};
