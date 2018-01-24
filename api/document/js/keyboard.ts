import { baseKeymap } from 'prosemirror-commands';
import { undo, redo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';

import saveDoc from './save-doc';

const keyboard = keymap({
  ...baseKeymap,
  'Mod-z': undo,
  'Shift-Mod-z': redo,
  'Mod-s': saveDoc,
});

export default keyboard;
