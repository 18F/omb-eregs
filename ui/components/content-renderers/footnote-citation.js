import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { renderContent } from '../../util/render-node';
import { closeFootnote, openFootnote } from '../../store/actions';

import Footnote from '../node-renderers/footnote';
import Link from '../link';

export class FootnoteCitation extends React.Component {
  constructor(props) {
    super(props);

    this.shrinkFootnote = this.shrinkFootnote.bind(this);
    this.handleCitationClick = this.handleCitationClick.bind(this);
    this.footnoteIdentifier = props.content.footnote_node.identifier;
  }

  handleCitationClick(e) {
    e.preventDefault();
    if (this.props.expanded) {
      this.props.closeFootnote();
    } else {
      this.props.openFootnote(this.footnoteIdentifier);
    }
  }

  shrinkFootnote(e) {
    e.preventDefault();
    this.props.closeFootnote();
  }

  render() {
    let footnoteContent;
    const footnote = this.props.content.footnote_node;
    const expanded = this.props.expanded;
    const klass = `footnote-link nowrap${expanded ? ' active' : ''}`;
    const href = `#${this.props.content.footnote_node.identifier}`;
    const link = (
      <sup>
        <Link className={klass} onClick={this.handleCitationClick} href={href}>
          Footnote { this.props.content.text }
        </Link>
      </sup>
    );
    if (expanded) {
      footnoteContent = (
        <span className="citation-wrapper">
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

FootnoteCitation.propTypes = {
  closeFootnote: PropTypes.func.isRequired,
  content: PropTypes.shape({
    footnote_node: PropTypes.shape({
      identifier: PropTypes.string.isRequired,
    }).isRequired,
    text: PropTypes.string.isRequired,
  }).isRequired,
  expanded: PropTypes.bool.isRequired,
  openFootnote: PropTypes.func.isRequired,
};

export function mapStateToProps({ openedFootnote }, { content }) {
  return { expanded: openedFootnote === content.footnote_node.identifier };
}

function mapDispatchToProps(dispatch) {
  return {
    closeFootnote: bindActionCreators(closeFootnote, dispatch),
    openFootnote: bindActionCreators(openFootnote, dispatch),
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(FootnoteCitation);
