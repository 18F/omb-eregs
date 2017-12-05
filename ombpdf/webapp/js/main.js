var pdfjsLib = require('pdfjs-dist');

// TODO: Get this from the current page's DOM.
var pdfPath = '/raw/2016/m_16_19_1.pdf';

// Setting worker path to worker bundle.
// TODO: Get this from the current page's DOM.
pdfjsLib.PDFJS.workerSrc = '/static/js/pdf.worker.bundle.js';

// Loading a document.
var loadingTask = pdfjsLib.getDocument(pdfPath);
loadingTask.promise.then(function (pdfDocument) {
  // Request a first page
  var firstPage = document.querySelector('.page');
  var canvas = document.createElement('canvas');
  firstPage.prepend(canvas);

  // TODO: Do this for all pages.
  return pdfDocument.getPage(1).then(function (pdfPage) {
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
}).catch(function (reason) {
  console.error('Error: ' + reason);
});
