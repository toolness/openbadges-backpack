var SendRequestGroup = require('./send-to-backpack-request').Group;
var backpack = require('./backpack');

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

function getAcceptedAssertions(body) {
  var assertions = [];

  Object.keys(body).forEach(function(name) {
    var match = name.match(/^accept-([A-Za-z0-9]+)$/);

    if (match)
      assertions.push(body['assertion-' + match[1]]);
  });

  return assertions;
}

function getIssue(req, res, next) {
  var assertions = req.param('assertion') || [];

  if (typeof(assertions) == 'string') assertions = [assertions];

  var requests = SendRequestGroup(req.backpack, assertions, function(err) {
    if (err) return next(err);
    return res.render('issue.html', {
      requests: splitRequests(requests),
    });
  });
}

function postIssue(req, res, next) {
  var assertions = getAcceptedAssertions(req.body);

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
}

exports.defineRoutes = function(app) {
  app.get('/issue', backpack.middleware, getIssue);
  app.post('/issue', backpack.middleware, postIssue);
}
