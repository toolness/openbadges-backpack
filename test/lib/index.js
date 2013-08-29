var path = require('path');
var express = require('express');

var TEST_STATIC_DIR = path.join(__dirname, '..', 'static');

exports.express = function(app) {
  app.use('/test', express.static(TEST_STATIC_DIR));
};
