module.exports = function(password) {
  var res = 0;
  var str = password.split('');
  var x = 24;
  for (let i = 0; i < str.length; i++) {
    res += str[i].charCodeAt(0)*Math.pow(x, i);
  }
  return res;
}