const { resolve, isAbsolute, extname ,isDirectory} = require("path");
const fs = require("fs");

/**
 *
 * @param {*} context 工作目录
 * @param {*} path //路径
 * @param {*} isDir //是否是文件夹 默认是文件
 * @returns //完整路径
 */
function getAbsolutePath( context,path, extensions = [],isDir = false) {
  let absolutePath;
  //如果是绝对路径
  if (isAbsolute(path)) {
    absolutePath = path;
  }
  //如果是相对路径
  else {
    absolutePath = resolve(context,path);
  }
  if (!isDir) {
    //给路径添加.js后缀
    const index = extensions.indexOf(extname(absolutePath));
    absolutePath = index === -1 ? createError(absolutePath) : absolutePath;
  }
  return absolutePath;
}

function createError(absolutePath) {
  throw new Error(
    `Can not find the file at '${absolutePath}'. Maybe you should add params 'extensions',its default value includes [
    ".js",
    ".vue",
    ".html",
    ".jsx",
    ".css",
    ".ts",
    ".tsx",
    ".json",
    ".xml",
    ".less",
    ".sass"
  ]`
  );
}


module.exports = getAbsolutePath;
