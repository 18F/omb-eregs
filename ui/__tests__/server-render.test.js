import { render404 } from '../server-render';

describe('render404', () => {
  it('includes the search bar', () => {
    const request = { params: {}, path: '/some/nonexisting/place' };
    const send = jest.fn();
    const response = { status: jest.fn(() => ({ send })) };

    render404(request, response);
    expect(send).toBeCalled();
    expect(send.mock.calls[0][0]).toMatch('form');
    expect(send.mock.calls[0][0]).toMatch('req_text__search');
  });
});
