import { menuBar, undoItem, redoItem, MenuItem, MenuItemSpec } from 'prosemirror-menu';

import { JsonApi } from './Api';
import {
  appendBulletListNear,
  appendOrderedListNear,
  appendParagraphNear,
  makeSave,
  makeSaveThenXml,
} from './commands';
import icons from './icons';

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

export default function menu(api: JsonApi) {
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
          icon: icons.newBulletList,
          run: appendBulletListNear,
          title: 'Append bullet list',
        }),
        makeButton({
          icon: icons.newOrderedList,
          run: appendOrderedListNear,
          title: 'Append ordered list',
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
