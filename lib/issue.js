var SendRequestGroup = require('./send-to-backpack-request').Group;
var FakeBackpack = require('../test/lib/util').FakeBackpack;

var fakeBackpackCache = {};

function getFakeBackpack(email) {
  if (!email) return FakeBackpack('');
  if (!(email in fakeBackpackCache))
    fakeBackpackCache[email] = FakeBackpack(email);
  return fakeBackpackCache[email];
}

exports.defineRoutes = function(app, backpack) {
  app.get('/issue', function(req, res, next) {
    var assertions = req.param('assertion') || [];

    if (typeof(assertions) == 'string') assertions = [assertions];

    var backpack = getFakeBackpack(req.session.email);
    var requests = SendRequestGroup(backpack, assertions, function(err) {
      if (err) return next(err);
      return res.render('issue.html', {
        requests: requests,
        acceptedRequests: []
      });
    });
  });

  app.post('/issue', function(req, res, next) {
    var backpack = getFakeBackpack(req.session.email);
    var assertions = [];

    Object.keys(req.body).forEach(function(name) {
      var match = name.match(/^accept-([A-Za-z0-9]+)$/);

      if (match) {
        var urlOrSignature = req.body['assertion-' + match[1]];
        assertions.push(urlOrSignature);
      }
    });

    if (assertions.length == 0) {
      req.flash('error', 'You didn\'t select any badges to accept.');
      return res.redirect('back');
    }

    var requests = SendRequestGroup(backpack, assertions, function(err) {
      if (err) return next(err);

      requests.acceptAll(function(err) {
        if (err) return next(err);

        return res.render('issue.html', {
          requests: [],
          acceptedRequests: requests
        });
      });
    });
  });
}
