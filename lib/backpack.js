var fakeBackpackCache = {};

function getFakeBackpack(email) {
  var FakeBackpack = require('../test/lib/util').FakeBackpack;

  if (!email) email = 'default';
  if (!(email in fakeBackpackCache))
    fakeBackpackCache[email] = FakeBackpack(email);
  return fakeBackpackCache[email];
}

exports.middleware = function getBackpackMiddleware(req, res, next) {
  exports.forUser(req.session.email, function(err, backpack) {
    req.backpack = backpack;
    next(err);
  });
}

exports.forUser = function(email, cb) {
  return cb(null, getFakeBackpack(email));
};
