class Bbox {
  constructor(page, x0, y0, x1, y1) {
    this.page = page;
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
  }

  toCss() {
    return [
      `bottom: ${this.y0 - 1}px`,
      `left: ${this.x0}px`,
      `width: ${this.x1 - this.x0}px`,
      `height: ${this.y1 - this.y0}px`
    ].join('; ')
  }

  toQuerystring() {
    return `?bbox=${this.page},${this.x0},${this.y0},${this.x1},${this.y1}`;
  }

  static fromQuerystring(text) {
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

function showBbox(bbox) {
  const pageEl = document.querySelector(`.page[data-page="${bbox.page}"]`);
  const bboxEl = document.createElement('div');

  pageEl.appendChild(bboxEl);

  bboxEl.classList.add('bbox');
  bboxEl.setAttribute('style', bbox.toCss());

  return bboxEl;
}

let currBboxEl = null;

function setCurrBbox(bbox) {
  if (currBboxEl !== null) {
    currBboxEl.parentNode.removeChild(currBboxEl);
    currBboxEl = null;
  }
  if (bbox !== null) {
    currBboxEl = showBbox(bbox);
  }
}

function dragInfoToBbox(dragInfo) {
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

let currDragInfo = null;

window.addEventListener('mousedown', e => {
  if (e.target instanceof HTMLCanvasElement) {
    const pageEl = e.target.parentNode;

    currDragInfo = {
      page: parseInt(pageEl.getAttribute('data-page')),
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
