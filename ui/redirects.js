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


export const redirectWhiteList = [
  '/policies',
  '/requirements',
];
