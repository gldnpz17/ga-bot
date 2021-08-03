module.exports = (length) => {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let x = 0; x < length; x++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}