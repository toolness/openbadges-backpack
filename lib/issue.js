var SendRequestGroup = require('./send-to-backpack-request').Group;

var getBackpack = (function() {
  var FakeBackpack = require('../test/lib/util').FakeBackpack;
  var fakeBackpackCache = {};

  function getFakeBackpack(email) {
    if (!email) email = 'default';
    if (!(email in fakeBackpackCache))
      fakeBackpackCache[email] = FakeBackpack(email);
    return fakeBackpackCache[email];
  }

  return function(req, res, next) {
    req.backpack = getFakeBackpack(req.session.email);
    next();
  }
})();

function splitRequests(requests) {
  function filterResult(result) {
    return requests.filter(function(r) { return r.result == result; });
  }

  return {
    valid: requests.filter(function(r) { return !!r.badgeInfo; }),
    pending: requests.filter(function(r) { return r.canBeAccepted; }),
    accepted: filterResult("accepted"),
    inBackpack: filterResult("exists"),
    mismatched: filterResult("recipient_mismatch"),
    invalid: filterResult("invalid")
  };
}

exports.defineRoutes = function(app) {
  app.get('/issue', getBackpack, function(req, res, next) {
    var assertions = req.param('assertion') || [];

    if (typeof(assertions) == 'string') assertions = [assertions];

    var requests = SendRequestGroup(req.backpack, assertions, function(err) {
      if (err) return next(err);
      return res.render('issue.html', {
        requests: splitRequests(requests),
      });
    });
  });

  app.post('/issue', getBackpack, function(req, res, next) {
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

    var requests = SendRequestGroup(req.backpack, assertions, function(err) {
      if (err) return next(err);

      requests.acceptAll(function(err) {
        if (err) return next(err);

        return res.render('issue.html', {
          requests: splitRequests(requests),
        });
      });
    });
  });
}
