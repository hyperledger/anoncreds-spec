
function delegateEvent(type, selector, fn, options = {}){
  return (options.container || document).addEventListener(type, e => {
    let match = e.target.closest(selector);
    if (match) fn(e, match);
  }, options);
}

skipAnimationFrame = fn => requestAnimationFrame(() => requestAnimationFrame(fn));

var domReady = new Promise(resolve => {
  document.addEventListener('DOMContentLoaded', e => resolve())
});