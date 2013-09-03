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
    request()
      .get('/issue')
      .expect(200, done);
  });
});
