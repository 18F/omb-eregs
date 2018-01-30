class XMLErrorInfo {
  nestedErrors: XMLErrorInfo[];
  errors: string[];
  sourceline: number;

  static isXMLError(err: any): boolean {
    return (typeof err === 'object' && err !== null &&
            '_sourceline' in err);
  }

  constructor(err: object) {
    this.nestedErrors = [];
    this.errors = [];
    this.sourceline = parseInt(err['_sourceline'], 10);

    Object.keys(err)
      .filter(name => name !== '_sourceline')
      .forEach((name) => {
        const value = err[name];
        if (Array.isArray(value)) {
          this.diveIntoArrayProp(name, value);
        } else {
          this.addError(name, makeErrorFriendly(value));
        }
      });
  }

  addError(name: string, value: string) {
    this.errors.push(`${name} - ${value}`);
  }

  diveIntoArrayProp(name: string, value: any[]) {
    value.forEach((item) => {
      if (XMLErrorInfo.isXMLError(item)) {
        this.nestedErrors.push(new XMLErrorInfo(item));
      } else if (!isEmptyObject(item)) {
        this.addError(name, makeErrorFriendly(item));
      }
    });
  }

  toString(indent: string = ''): string {
    const lines: string[] = [];
    let nextIndent = indent;
    if (this.errors.length) {
      lines.push(`${indent}In an element starting at line ` +
                 `${this.sourceline}:`);
      this.errors.forEach((text) => {
        lines.push(`${indent}* ${text}`);
      });
      nextIndent += '  ';
    }
    this.nestedErrors.forEach((err) => {
      lines.push(err.toString(nextIndent));
    });

    return lines.join('\n');
  }
}

function isEmptyObject(obj: any) {
  return typeof obj === 'object' && obj !== null &&
    Object.keys(obj).length === 0;
}

export function makeErrorFriendly(err: any): string {
  if (typeof err === 'string') {
    return err;
  }
  if (typeof err === 'object' && err !== null) {
    if (Object.keys(err).length === 1 &&
        typeof(err.detail) === 'string') {
      return err.detail;
    }
    if (XMLErrorInfo.isXMLError(err)) {
      return (new XMLErrorInfo(err)).toString();
    }
  }
  return JSON.stringify(err, null, 2);
}
