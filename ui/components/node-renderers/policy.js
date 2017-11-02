import PropTypes from 'prop-types';
import React from 'react';

import { firstWithNodeType } from '../../util/document-node';
import renderNode from '../../util/render-node';
import Link from '../link';

export function findNodeText(docNode, nodeType, modelValue) {
  const containingNode = firstWithNodeType(docNode, nodeType);
  if (containingNode && containingNode.text.length > 0) {
    return containingNode.text;
  }
  return modelValue;
}

/* Root of a policy document */
export default function Policy({ docNode }) {
  return (
    <div className="node-policy" id={docNode.identifier}>
      <div className="clearfix">
        <div className="bold">
          { findNodeText(docNode, 'policyNum', docNode.policy.omb_policy_id) }
        </div>
        <div>{ findNodeText(docNode, 'policyTitle', '') }</div>
        <h2 className="h1">
          { findNodeText(docNode, 'subject', docNode.policy.title) }
        </h2>
        <div><Link href={docNode.policy.original_url}>See original</Link></div>
        <div>
          <label className="bold pr1" htmlFor="issuance">Issued on:</label>
          <span id="issuance">
            { findNodeText(docNode, 'published', docNode.policy.issuance_pretty) }
          </span>
        </div>
      </div>
      { docNode.children.map(renderNode) }
    </div>
  );
}
Policy.propTypes = {
  docNode: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.shape({})).isRequired, // recursive
    identifier: PropTypes.string.isRequired,
    policy: PropTypes.shape({
      issuance_pretty: PropTypes.string.isRequired,
      omb_policy_id: PropTypes.string.isRequired,
      original_url: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
