export default function saveDocument(state, dispatch, view) {
  if (!dispatch) {
    return true;
  }

  const doc = state.doc.toJSON();
  const data = new FormData();

  data.append('doc', JSON.stringify(doc));

  return window.fetch(window.location.pathname, {
    method: 'POST',
    body: data,
  }).then(res => res.json())
    .then(res => console.log(res));
}
