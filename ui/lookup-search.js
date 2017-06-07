import api from './api';

/* Mapping between a lookup type (e.g. "topic") and the field in the API we
 * should display */
export const apiNameField = {
  agencies: 'name_with_abbr',
  policies: 'title',
  topics: 'name',
};

export function search(lookup, q, page = '1') {
  const apiQuery = { search: q, page };
  return api[lookup].fetch(apiQuery);
}

/* Convert between the API's format and that expected by react-select */
export function makeOptionLoader(lookup) {
  return (inputStr) => {
    const textField = apiNameField[lookup];
    return search(lookup, inputStr).then(data => ({
      options: data.results.map(
        entry => ({ value: entry.id, label: entry[textField] })),
    }));
  };
}
