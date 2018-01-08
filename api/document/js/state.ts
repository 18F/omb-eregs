import {Node} from "prosemirror-model";
import {EditorState} from "prosemirror-state";
import {history} from "prosemirror-history";

import menu from "./menu";
import keyboard from "./keyboard";

export default function createEditorState(doc: Node): EditorState {
  return EditorState.create({
    doc,
    plugins: [
      menu,
      keyboard,
      history(),
    ],
  });
}
