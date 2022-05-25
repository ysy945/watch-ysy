const { INCREASED, REDUCED } = require("../types");

/**
 *
 * @param {*} curDirPath ['index.js','path.js']
 * @param {*} nextDirPath ['index.js','next.js','hello.js']
 * [{type:'increased',value:'next.js'},{type:'increased',value:'hello.js'},{type:'reduced',value:'path.js'}]
 */
function findCreateAndRemoveFilePath(curDirPath, nextDirPath) {
  const map = {};
  const result = [];

  curDirPath.forEach((c) => {
    if (!map[c]) {
      map[c] = 1;
    }
  });
  nextDirPath.forEach((c) => {
    //如果存在说明是增加的
    if (!map[c]) {
      result.push({ type: INCREASED, path: c });
    } else {
      map[c]++;
    }
  });
  for (const key in map) {
    //是减少的
    if (map[key] === 1) {
      result.push({ type: REDUCED, path: key });
    }
  }
  return result;
}

module.exports = findCreateAndRemoveFilePath;
