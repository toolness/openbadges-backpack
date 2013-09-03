var assert = require('assert');
var async = require('async');
var _ = require('underscore');
var validator = require('openbadges-validator');

var fibrous = require('./fibrous');

var Request = fibrous(function Request(backpack, urlOrSignature, done) {
  var self = {
    urlOrSignature: urlOrSignature,
    result: null,
    error: null,
    badgeInfo: null,
    canBeAccepted: false
  };
  var extend = _.extend.bind(_, self);

  self.accept = fibrous(function(accept, cb) {
    assert(self.canBeAccepted);
    self.canBeAccepted = false;
    if (!cb) {
      cb = accept;
      accept = undefined;
    }
    if (typeof(accept) == "undefined") accept = true;
    if (accept) {
      backpack.receive(self.badgeInfo, function(err) {
        cb(err, extend({
          result: err ? "backpack_error" : "accepted",
          error: err || null
        }));
      });
    } else
      cb(null, extend({result: "rejected"}));
  });

  self.reject = self.accept.bind(self, false);

  validator(urlOrSignature, function(err, info) {
    if (err)
      return done(null, extend({result: "invalid", error: err}));
    self.badgeInfo = info;
    if (!validator.doesRecipientMatch(info, backpack.owner))
      return done(null, extend({
        result: "recipient_mismatch",
        error: new Error("badge recipient is not " + backpack.owner)
      }));
    backpack.has(info.guid, function(err, isInBackpack) {
      if (err) return done(err, extend({
        result: "backpack_error",
        error: err
      }));
      if (isInBackpack) return done(null, extend({
        result: "exists",
        error: new Error("badge is already in backpack")
      }));

      return done(null, extend({canBeAccepted: true}));
    });
  });

  return self;
});

var RequestGroup = fibrous(function RequestGroup(backpack, badges, done) {
  var self = [];
  var makeSendRequest = Request.bind(null, backpack);

  // TODO: We should probably check the badges to ensure that they
  // all have unique GUIDs.

  self.acceptAll = fibrous(function(accept, cb) {
    if (typeof(accept) == "function") {
      cb = accept;
      accept = true;
    }
    async.each(self, function(req, cb) {
      if (!req.canBeAccepted) return cb(null);
      req.accept(accept, cb);
    }, cb);
  });

  self.rejectAll = self.acceptAll.bind(self, false);

  process.nextTick(function() {
    async.map(badges, makeSendRequest, function(err, results) {
      if (err) return done(err);

      self.push.apply(self, results);
      done(null, self);
    });
  });
  
  return self;
});

module.exports = Request;
module.exports.Group = RequestGroup;
