/* A component which renders a form which submits to the /search-redirect page
 * if client-side JS isn't available. If client-side JS *is* available, we use
 * an autocomplete library */
import querystring from 'querystring';

import React from 'react';
import { Async } from 'react-select';

import SearchView from './search-view';
import { apiParam, redirectQuery, search } from '../lookup-search';
import redirectWhiteList from '../redirectWhiteList';

export default class Autocompleter extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { autocomplete: false };
    // See https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-bind.md#es6-classes
    this.loadOptions = this.loadOptions.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  /* We can disable this lint check here as we _want_ the element to change in
   * a client-side JS environment.
   * https://github.com/airbnb/javascript/issues/684#issuecomment-264094930 */
  componentDidMount() {
    /* eslint-disable react/no-did-mount-set-state */
    this.setState({ autocomplete: true });
    /* eslint-enable react/no-did-mount-set-state */
  }

  onChange(entry) {
    const { location } = this.context.router;
    const query = redirectQuery(location.query, this.props.insertParam, entry.value);
    const paramStr = querystring.stringify(query);
    const dirPath = this.props.pathname || location.pathname;
    this.context.router.push(`${dirPath}?${paramStr}`);
  }

  loadOptions(inputStr) {
    const { lookup } = this.props;
    const textField = apiParam[lookup];
    return search(lookup, inputStr).then(data => ({
      options: data.results.map(
        entry => ({ value: entry.id, label: entry[textField] })),
    }));
  }

  render() {
    const { insertParam, lookup } = this.props;
    const { query } = this.context.router.location;
    let { pathname } = this.context.router.location;
    if (redirectWhiteList.includes(pathname) === false) {
      pathname = '/requirements';
    }
    if (this.state.autocomplete) {
      return React.createElement(Async, {
        loadOptions: this.loadOptions,
        onChange: this.onChange,
        tabIndex: '0',
      });
    }
    return React.createElement(
      SearchView, { insertParam, lookup, pathname, query });
  }
}
Autocompleter.propTypes = {
  lookup: React.PropTypes.oneOf(Object.keys(apiParam)).isRequired,
  insertParam: React.PropTypes.string.isRequired,
};
Autocompleter.contextTypes = {
  router: React.PropTypes.shape({
    location: React.PropTypes.shape({
      query: React.PropTypes.shape({}),
      pathname: React.PropTypes.string,
    }),
    push: React.PropTypes.func,
  }),
};

