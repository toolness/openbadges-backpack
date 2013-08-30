var _ = require('underscore');
var request = require('supertest');
var should = require('should');
var validator = require('openbadges-validator');
var badgehost = require('badgehost');

var backpack = require('../../');
var fibrous = backpack.fibrous;

exports.app = function(options) {
  options = _.defaults(options || {}, {
    origin: 'http://example.org',
    cookieSecret: 's3cret'
  });

  if (options.testRoutes) {
    var testRoutes = options.testRoutes;

    options.defineExtraRoutes = function(app) {
      Object.keys(testRoutes).forEach(function(route) {
        var parts = route.split(' ', 2);
        var method = parts[0].toLowerCase();
        var path = parts[1];

        return app[method](path, testRoutes[route]);
      });
    };
    delete options.testRoutes;
  }

  if (options.testTemplates) {
    options.extraTemplateLoaders = [FakeLoader(options.testTemplates)];
    delete options.testTemplates;
  }

  return backpack.app.build(options);
};

exports.request = function(options) {
  var app = exports.app(options);

  return request(app);
};

var FakeLoader = exports.templateLoader = function FakeLoader(map) {
  return {
    getSource: function(name) {
      if (name in map) {
        return {
          src: map[name],
          path: name,
          upToDate: function() { return true; }
        };
      }
    }
  };
};

should.Assertion.prototype.route = function(method, url) {
  var match = this.obj._router.matchRequest({
    method: method,
    url: url
  });
  var baseMsg = 'expected route for ' + method + ' ' + url + ' to ';
  return this.assert(
    match && typeof(match) == 'object',
    function() { return baseMsg + 'exist' },
    function() { return baseMsg + 'not exist' }
  );
};

exports.FakeBackpack = function(owner) {
  var self = [];

  self.owner = owner;

  self.has = fibrous(function(options, cb) {
    if (typeof(options) == 'string') options = {guid: options};
    if (options.guid)
      return cb(null, self.indexOf(options.guid) != -1);
    validator.getAssertionGUID(options.urlOrSignature, function(err, guid) {
      if (err) return cb(err);
      return self.has({guid: guid}, cb);
    });
  });

  self.receive = fibrous(function(info, cb) {
    info.guid.should.be.a('string');
    self.indexOf(info.guid).should.eql(-1);
    self.push(info.guid);
    cb(null);
  });

  return self;
};

exports.BadgehostApp = fibrous(function(port, cb) {
  var app = badgehost.app.build();

  if (typeof(port) == 'function') {
    cb = port;
    port = 0;
  }

  app.badgeFor = function(recipient, uid) {
    return app.url('demo.json', {
      set: {
        uid: uid || 'uid-1',
        recipient: {
          type: "email",
          hashed: false,
          identity: recipient
        }
      }
    })
  };

  app.listen(port, function() {
    app.server = this;
    cb(null, app);
  });
});
