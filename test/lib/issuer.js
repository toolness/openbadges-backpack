var path = require('path');
var BadgehostApp = require('./util').BadgehostApp;

var INDEX_HTML = [
  '<!DOCTYPE html>',
  '<meta charset="utf-8">',
  '<title>Test Issuer</title>',
  '',
  '<h1>Test Issuer</h1>',
  '',
  '<p>Fill out the form below to issue a badge for any email address',
  'of your choice, and send it to your backpack.</p>',

  '<form method="GET">',
  '  <input type="email" name="email" placeholder="recipient email" ',
  '   required>',
  '<input type="submit" value="Issue Badge">',
  '</form>'
].join('\n');

function TestIssuerApp(options, cb) {
  var app = BadgehostApp(options.port, cb);

  app.get('/', function(req, res, next) {
    var email = req.param('email');

    if (!email)
      return res.send(INDEX_HTML);

    var assertion = app.badgeFor(email);
    var url = options.backpackURL + "/issue?assertion=" +
              encodeURIComponent(assertion);

    return res.redirect(url);
  });

  return app;
}

module.exports = TestIssuerApp;

if (!module.parent)
  module.exports({
    port: process.env.PORT || 3001,
    backpackURL: process.env.BACKPACK_URL || 'http://localhost:3000'
  }, function(err, app) {
    if (err) throw err;
    console.log("Listening at " + app.url());
  });
