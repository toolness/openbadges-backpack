var path = require('path');
var express = require('express');
var nunjucks = require('nunjucks');
var async = require('async');

var testUtil = require('./util');

var TEST_STATIC_DIR = path.join(__dirname, '..', 'static');
var TEST_TEMPLATE_DIR = path.join(__dirname, '..', 'template');

function badgehostAppLazyLoader(app) {
  var badgehostSetupQueue = async.queue(function(task, cb) {
    if (app.badgehostApp) return cb(null);
    require('./util').BadgehostApp(function(err, badgehostApp) {
      if (err) return cb(err);
      app.badgehostApp = badgehostApp;
      cb(null);
    });
  }, 1);

  return function(req, res, next) {
    badgehostSetupQueue.push({}, next);
  }
}

exports.defineMiddleware = function(app) {
  var loader = new nunjucks.FileSystemLoader(TEST_TEMPLATE_DIR);

  app.nunjucksEnv.loaders.push(loader);
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
  app.use('/test/issue', badgehostAppLazyLoader(app));
};

exports.defineRoutes = function(app) {
  app.get('/test/issue', function(req, res, next) {
    return res.render('test-issue.html', {
      badgeFor: app.badgehostApp.badgeFor.bind(app.badgehostApp)
    });
  });
  app.post('/test/issue', function(req, res, next) {
    var email = req.param('email');

    return res.redirect(app.badgehostApp.badgeFor(email));
  });
};
