export function getEl(selector: string): HTMLElement {
  const el = document.querySelector(selector);
  if (!el || !(el instanceof HTMLElement))
    throw new Error(`element with selector '${selector}' not found`);
  return el;
}
