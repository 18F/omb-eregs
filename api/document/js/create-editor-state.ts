import { Node } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { history } from 'prosemirror-history';

import Api from './Api';
import keyboard from './keyboard';
import menu from './menu';
import parseDoc from './parse-doc';

export default function createEditorState(data, api: Api): EditorState {
  return EditorState.create({
    doc: parseDoc(data),
    plugins: [
      menu,
      keyboard(api),
      history(),
    ],
  });
}
