var _ = require('underscore');
var expressPersona = require('express-persona');

var ORIGIN = "https://login.persona.org";
var JS_URL = ORIGIN + "/include.js";

exports.defineMiddleware = function(app, options) {
  _.extend(app.locals, {PERSONA_JS_URL: options.jsUrl || JS_URL});
  app.use(function(req, res, next) {
    var policies = res.contentSecurityPolicies;

    if (policies) {
      policies['script-src'].push(exports.ORIGIN);
      policies['frame-src'].push(exports.ORIGIN);
    }
    next();
  });
};

exports.defineRoutes = function(app, options) {
  var defineRoutes = options.defineRoutes || require('express-persona');

  defineRoutes(app, {audience: options.audience});
};

exports.ORIGIN = ORIGIN;
exports.JS_URL = JS_URL;
