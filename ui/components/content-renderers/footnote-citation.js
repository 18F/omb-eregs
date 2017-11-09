import PropTypes from 'prop-types';
import React from 'react';

import { renderContent } from '../../util/render-node';

import Footnote from '../node-renderers/footnote';
import Link from '../link';

/* eslint-disable */
const demoData = {"children":[],"content":[{"content_type":"__text__","text":"The FDCCI was first established by OMB â€œMemo for CIOs: Federal Data\n        Center Consolidation Initiative,â€ issued on February 26, 2010, and\n        modified by subsequent memoranda."}],"depth":3,"identifier":"policy_1__sec_1__para_1__footnote_1","marker":"1","node_type":"footnote","requirement":null,"text":"The FDCCI was first established by OMB â€œMemo for CIOs: Federal Data\n        Center Consolidation Initiative,â€ issued on February 26, 2010, and\n        modified by subsequent memoranda.","type_emblem":"1","policy":{"issuance":"2016-08-01","omb_policy_id":"M-16-19","original_url":"https://www.whitehouse.gov/sites/default/files/omb/memoranda/2016/m_16_19_1.pdf","title":"Data Center Optimization Initiative (DCOI)"}};
/* eslint-enable */

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
          <Footnote key={demoData.identifier} docNode={demoData}>
            { renderContent(demoData.content) }
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
