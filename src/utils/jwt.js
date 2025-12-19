const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'secret';

function sign(payload) {
  return jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}
function verify(token) {
  return jwt.verify(token, secret);
}
module.exports = { sign, verify };
