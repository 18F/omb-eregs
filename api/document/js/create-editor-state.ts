import { Node } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { history } from 'prosemirror-history';

import Api, { setStatusError } from './Api';
import keyboard from './keyboard';
import menu from './menu';
import parseDoc from './parse-doc';

export default function createEditorState(data, api: Api): EditorState {
  const doc = parseDoc(data);
  try {
    doc.check();
  } catch (e) {
    setStatusError(e);
  }

  return EditorState.create({
    doc,
    plugins: [
      menu(api),
      keyboard(api),
      history(),
    ],
  });
}
