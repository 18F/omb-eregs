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
    this.setState({ expanded: false });
  }

  render() {
    let citation;
    const footnote = this.props.content.footnote_node;
    const expanded = this.state.expanded;
    const klass = expanded ? 'active footnote-link' : 'footnote-link';
    const href = `#${this.props.content.footnote_node.identifier}`;
    const link = (
      <sup>
        <Link className={klass} onClick={this.handleCitationClick} href={href}>
          Footnote { this.props.content.text }
        </Link>
      </sup>
    );
    if (expanded) {
      citation = (
        <span className="citation-wrapper">
          <Footnote key={footnote.identifier} docNode={footnote}>
            { renderContent(footnote.content) }
          </Footnote>
          <span className="clearfix" />
          <button className="close-button" onClick={this.shrinkFootnote}>Close</button>
        </span>
      );
    }
    return (
      <cite data-citation-target={href}>
        { link }
        { citation }
      </cite>
    );
  }
}

FootnoteCitation.propTypes = propTypes;
