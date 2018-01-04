interface ScriptParams {
  workerSrc: string;
  pdfPath: string;
}

declare let SCRIPT_PARAMS: ScriptParams;

import * as pdfjsLib from 'pdfjs-dist';

// Setting worker path to worker bundle.
pdfjsLib.PDFJS.workerSrc = SCRIPT_PARAMS.workerSrc;

// Loading a document.
var loadingTask = pdfjsLib.getDocument(SCRIPT_PARAMS.pdfPath);

loadingTask.promise.then(function (pdfDocument) {
  var pages = document.querySelectorAll('.page');
  Array.from(pages).forEach(function(page, i) {
    var canvas = document.createElement('canvas');

    if (page.children.length > 0) {
      page.insertBefore(canvas, page.children[0]);
    } else {
      page.appendChild(canvas);
    }

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
