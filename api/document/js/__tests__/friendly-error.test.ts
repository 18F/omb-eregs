import { makeErrorFriendly } from '../friendly-error';

describe('makeErrorFriendly()', () => {
  it('converts simple "detail" errors', () => {
    const detail = ('XML syntax error - expected \'>\', line 4, ' +
                    'column 3 (<string>, line 4)');
    expect(makeErrorFriendly({ detail })).toBe(detail);
  });

  it('returns string errors as-is', () => {
    const msg = 'NameError at /document/M-16-19\nname \'boom\' is not ...';
    expect(makeErrorFriendly(msg)).toBe(msg);
  });

  it('returns other errors as their JSON stringification', () => {
    expect(makeErrorFriendly(null)).toBe('null');
  });

  it('provides details on XML errors w/ invalid content types', () => {
    /* tslint:disable */
    const err = {
      "children": [
        {
          "content": [
            {
              "content_type": "'k' is an invalid content type.",
              "_sourceline": "3"
            },
            {}
          ],
          "_sourceline": "2"
        }
      ],
      "_sourceline": "1"
    };
    /* tslint:enable */
    expect(makeErrorFriendly(err)).toBe(
      `In an element starting at line 3:\n` +
      `* content_type - 'k' is an invalid content type.`,
    );
  });

  it('provides details on XML errors w/ sibling emblem conflicts', () => {
    /* tslint:disable */
    const err =   {
      "children": [
        "Multiple occurrences of 'a' with emblem '1' exist as siblings"
      ],
      "_sourceline": "1"
    };
    /* tslint:enable */
    expect(makeErrorFriendly(err)).toBe(
      `In an element starting at line 1:\n` +
      `* children - Multiple occurrences of 'a' with emblem '1' exist as siblings`,
    );
  });

  it('provides details on XML errors w/ non-field errors', () => {
    /* tslint:disable */
    const err = {
      "non_field_errors": [
        "Multiple footnotes exist with type emblem '1'"
      ],
      "_sourceline": "1"
    };
    /* tslint:enable */
    expect(makeErrorFriendly(err)).toBe(
      `In an element starting at line 1:\n` +
      `* non_field_errors - Multiple footnotes exist with type emblem '1'`,
    );
  });

  it('provides details on XML errors w/ missing attributes', () => {
    /* tslint:disable */
    const err = {
      "children": [
        {},
        {
          "content": [
            {
              "href": [
                "This field is required."
              ],
              "_sourceline": "4"
            }
          ],
          "_sourceline": "3"
        }
      ],
      "_sourceline": "1"
    };
    /* tslint:enable */
    expect(makeErrorFriendly(err)).toBe(
      `In an element starting at line 4:\n` +
      `* href - This field is required.`,
    );
  });
});
