const { stat } = require("fs");
const { exists, getAbsolutePath, readFilePromise } = require("./utils");
const _extensions = require("./extensions");
const { getHash } = require("./utils");
const FileDetail = require("./FileDetail");
const { validWatchFileOrDirArguments } = require("./valid");
const { CHANGE } = require("./types");
/**
 *
 * @param {*} filePath 监听单个文件的路径
 * @param {*} changeCallback 文件变化的回调函数
 * @param {*} options {poll,isContent}监听的选项
 * @param {*} resultCallback //取消监听的回调函数
 */
function watchFile(
  filePath,
  changeCallback,
  options = {},
  resultCallback = () => {}
) {
  validWatchFileOrDirArguments(true, ...arguments);
  const context = process.cwd(); //获取当前文件的上下文
  const {
    poll = 10, //用于标识每秒询问多少次 默认值为10
    isContent = false, //用于标识回调函数得参数中是否包含文件内容content
    isStats = false, //用于表示是否需要Stats属性
    monitorTimeChange = false,
    extensions = _extensions,
  } = options;
  const absolutePath = getAbsolutePath(context, filePath, extensions);
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
          CHANGE, //本次修改的类型
          isContent, //是否需要content属性
          isStats //是否需要Stats属性
        );

        changeCallback(fileDetail);
      };
      function read(absolutePath) {
        return function () {
          return readFilePromise(absolutePath);
        };
      }
      runPromises(read(absolutePath), eachTime, finalCallback, resultCallback);
    }
    //监听修改文件的时间
    else if (monitorTimeChange === true) {
      compareModificationTime(
        { eachTime, isContent, isStats },
        absolutePath,
        changeCallback,
        resultCallback
      );
    }
  }
  //如果找不到文件的话就报错
  else {
    throw new Error(`Can not find file from '${absolutePath}'`);
  }
}

//对比修改时间函数
function compareModificationTime(
  { eachTime, isContent, isStats },
  absolutePath,
  changeCallback,
  resultCallback
) {
  let currentStats;
  let nextStats;

  stat(absolutePath, (err, stats) => {
    currentStats = stats;
    next && next();
  });
  let next = function () {
    setTimeout(() => {
      stat(absolutePath, (err, stats) => {
        if (err) return;
        nextStats = stats;
        //修改了文件
        if (currentStats.mtimeMs !== nextStats.mtimeMs) {
          const fileDetail = new FileDetail(
            null, //文件得hash值
            absolutePath, //文件得绝对路径
            null, //文件的内容
            CHANGE, //本此修改的类型
            isContent, //是否需要content属性
            isStats //是否需要Stats属性
          );
          changeCallback(fileDetail);
        }
        currentStats = nextStats;
        next && next();
      });
    }, eachTime);
  };
  function cancel() {
    next = null;
  }
  resultCallback(cancel);
}

function runPromises(read, eachTime, changeCallback, resultCallback) {
  const fileData = [];
  let currentIndex = 0;
  let nextIndex = 1;
  let next = function () {
    const promise = read();
    promise.then((content) => {
      setTimeout(() => {
        fileData.push({ hash: getHash(content), content });
        //hash值不同需要调用回调函数
        if (
          fileData.length >= 2 &&
          fileData[currentIndex++].hash !== fileData[nextIndex++].hash
        ) {
          changeCallback(fileData[currentIndex]);
        }
        next && next();
      }, eachTime);
    });
  };
  next();
  //不在执行next函数
  function cancel() {
    next = null;
  }
  resultCallback(cancel);
}

module.exports = watchFile;
