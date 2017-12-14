import React from 'react';

import Sticky from '../startup-sticky';
import DocumentNav from './navigation';

export default class FloatingNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  render() {
    return (
      <Sticky innerZ="100">
        <div className="document-floating-nav md-hide lg-hide">
          <div className="clearfix button-container">
            <button
              className={`col col-6 menu-button${this.state.open ? ' active' : ''}`}
              onClick={() => this.setState({ open: !this.state.open })}
            >
              <span className="button-text">
                { this.state.open ? '✕' : 'Jump to section' }
              </span>
            </button>
          </div>
          { this.state.open ? <DocumentNav className="fixed" isRoot /> : null }
        </div>
      </Sticky>
    );
  }
}

