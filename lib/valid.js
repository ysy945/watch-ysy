const { isFunction, isString, isObject } = require("./utils");

function createError(functionName, where, shouldBe, get) {
  throw new Error(
    `${functionName} ${where} arguments should be '${shouldBe}' but got '${get}'`
  );
}

//watchFileSync和watchDirSync的参数验证
function validWatchFileOrDirSyncArguments(isFile, ...args) {
  const functionName = isFile ? "watchFileSync" : "watchDirSync";
  if (args[0] && !isString(args[0])) {
    createError(functionName, "first", "string", typeof args[0]);
  }
  if (args[1] && !isFunction(args[1])) {
    createError(functionName, "second", "function", typeof args[1]);
  }
  if (args[2] && !isObject(args[2])) {
    createError(functionName, "third", "object", typeof args[2]);
  }
}

//watchFile的参数检验
function validWatchFileOrDirArguments(isFile, ...args) {
  const functionName = isFile ? "watchFile" : "watchDir";
  if (args[0] && !isString(args[0])) {
    createError(functionName, "first", "string", typeof args[0]);
  }
  if (args[1] && !isFunction(args[1])) {
    createError(functionName, "second", "function", typeof arguments[1]);
  }
  if (args[2] && !isObject(args[2])) {
    createError(functionName, "third", "object", typeof args[2]);
  }
  if (args[3] && !isFunction(args[3])) {
    createError(functionName, "fourth", "function", typeof args[3]);
  }
}

module.exports = {
  validWatchFileOrDirSyncArguments,
  validWatchFileOrDirArguments,
};
