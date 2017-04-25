import React from 'react';
import ToggleDisplay from 'react-toggle-display';

import Requirement from './requirement';

export default class RequirementsList extends React.Component {
  constructor() {
    super();
    this.state = { isListOpen: false };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(prevState => ({
      isListOpen: !prevState.isListOpen,
    }));
  }

  render() {
    return (
      <div>
        <button
          onClick={this.handleClick}
          role="presentation"
        >
          {this.state.isListOpen ? 'Collapse' : 'Expand'}
        </button>
        <ToggleDisplay if={this.state.isListOpen}>
          <ol className="gray-border list-reset border-top">
            { this.props.group.map(req =>
              <li key={req.req_id} className="gray-border border-bottom">
                <Requirement requirement={req} />
              </li>) }
          </ol>
        </ToggleDisplay>
      </div>
    );
  }
}

RequirementsList.defaultProps = {
  group: [],
};

RequirementsList.propTypes = {
  group: React.PropTypes.arrayOf(React.PropTypes.shape({
    map: React.PropTypes.shape,
  })),
};
