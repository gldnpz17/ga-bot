const { getAuthSession } = require("../use-cases/authentication")

module.exports.authentication = async (req, res, next) => {
  let token = req.cookies['Auth-Token'];

  if (token) {
    let session = await getAuthSession(token);

    if (session) {
      console.log('Authentication passed.');
      req.authSession = session;

      next();
    } else {
      console.log('Invalid token. Challenging.');
      res.clearCookie('AuthToken');

      res.redirect(401, `/login.html?continue=${req.originalUrl}`);
    }
  } else {
    console.log('Unauthenticated. Challenging.');

    res.redirect(401, `/login.html?continue=${req.originalUrl}`);
  }
}