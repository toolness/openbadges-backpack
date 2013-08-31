module.exports = process.env.BACKPACK_COV
  ? require('./lib-cov/')
  : require('./lib/');
