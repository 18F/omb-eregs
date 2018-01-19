export function getEl(selector: string): HTMLElement {
  const el = document.querySelector(selector);
  if (!el || !(el instanceof HTMLElement))
    throw new Error(`element with selector '${selector}' not found`);
  return el;
}

export function getElAttr(selector: string, attr: string): string {
  const value = getEl(selector).getAttribute(attr);

  if (value === null) {
    throw new Error(`'${selector}' has no ${attr} attribute`);
  }

  return value;
}
