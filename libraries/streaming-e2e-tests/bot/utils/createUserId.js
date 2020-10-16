const random = require('math-random');

module.exports = function createUserID() {
  return `dl_${random().toString(36).substr(2)}`;
}
