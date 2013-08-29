// Return a wrapped 'fibrous' version of the given function that takes
// a callback as a MANDATORY final argument, and doesn't take a function
// as any of its other arguments.
//
// If the fibrous version is run in a Fiber and not given a callback,
// it will call its wrapped function with a Future, wait until the
// Future is resolved, and return the result (or throw an exception).
//
// If the fibrous version is not called in a Fiber, or is passed
// a callback, the wrapped function will be called with the same
// arguments.
module.exports = function fibrous(fn) {
  try {
    var Fiber = require('fibers');
    if (!module.exports.enabled) throw new Error();
  } catch (e) {
    return fn;
  }

  var Future = require('fibers/future');
  var wrapped = Future.wrap(fn);

  return function maybeRunInFiberAndWait() {
    var lastArg = arguments[arguments.length - 1];
    if (Fiber.current && typeof(lastArg) != "function") {
      return wrapped.apply(this, arguments).wait();
    } else {
      return fn.apply(this, arguments);
    }
  };
}

module.exports.enabled = true;
