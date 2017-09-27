/* Using React's dangerouslySetInnerHTML to inject conditional stylesheet
 * comments proved not to work. The comments need to be inserted in a 
 * <meta> and React throws an error around this. Inserting the comments
 * in a <script> does not work.
 * Using something like the ie-version npm package would not work because
 * the `window` object is not available server-side.
 * Additionally, we need to run this script before any of the other page
 * JS because the browser JS doesn't work in IE10-. When the browser JS
 * breaks, this script fails to run.
 * Unfortunately, this script and the IE CSS do get loaded in each browser.
 * Fortunately, each is pretty small.
 * What I'm saying is that this is, by my estimation, a necessary evil. [TS]
 */
// https://codepen.io/gapcode/pen/vEJNZN
function detectIE() {
  var ua = window.navigator.userAgent;

  var msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  }

  var trident = ua.indexOf('Trident/');
  if (trident > 0) {
    // IE 11 => return version number
    var rv = ua.indexOf('rv:');
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
  }

  var edge = ua.indexOf('Edge/');
  if (edge > 0) {
    // Edge (IE 12+) => return version number
    return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
  }

  // other browser
  return false;
}

window.onload = function() {
  var ieVersion;
  try { 
    ieVersion = detectIE();
  }
  catch(e) {
    console.error(e.message);
    return;
  }
  if (ieVersion === parseInt(ieVersion, 10)) {
    if (ieVersion <= 9) {
      document.body.className = 'legacy-ie';
    }
    else if (ieVersion === 10) {
      document.body.className = 'ie10';
    }
    else if (ieVersion === 11) {
      document.body.className = 'ie11';
    }
  }
}
