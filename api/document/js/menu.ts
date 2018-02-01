import { menuBar, undoItem, redoItem, MenuItem, MenuItemSpec } from 'prosemirror-menu';

import Api from './Api';
import { appendParagraphNear, makeSave } from './commands';


const newParagraph = new MenuItem({
  class: 'menuitem-clickable',
  title: 'Append paragraph',
  run: appendParagraphNear,
  label: 'P',
  // These defaults are needed due to a doc issue. See
  // https://github.com/ProseMirror/prosemirror-menu/issues/15
  css: '',
  execEvent: 'mousedown',
});

function makeSaveButton(api: Api) {
  return new MenuItem({
    class: 'menuitem-clickable',
    title: 'Save Document',
    run: makeSave(api),
    label: 'Save',
    // These defaults are needed due to a doc issue. See
    // https://github.com/ProseMirror/prosemirror-menu/issues/15
    css: '',
    execEvent: 'mousedown',
  });
}

export default function menu(api: Api) {
  return menuBar({
    floating: true,
    content: [
      [
        // This forcible type assertion is due to what appears to
        // be a bug in the documentation/type annotations for
        // prosemirror-menu. For more details, see:
        //
        // https://github.com/ProseMirror/prosemirror-menu/issues/12
        undoItem as any as MenuItem,
        redoItem as any as MenuItem,
        newParagraph,
        makeSaveButton(api),
      ],
    ],
  });
}
