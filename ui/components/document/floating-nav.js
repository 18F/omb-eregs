import React from 'react';

import Sticky from '../startup-sticky';
import DocumentNav from './navigation';

export default class FloatingNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  render() {
    const buttonClick = () => this.setState({ open: !this.state.open });
    const linkClick = () => this.setState({ open: false });
    return (
      <Sticky innerZ="100">
        <div className="document-floating-nav md-hide lg-hide">
          <div className="clearfix button-container">
            <button
              className={`col col-6 menu-button${this.state.open ? ' active' : ''}`}
              onClick={buttonClick}
            >
              <span className="button-text">
                { this.state.open ? '✕' : 'Jump to section' }
              </span>
            </button>
          </div>
            <DocumentNav className="fixed" onClick={linkClick} isRoot /> : null }
        </div>
      </Sticky>
    );
  }
}

