import React from 'react';

import ConditionalRender from '../conditional-render';
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
          <ConditionalRender>
            <DocumentNav isRoot />
            <React.Fragment>
              <div className="clearfix button-container">
                <button
                  className={`col col-6 menu-button${this.state.open ? ' active' : ''}`}
                  onClick={buttonClick}
                >
                  { this.state.open ?
                    '✕' :
                    <span className="include-divider">Jump to section</span>}
                </button>
              </div>
              { this.state.open ?
                <DocumentNav className="fixed" onClick={linkClick} isRoot /> : null }
            </React.Fragment>
          </ConditionalRender>
        </div>
      </Sticky>
    );
  }
}

