const { getAuthSession } = require("../use-cases/authentication")

module.exports.authentication = async (req, res, next) => {
  let token = req.cookies['Auth-Token'];

  if (token) {
    let session = await getAuthSession(token);

    if (session) {
      req.authSession = await getAuthSession();

      next();
    } else {
      res.clearCookie('AuthToken');

      res.status(401); // 401 Unauthorized.
      res.redirect(`/login?continue=${req.originalUrl}`);
    }
  }
}