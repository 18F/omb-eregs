export function toArray(obj) {
  return Array.isArray(obj) ? obj : [obj];
}

export function flatMap(array, fn) {
  return array.reduce((all, curr) => all.concat(toArray(fn(curr))), []);
}
