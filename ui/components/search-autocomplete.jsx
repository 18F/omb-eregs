/* A component which renders a form which submits to the /search-redirect page
 * if client-side JS isn't available. If client-side JS *is* available, we use
 * an autocomplete library */
import querystring from 'querystring';

import React from 'react';
import { Async } from 'react-select';

import { apiParam, redirectQuery, search } from './lookup-search';

export default class SearchAutocomplete extends React.PureComponent {
  constructor(props) {
    super(props);
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
    const { location } = this.props.router;
    const query = redirectQuery(location.query, this.props.insertParam, entry.value);
    const paramStr = querystring.stringify(query);
    this.props.router.push(`${location.pathname}?${paramStr}`);
  }

  loadOptions(inputStr) {
    const { lookup } = this.props;
    const textField = apiParam[lookup];
    if (inputStr.trim().length === 0) {
      return Promise.resolve({ options: [] });
    }
    return search(lookup, inputStr).then(data => ({
      options: data.results.map(
        entry => ({ value: entry.id, label: entry[textField] })),
    }));
  }

  render() {
    const { insertParam, lookup } = this.props;
    const { pathname, query } = this.props.router.location;
    if (this.state.autocomplete) {
      return <Async loadOptions={this.loadOptions} onChange={this.onChange} />;
    }
    return (
      <form action={`/${lookup}/search-redirect/`} method="GET">
        <input type="hidden" name="insertParam" value={insertParam} />
        <input type="hidden" name="redirectPathname" value={pathname} />
        <input type="text" name="q" />
        { Object.keys(query).map(key =>
          <input key={key} type="hidden" name={`redirectQuery__${key}`} value={query[key]} />)}
        <input type="submit" value="Add" />
      </form>
    );
  }
}
SearchAutocomplete.defaultProps = {
  lookup: '',
  insertParam: '',
  router: {
    location: { query: {}, pathname: '' },
    push: null,
  },
};
SearchAutocomplete.propTypes = {
  lookup: React.PropTypes.string,
  insertParam: React.PropTypes.string,
  router: React.PropTypes.shape({
    location: React.PropTypes.shape({
      query: React.PropTypes.shape({}),
      pathname: React.PropTypes.string,
    }),
    push: React.PropTypes.func,
  }),
};
