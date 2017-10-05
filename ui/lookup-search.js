import endpoints from './util/api/endpoints';

/* Mapping between a lookup type (e.g. "topic") and the field in the API we
 * should display */
export const apiNameField = {
  agencies: 'name_with_abbr',
  policies: 'title',
  topics: 'name',
};

export function search(lookup, q, page = '1') {
  const apiQuery = { search: q, page };
  return endpoints[lookup].fetch(apiQuery);
}

/* Convert between the API's format and that expected by react-select */
export function makeOptionLoader(lookup) {
  return (inputStr) => {
    const textField = apiNameField[lookup];
    return search(lookup, inputStr).then(data => ({
      options: data.results.map(entry => ({ value: entry.id, label: entry[textField] })),
    }));
  };
}

/*
 * Mix in the idToInsert into the original request parameters.
 */
export function redirectQuery(query, insertParam, idToInsert) {
  const result = Object.assign({}, query);
  const ids = (result[insertParam] || '').split(',').filter(i => i.length > 0);
  delete result.page;

  if (!ids.includes(idToInsert)) {
    ids.push(idToInsert);
  }
  result[insertParam] = ids.join(',');

  return result;
}
