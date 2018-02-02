import { baseKeymap } from 'prosemirror-commands';
import { undo, redo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';

import Api from './Api';
import { makeSave } from './commands';

export default function menu(api: Api) {
  return keymap({
    ...baseKeymap,
    'Mod-z': undo,
    'Shift-Mod-z': redo,
    'Mod-s': makeSave(api),
  });
}
