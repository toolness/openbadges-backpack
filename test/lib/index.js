var path = require('path');
var express = require('express');

var TEST_STATIC_DIR = path.join(__dirname, '..', 'static');

exports.defineMiddleware = function(app) {
  app.use('/test', function(req, res, next) {
    var policies = res.contentSecurityPolicies;

    if (policies) {
      // Some of our testing tools, e.g. sinon, use eval(), so we'll
      // enable it for this one endpoint.
      policies['script-src'].push("'unsafe-eval'");
      policies['options'].push('eval-script');
    }
    next();
  });
  app.use('/test', express.static(TEST_STATIC_DIR));
};
