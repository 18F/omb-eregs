/* A component which renders one of two tags, depending on whether or not
 * client-side JS is available. When rendering server-side, the first option
 * is taken; when rendering client-side, the second option. When a JS-capable
 * browser received the server-side version, it will replace with the
 * client-side version. */
import PropTypes from 'prop-types';
import React from 'react';

import config from '../config';


export default class ConditionalRender extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { clientSide: config.clientSide };
    if (React.Children.count(props.children) !== 2) {
      throw new Error('ConditionalRender requires exactly 2 children');
    }
  }

  /* We can disable this lint check here as we _want_ the element to change in
   * a client-side JS environment.
   * https://github.com/airbnb/javascript/issues/684#issuecomment-264094930 */
  /* eslint-disable react/no-did-mount-set-state */
  componentDidMount() {
    this.setState({ clientSide: true });
  }
  /* eslint-enable react/no-did-mount-set-state */

  render() {
    const children = React.Children.toArray(this.props.children);
    if (this.state.clientSide) {
      return children[1];
    }
    return children[0];
  }
}
ConditionalRender.propTypes = {
  children: PropTypes.node.isRequired,
};
