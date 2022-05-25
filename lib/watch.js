const { isArray, isString, isObject, getAbsolutePath } = require("./utils");
const watchDir = require("./watchDir");
const watchFile = require("./watchFile");

const fs = require("fs");

function _watch(path, changeCallback, options, resultCallback) {
  const absolutePath = getAbsolutePath(process.cwd(), path, [], true);
  //这是文件夹
  if (fs.statSync(absolutePath).isDirectory()) {
    watchDir(absolutePath, changeCallback, options, function (cancel) {
      resultCallback(cancel);
    });
  }
  //这是文件
  else {
    watchFile(path, changeCallback, options, function (cancel) {
      resultCallback(cancel);
    });
  }
}

function watch(
  pathArray,
  changeCallback,
  options = {},
  resultCallback = () => {}
) {
  const allResultCallback = [];
  if (isArray(pathArray)) {
    function cache() {
      let i = 0;
      function cancelAll() {
        allResultCallback.forEach((cancel) => cancel());
      }
      return function (cancel) {
        allResultCallback.push(cancel);
        if (++i === pathArray.length) resultCallback(cancelAll);
      };
    }
    const _resultCallback = cache();
    pathArray.forEach((path) => {
      if (isString(path)) {
        _watch(path, changeCallback, options, _resultCallback);
      } else if (isObject(path)) {
        _watch(
          path.path,
          changeCallback,
          path.options || options,
          _resultCallback
        );
      } else {
        throw new Error(
          `first arguments should be type of 'Array<string|object>'`
        );
      }
    });
  } else if (isString(pathArray)) {
    _watch(pathArray, changeCallback, options, resultCallback);
  } else {
    throw new Error(`first arguments should be type of 'Array<string|object>'`);
  }
}

module.exports = watch;
