import {baseKeymap} from "prosemirror-commands";
import {undo, redo} from "prosemirror-history";
import {keymap} from "prosemirror-keymap";

const keyboard = keymap({
  ...baseKeymap,
  'Mod-z': undo,
  'Shift-Mod-z': redo,
});

export default keyboard;
