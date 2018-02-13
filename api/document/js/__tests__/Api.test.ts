jest.mock('axios');
jest.mock('../util', () => ({
  getEl: jest.fn(jest.fn),
}));

import axios from 'axios';

import { Api } from '../Api';
import { getEl } from '../util';

function mockSetStatus() {
  const textContent = jest.fn();
  const statusEl = {};
  Object.defineProperty(statusEl, 'textContent', { set: textContent });
  (getEl as jest.Mock).mockReturnValue(statusEl);
  return textContent;
}

const api = new Api<string>({
  contentType: 'c-type',
  csrfToken: 'some-token',
  url: 'http://example.com/path',
});

describe('fetch()', () => {
  it('passes the correct args', () => {
    api.fetch();
    expect(axios.get).toHaveBeenCalledWith(
      'http://example.com/path', { headers: { Accept: 'c-type' } });
  });

  it('loads the data', async () => {
    axios.get = jest.fn(() => ({ data: 'some stuff!' }));
    const result = await api.fetch();
    expect(result).toBe('some stuff!');
  });

  it('sets the proper status messages', async () => {
    const textContent = mockSetStatus();
    await api.fetch();

    expect(textContent.mock.calls).toEqual([
      ['Loading document...'],
      ['Document loaded.'],
    ]);
  });

  it('handles exceptions', async () => {
    const textContent = mockSetStatus();
    const error: any = new Error();
    error.response = { data: { oh: 'noes', and: 6 } };
    axios.get = jest.fn(() => { throw error; });

    await expect(api.fetch()).rejects.toBeInstanceOf(Error);

    expect(textContent).toHaveBeenCalledTimes(2);
    const message = textContent.mock.calls[1][0];
    expect(message).toMatch(/oh.*noes/);
    expect(message).toMatch(/An error occurred/);
  });
});

describe('write()', () => {
  it('passes the correct args', () => {
    api.write('some data here');
    expect(axios.put).toHaveBeenCalledWith(
      'http://example.com/path',
      'some data here',
      { headers: { 'Content-Type': 'c-type', 'X-CSRFToken': 'some-token' } },
    );
  });

  it('sets success', async () => {
    const textContent = mockSetStatus();
    await api.write('');

    expect(textContent).toHaveBeenCalledTimes(2);
    expect(textContent.mock.calls[0]).toEqual(['Saving...']);
    expect(textContent.mock.calls[1][0]).toMatch(/Document saved at/);
  });

  it('handles exceptions', async () => {
    const textContent = mockSetStatus();
    const error: any = new Error();
    error.response = { data: { some: 'warning' } };
    axios.get = jest.fn(() => { throw error; });

    await expect(api.fetch()).rejects.toBeInstanceOf(Error);

    expect(textContent).toHaveBeenCalledTimes(2);
    const message = textContent.mock.calls[1][0];
    expect(message).toMatch(/some.*warning/);
    expect(message).toMatch(/An error occurred/);
  });
});
