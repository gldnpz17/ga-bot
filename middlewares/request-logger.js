module.exports.requestLogger = async (req, res, next) => {
  try {
    console.log('Request received.');
    console.log(`URL: ${req.url}`);
    console.log(`HEADERS: ${JSON.stringify(req.headers)}`);
    console.log(`BODY: ${JSON.stringify(req.body)}`);
    next();
  } catch (err) {
    next(err)
  }
};