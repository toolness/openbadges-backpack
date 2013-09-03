var querystring = require('querystring');
var issue = require('../');

var testUtil = require('./lib/util');
var request = testUtil.request;

var badgehostApp;

before(function(done) {
  badgehostApp = testUtil.BadgehostApp(done);
});

after(function() {
  badgehostApp.server.close();
});

describe("GET /issue", function() {
  it("should return 200 when no query args are given", function(done) {
    // TODO: We should probably test to ensure that some kind
    // of error message is displayed here.
    request()
      .get('/issue')
      .expect(200, done);
  });

  it("should show errors when badges are invalid", function(done) {
    request()
      .get('/issue?assertion=u')
      .expect(/not a valid signed badge or url/)
      .expect(200, done);
  });

  it("should present info on valid badges", function(done) {
    request()
      .get('/issue?' + querystring.stringify({
        assertion: badgehostApp.badgeFor('foo@example.org')
      }))
      .expect(/Please log in/)
      .expect(/Demo Badge/, done);
  });
});
