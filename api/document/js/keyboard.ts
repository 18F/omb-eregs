import { baseKeymap, chainCommands, deleteSelection, selectNodeBackward, selectNodeForward } from 'prosemirror-commands';
import { undo, redo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';

import Api from './Api';
import { makeSave } from './commands';
import schema from './schema';

// Removing joinBackwards/forwards from actions taken when deleting as they
// need to be tuned a bit better to our use case.
const backspace = chainCommands(deleteSelection, selectNodeBackward);
const del = chainCommands(deleteSelection, selectNodeForward);

export default function menu(api: Api) {
  return keymap({
    ...baseKeymap,
    'Backspace': backspace,
    'Mod-Backspace': backspace,
    'Delete': del,
    'Mod-Delete': del,
    'Mod-z': undo,
    'Shift-Mod-z': redo,
    'Mod-s': makeSave(api),
    // Macs have additional keyboard combinations for deletion; we set them
    // for all OSes as a convenience
    'Ctrl-h': backspace,
    'ALt-Backspace': backspace,
    'Ctrl-d': del,
    'Ctrl-Alt-Backspace': del,
    'Alt-Delete': del,
    'Alt-d': del,
  });
}
