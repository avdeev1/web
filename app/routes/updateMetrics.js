module.exports = function(max, min) {
  let first = parseInt(max);
  let second = parseInt(min);
  let res = Math.round((second/first) * 100);
  res = 100 - res;
  return res;
}