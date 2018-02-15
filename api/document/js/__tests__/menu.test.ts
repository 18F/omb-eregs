import { flatten } from 'lodash/array';
import { EditorView } from 'prosemirror-view';
import schema, { factory } from '../schema';
import { EditorState } from 'prosemirror-state';
import menu from '../menu';
import { Api, JsonApi } from '../Api';

describe('menu functions', () => {
  it('has the expected buttons', () => {
    const api = new JsonApi({ csrfToken: '', url: 'http://example.org/' });
    const state = EditorState.create({ schema });
    const menuBar = menu(api);
    const divOne = document.createElement('div');
    const spanOne = divOne.appendChild(document.createElement('span'));
    const menuBarView = menuBar.spec.view(new EditorView(spanOne, { state }));
    const menuItems = flatten(menuBarView.options.content);
    const menuItemTitles = menuItems.map(item => item.title);
    /* It seems that title is the best way to detect the presence of buttons.
     * Note that this approach doesn't check for the order of the buttons. */
    const expectedItemTitles = [
      'Undo last change',
      'Redo last undone change',
      'Append paragraph',
      'Add or remove link',
      'Append bullet list',
      'Append ordered list',
      'Save document',
      'Save document then edit as XML',
    ];
    expect(menuItemTitles.length).toEqual(expectedItemTitles.length);
    expectedItemTitles.forEach((title) => {
      expect(menuItemTitles.includes(title));
    });

  });
});
