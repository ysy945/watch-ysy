const { statSync, readFileSync } = require("fs");
const { exists, getAbsolutePath, getHash } = require("./utils");
const _extensions = require("./extensions");
const FileDetail = require("./FileDetail");
const { validWatchFileOrDirSyncArguments } = require("./valid");
const { CHANGE } = require("./types");
const watchExist = require("./watchExist");
/**
 *
 * @param {*} filePath 监听单个文件的路径
 * @param {*} callback 文件变化的回调函数
 * @param {*} options {poll,isContent,isStats,monitorTimeChange}监听的选项
 * @returns {*} cancelWatchFile 返回取消监听的函数
 */
function watchFileSync(filePath, changeCallback, options = {}) {
  validWatchFileOrDirSyncArguments(true, ...arguments);
  //取消的监听的回调函数
  let cancelWatchFile;
  //向下传递的参数不需要在验证参数
  const { extensions = _extensions } = options;
  // const context = process.cwd(); //获取当前文件的上下文
  const {
    poll = 10, //用于标识每秒询问多少次 默认值为10
    isContent = true, //用于标识回调函数得参数中是否包含文件内容content
    isStats = true, //用于表示是否需要Stats属性
    monitorTimeChange = false,
  } = options;

  const absolutePath = getAbsolutePath( filePath, extensions);
  const eachTime = 1000 / poll; //每次轮询的时间
  //如果文件存在的话
  if (exists(absolutePath)) {
    //执行监听逻辑
    if (!monitorTimeChange) {
      //传出回调函数 以及回调函数的参数
      const finalCallback = function (fileData) {
        const fileDetail = new FileDetail(
          fileData.hash, //文件得hash值
          absolutePath, //文件得绝对路径
          fileData.content, //文件的内容
          CHANGE,
          isContent, //是否需要content属性
          isStats //是否需要Stats属性
        );

        changeCallback(fileDetail);
      };
      cancelWatchFile = keepRead(absolutePath, eachTime, finalCallback);
    }
    //监听修改文件的时间
    else if (monitorTimeChange === true) {
      cancelWatchFile = compareModificationTime(
        { eachTime, isContent, isStats },
        absolutePath,
        changeCallback
      );
    }
  }
  //如果找不到文件的话就报错
  else {
    throw new Error(`Can not find file from '${absolutePath}'`);
  }
  return cancelWatchFile;
}

//对比修改时间函数
function compareModificationTime(
  { eachTime, isContent, isStats },
  absolutePath,
  changeCallback
) {
  let currentStats = statSync(absolutePath);
  let nextStats;
  const flag = setInterval(() => {
    try {
      nextStats = statSync(absolutePath);
    } catch (err) {
      return;
    }
    //修改了文件
    if (currentStats.mtimeMs !== nextStats.mtimeMs) {
      const fileDetail = new FileDetail(
        null, //文件得hash值
        absolutePath, //文件得绝对路径
        null, //文件的内容
        CHANGE,
        isContent, //是否需要content属性
        isStats //是否需要Stats属性
      );
      changeCallback(fileDetail);
    }
    currentStats = nextStats;
  }, eachTime);
  return function () {
    //清除定时器
    clearInterval(flag);
  };
}

function keepRead(absolutePath, eachTime, changeCallback) {
  const fileData = [];
  let currentIndex = 0;
  let nextIndex = 1;
  const flag = setInterval(() => {
    const content = readFileSync(absolutePath, "utf-8");
    fileData.push({ hash: getHash(content), content });
    //hash值不同需要调用回调函数
    if (
      fileData.length >= 2 &&
      fileData[currentIndex++].hash !== fileData[nextIndex++].hash
    ) {
      changeCallback(fileData[currentIndex]);
    }
  }, eachTime);
  return function () {
    clearInterval(flag);
  };
}

module.exports = watchFileSync;
