const TOOLTIP_ID = 'tooltip';

function getTooltip(): HTMLElement {
  var el = document.getElementById(TOOLTIP_ID);
  if (!el)
    throw new Error(`element with id '${TOOLTIP_ID}' not found!`);
  return el;
}

function hideTooltip() {
  getTooltip().style.display = 'none';
}

function showTooltip(charEl: Element, x: number, y: number) {
  var lineEl = charEl.parentNode;

  if (!(lineEl instanceof Element)) return;

  var lineno = lineEl.getAttribute('data-lineno');
  var lineAnno = lineEl.getAttribute('data-anno');
  var char = charEl.textContent;
  var tooltip = getTooltip();

  tooltip.style.top = y + 'px';
  tooltip.style.left = x + 'px';
  tooltip.style.display = 'block';
  tooltip.textContent = [
    `Char ${JSON.stringify(char)} on line #${lineno}`,
    `Line annotation: ${lineAnno}`,
  ].join('\n');
}

window.addEventListener('load', function() {
  document.body.addEventListener('mousemove', function(e) {
    if (!(e.target instanceof Element)) return;

    if (e.target.classList.contains('char')) {
      showTooltip(e.target, e.pageX + 10, e.pageY + 10);
    } else {
      hideTooltip();
    }
  });
});
