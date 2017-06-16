import React from 'react';
import { Resolver } from 'react-resolver';

import Spinner from './spinner';


export class AjaxLoadingResolver extends Resolver {
  /* Resolver's shouldComponentUpdate tries to be efficient by not updating
   * when there's no data. We *do* want to trigger a render when there's no
   * data, so we override that method. */
  shouldComponentUpdate(nextProps, nextState) {
    // implement the logic present in Resolver's shouldComponentUpdate
    if (!this.isParentPending() && this.isPending(nextState)) {
      this.resolve(nextState);
    }
    return true;
  }
  render() {
    if (this.isPending()) {
      return React.createElement(Spinner, this.props);
    }
    return super.render();
  }
}
AjaxLoadingResolver.displayName = 'AjaxLoadingResolver';

/* Replace a Component with a wrapped version which shows a Spinner of the
 * requested height until the data is loaded. */
export function wrapWithAjaxLoader(Component, ajaxFns, height = 100) {
  /* Converts provided props into an AjaxLoadingResolver */
  function Wrapper(props) {
    /* Combines AJAX properties with explicit properties to render the inner
     * component */
    function generateContents(resolvedProps) {
      return React.createElement(Component, Object.assign({}, props, resolvedProps));
    }
    return React.createElement(
      AjaxLoadingResolver, { props, height, resolve: ajaxFns }, generateContents);
  }

  return Wrapper;
}
