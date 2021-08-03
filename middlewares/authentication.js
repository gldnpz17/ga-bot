const { getAuthSession } = require("../use-cases/authentication")

module.exports.authentication = async (req, res, next) => {
  let token = req.cookies['Auth-Token'];

  if (token) {
    let session = await getAuthSession(token);

    if (session) {
      req.authSession = await getAuthSession();
      console.log('Authentication passed.');

      next();
    } else {
      console.log('Unauthenticated. Challenging.');
      res.clearCookie('AuthToken');

      res.redirect(401, `/login?continue=${req.originalUrl}`);
    }
  }
}