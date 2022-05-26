const { isArray, isString, isObject, getAbsolutePath } = require("./utils");
const watchDirSync = require("./watchDirSync");
const watchFileSync = require("./watchFileSync");

const fs = require("fs");

function _watchSync(path, changeCallback, options = {}) {
  const absolutePath = getAbsolutePath( path, []);
  let cancel;
  //这是文件夹
  if (fs.statSync(absolutePath).isDirectory()) {
    cancel = watchDirSync(absolutePath, changeCallback, options);
  }
  //这是文件
  else {
    cancel = watchFileSync(path, changeCallback, options);
  }
  return cancel;
}

function watchSync(pathArray, changeCallback, options, resultCallback) {
  const allResultCallback = [];
  if (isArray(pathArray)) {
    pathArray.forEach((path) => {
      if (isString(path)) {
        allResultCallback.push(_watchSync(path, changeCallback, options));
      } else if (isObject(path)) {
        allResultCallback.push(
          _watchSync(path.path, changeCallback, path.options || options)
        );
      } else {
        throw new Error(
          `first arguments should be type of 'Array<string|object>'`
        );
      }
    });
  } else if (isString(pathArray)) {
    allResultCallback.push(_watchSync(pathArray, changeCallback, options));
  } else {
    throw new Error(`first arguments should be type of 'Array<string|object>'`);
  }
  return () => allResultCallback.forEach((c) => c());
}

module.exports = watchSync;
