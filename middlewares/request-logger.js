module.exports.requestLogger = async (req, res, next) => {
  try {
    console.log('Request received.');
    console.log(`URL: ${req.url}`);
    console.log(`HEADERS: ${req.headers}`);
    console.log(`BODY: ${req.body}`);
  } catch (err) {
    next(err)
  }
};