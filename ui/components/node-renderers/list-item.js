import PropTypes from 'prop-types';
import React from 'react';

export default function ListItem({ children, docNode }) {
  return (
    <li className="clearfix node-list-item" id={docNode.identifier}>
      <span className="col col-1 right-align pr2">{ docNode.marker }</span>
      <div className="col col-11">{ children }</div>
    </li>
  );
}
ListItem.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
    marker: PropTypes.string.isRequired,
  }).isRequired,
};
ListItem.defaultProps = {
  children: null,
};

