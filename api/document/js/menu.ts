import { menuBar, undoItem, redoItem, MenuItem } from 'prosemirror-menu';

const menu = menuBar({
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
    ],
  ],
});

export default menu;
