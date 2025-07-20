const jsonwebtoken = require('jsonwebtoken');
require('dotenv').config();

function issueJWTLogin(user) {
  const _id = user.user_id;

  const expiresIn = process.env.EXPIRE_TIME_TOKEN;

  const payload = {
    sub: _id,
    authorization: user.user_role,
    iat: Date.now()
  };

  const signedToken = jsonwebtoken.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: expiresIn, algorithm: 'HS256' });

  return {
    token: "Bearer " + signedToken,
    expires: expiresIn
  }
}

module.exports = issueJWTLogin;