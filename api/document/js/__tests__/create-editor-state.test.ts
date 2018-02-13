jest.mock('../Api');
jest.mock('../parse-doc');

import { JsonApi, setStatusError } from '../Api';
import createEditorState from '../create-editor-state';
import parseDoc from '../parse-doc';
import schema, { factory } from '../schema';


describe('createEditorState()', () => {
  it('alerts of doc schema errors', () => {
    (parseDoc as jest.Mock).mockImplementationOnce(() => factory.policy([
      // can't use a factory method here because we're intentionally creating
      // an invalid doc
      schema.nodes.heading.create({ depth: 1 }, factory.sec()),
    ]));

    createEditorState('', new JsonApi({
      csrfToken: '',
      url: '',
    }));

    expect(setStatusError).toHaveBeenCalled();
  });
});
