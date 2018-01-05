// This script sets the `in-viewport` class on all pages to reflect
// whether the page is currently in the browser's viewport. Combined
// with CSS that sets `display: none` on anything not in the viewport,
// this significantly speeds up rendering on Chrome.

var pages = document.querySelectorAll('.page');

function isElPartlyInViewport (el: Element) {
  var rect = el.getBoundingClientRect();

  return (
    rect.bottom >= 0 &&
    rect.right >= 0 &&
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function setInViewport() {
  Array.from(pages).forEach(function(page, i) {
    page.classList.toggle('in-viewport', isElPartlyInViewport(page));
  });
}

['scroll', 'resize', 'load'].forEach(function(name) {
  window.addEventListener(name, setInViewport);
});
