function securityHeaders(options) {
  return function(req, res, next) {
    res.set('X-Frame-Options', 'DENY');
    res.set('X-Content-Type-Options', 'nosniff');
    if (options.enableHSTS)
      res.set('Strict-Transport-Security',
              'max-age=31536000; includeSubDomains');

    addContentSecurityPolicy(req, res);
    next();
  };
}

function addContentSecurityPolicy(req, res) {
  res.contentSecurityPolicies = {
    'default-src': ["'self'"],
    'script-src': ["'self'"],
    'frame-src': [],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ['*'],
    // options is deprecated, but Firefox still needs it.
    'options': []
  };

  res.on('header', function() {
    var policies = res.contentSecurityPolicies;
    var directives = [];
    Object.keys(policies).forEach(function(directive) {
      directives.push(directive + ' ' + policies[directive].join(' '));
    });
    var policy = directives.join('; ');
    res.set('Content-Security-Policy', policy);
    res.set('X-Content-Security-Policy', policy);
    res.set('X-WebKit-CSP', policy);
  });
}

module.exports = securityHeaders;
