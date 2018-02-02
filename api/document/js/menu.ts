import { menuBar, undoItem, redoItem, MenuItem, MenuItemSpec } from 'prosemirror-menu';

import Api from './Api';
import { appendParagraphNear, makeSave, makeSaveThenXml } from './commands';

function makeButton(content) {
  return new MenuItem({
    class: 'menuitem-clickable',
    // These defaults are needed due to a doc issue. See
    // https://github.com/ProseMirror/prosemirror-menu/issues/15
    css: '',
    execEvent: 'mousedown',
    ...content,
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
        makeButton({
          label: 'P',
          run: appendParagraphNear,
          title: 'Append paragraph',
        }),
        makeButton({
          label: 'Save',
          run: makeSave(api),
          title: 'Save document',
        }),
        makeButton({
          label: 'Save then XML',
          title: 'Save document then edit as XML',
          run: makeSaveThenXml(api),
        }),
      ],
    ],
  });
}
