import { toggleMark } from 'prosemirror-commands';
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
import schema from './schema';

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
        undoItem as any as MenuItem, // title: 'Undo last change'
        redoItem as any as MenuItem, // title: 'Redo last undone change'
        makeButton({
          label: 'P',
          run: appendParagraphNear,
          title: 'Append paragraph',
        }),
        linkItem(schema.marks.external_link), // title: 'Add or remove link'
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
          run: makeSaveThenXml(api),
          title: 'Save document then edit as XML',
        }),
      ],
    ],
  });
}

function markActive(state, type) {
  const { from, $from, to, empty } = state.selection;
  if (empty) {
    return type.isInSet(state.storedMarks || $from.marks());
  }
  return state.doc.rangeHasMark(from, to, type);
}

function linkItem(markType) {
  return new MenuItem({
    class: 'menuitem-clickable',
    // These defaults are needed due to a doc issue. See
    // https://github.com/ProseMirror/prosemirror-menu/issues/15
    css: '',
    execEvent: 'mousedown',
    title: 'Add or remove link',
    label: 'A',
    active(state) { return markActive(state, markType); },
    enable(state) { return !state.selection.empty; },
    run(state, dispatch, view) {
      if (markActive(state, markType)) {
        toggleMark(markType)(state, dispatch);
        return true;
      }
      // We need a replacement for prompt here.
      toggleMark(schema.marks.external_link, {
        href: prompt('URL', 'not this'),
      })(view.state, view.dispatch);
      view.focus();
      return true;
    },
  });
}
