var FakeBackpack = require('../test/lib/util').FakeBackpack;
var fakeBackpackCache = {};

function getFakeBackpack(email) {
  if (!email) email = 'default';
  if (!(email in fakeBackpackCache))
    fakeBackpackCache[email] = FakeBackpack(email);
  return fakeBackpackCache[email];
}

exports.middleware = function getBackpackMiddleware(req, res, next) {
  req.backpack = getFakeBackpack(req.session.email);
  next();
}
