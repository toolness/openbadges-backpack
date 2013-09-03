var Fiber = require('fibers');

module.exports = function inFiber(fn) {
  return function runInFiber(done) {
    Fiber(function() {
      try {
        fn();
        done(null);
      } catch (e) {
        done(e);
      }
    }).run();
  };
};
