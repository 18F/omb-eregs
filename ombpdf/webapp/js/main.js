var pdfjsLib = require('pdfjs-dist');

// Setting worker path to worker bundle.
pdfjsLib.PDFJS.workerSrc = SCRIPT_PARAMS.workerSrc;

// Loading a document.
var loadingTask = pdfjsLib.getDocument(SCRIPT_PARAMS.pdfPath);

loadingTask.promise.then(function (pdfDocument) {
  document.querySelectorAll('.page').forEach(function(page, i) {
    var canvas = document.createElement('canvas');
    page.prepend(canvas);

    return pdfDocument.getPage(i + 1).then(function (pdfPage) {
      // Display page on the existing canvas with 100% scale.
      var viewport = pdfPage.getViewport(1.0);
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      var ctx = canvas.getContext('2d');
      var renderTask = pdfPage.render({
        canvasContext: ctx,
        viewport: viewport
      });
      return renderTask.promise;
    });
  });
}).catch(function (reason) {
  console.error('Error: ' + reason);
});

var pages = document.querySelectorAll('.page');

function isElPartlyInViewport (el) {
  var rect = el.getBoundingClientRect();

  return (
    rect.bottom >= 0 &&
    rect.right >= 0 &&
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function setInViewport() {
  pages.forEach(function(page, i) {
    page.classList.toggle('in-viewport', isElPartlyInViewport(page));
  });
}

['scroll', 'resize', 'load'].forEach(function(name) {
  window.addEventListener(name, setInViewport);
});

var tooltip = document.getElementById('tooltip');

function hideTooltip() {
  tooltip.style.display = 'none';
}

function showTooltip(charEl, x, y) {
  var lineEl = charEl.parentNode;
  var lineno = lineEl.getAttribute('data-lineno');
  var lineAnno = lineEl.getAttribute('data-anno');
  var char = charEl.textContent;

  tooltip.style.top = y + 'px';
  tooltip.style.left = x + 'px';
  tooltip.style.display = 'block';
  tooltip.textContent = [
    `Char ${JSON.stringify(char)} on line #${lineno}`,
    `Line annotation: ${lineAnno}`,
  ].join('\n');
}

onload = function() {
  document.body.addEventListener('mousemove', function(e) {
    if (e.target.classList.contains('char')) {
      showTooltip(e.target, e.pageX + 10, e.pageY + 10);
    } else {
      hideTooltip();
    }
  });
};
