class Bbox {
  page: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;

  constructor(page: number, x0: number, y0: number,
              x1: number, y1: number) {
    this.page = page;
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
  }

  toCss(): string {
    return [
      `bottom: ${this.y0 - 1}px`,
      `left: ${this.x0}px`,
      `width: ${this.x1 - this.x0}px`,
      `height: ${this.y1 - this.y0}px`
    ].join('; ')
  }

  toQuerystring(): string {
    return `?bbox=${this.page},${this.x0},${this.y0},${this.x1},${this.y1}`;
  }

  static fromQuerystring(text): Bbox | null {
    const match = text.match(/bbox=([0-9,.]+)/);

    if (!match) {
      return null;
    }

    const numbers = match[1].split(',');

    if (numbers.length !== 5) {
      return null;
    }

    return new Bbox(parseInt(numbers[0]),
                    parseFloat(numbers[1]),
                    parseFloat(numbers[2]),
                    parseFloat(numbers[3]),
                    parseFloat(numbers[4]));
  }
}

function showBbox(bbox: Bbox): HTMLDivElement {
  const pageEl = document.querySelector(`.page[data-page="${bbox.page}"]`);
  const bboxEl = document.createElement('div');

  if (!pageEl)
    throw new Error(`page ${bbox.page} not found!`);

  pageEl.appendChild(bboxEl);

  bboxEl.classList.add('bbox');
  bboxEl.setAttribute('style', bbox.toCss());

  return bboxEl;
}

let currBboxEl: HTMLDivElement | null = null;

function setCurrBbox(bbox: Bbox | null) {
  if (currBboxEl !== null && currBboxEl.parentNode) {
    currBboxEl.parentNode.removeChild(currBboxEl);
    currBboxEl = null;
  }
  if (bbox !== null) {
    currBboxEl = showBbox(bbox);
  }
}

interface DragInfo {
  page: number;
  pageCanvas: HTMLCanvasElement;
  startX: number;
  startY: number;
  currX: number;
  currY: number;
}

function dragInfoToBbox(dragInfo: DragInfo): Bbox | null {
  if (dragInfo.startX === dragInfo.currX ||
      dragInfo.startY === dragInfo.currY) {
    return null;
  }

  const canvasRect = dragInfo.pageCanvas.getBoundingClientRect();
  const canvasLeft = canvasRect.left + window.scrollX;
  const canvasTop = canvasRect.top + window.scrollY;
  const pageHeight = dragInfo.pageCanvas.height;
  let x0 = dragInfo.startX - canvasLeft;
  let y0 = pageHeight - (dragInfo.startY - canvasTop);
  let x1 = dragInfo.currX - canvasLeft;
  let y1 = pageHeight - (dragInfo.currY - canvasTop);

  if (x0 > x1) {
    const temp = x0;
    x0 = x1;
    x1 = temp;
  }

  if (y0 > y1) {
    const temp = y0;
    y0 = y1;
    y1 = temp;
  }

  return new Bbox(dragInfo.page, x0, y0, x1, y1);
}

let currDragInfo: DragInfo | null = null;

window.addEventListener('mousedown', e => {
  if (e.target instanceof HTMLCanvasElement) {
    const pageEl = e.target.parentNode;

    if (!(pageEl instanceof Element)) return;

    const pageNum = pageEl.getAttribute('data-page');

    if (pageNum === null)
      throw new Error("page lacks a data-page attribute!");

    currDragInfo = {
      page: parseInt(pageNum),
      pageCanvas: e.target,
      startX: e.pageX,
      startY: e.pageY,
      currX: e.pageX,
      currY: e.pageY,
    };

    setCurrBbox(dragInfoToBbox(currDragInfo));
    e.preventDefault();
  }
});

window.addEventListener('mousemove', e => {
  if (currDragInfo === null) return;

  currDragInfo.currX = e.pageX;
  currDragInfo.currY = e.pageY;

  setCurrBbox(dragInfoToBbox(currDragInfo));
  e.preventDefault();
});

window.addEventListener('mouseup', e => {
  if (currDragInfo === null) return;

  let bbox = dragInfoToBbox(currDragInfo);

  setCurrBbox(bbox);

  currDragInfo = null;
  e.preventDefault();

  const currUrl = window.location.pathname + window.location.search +
                  window.location.hash;

  const url = window.location.pathname + (bbox ? bbox.toQuerystring() : '') +
              window.location.hash;

  if (currUrl !== url) {
    window.history.pushState(null, '', url);
  }
});

function setCurrBboxFromQuerystring() {
  setCurrBbox(Bbox.fromQuerystring(window.location.search));
}

window.addEventListener('load', setCurrBboxFromQuerystring);
window.addEventListener('popstate', setCurrBboxFromQuerystring);
