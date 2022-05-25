const { readdirSync, statSync } = require("fs");
const { resolve } = require("path");
const { getAbsolutePath, exists } = require("./utils");
const _extensions = require("./extensions");
const watchFileSync = require("./watchFileSync");
const { WatchFileData, WatchDirData } = require("./WatchData");
const { validWatchFileOrDirArguments } = require("./valid");
const findCreateAndRemoveFilePath = require("./utils/findCreateAndRemoveFilePath");
const watchExist = require("./watchExist");
const cancelMonitor = require("./cancelMonitor");
const { INCREASED, REDUCED } = require("./types");
const FileDetail = require("./FileDetail");

/**
 *
 * @param {*} dirPath 文件夹目录
 * @param {*} options 配置项
 * @param {*} callback 回调函数
 */
function watchDirSync(dirPath, changeCallback, options = {}, isRoot = true) {
  validWatchFileOrDirArguments(false, ...arguments);
  options.deep = options.deep || false;
  options.extensions = options.extensions || _extensions;
  options.poll = options.poll || 10;
  //向下传递的参数不需要在验证参数
  const { deep, extensions, poll } = options;
  const context = process.cwd(); //获取当前文件的上下文
  const absolutePath = getAbsolutePath(
    context,
    dirPath,
    extensions, //拓展名
    true /*是文件夹*/
  );
  const dirChildPath = []; //当前监听文件夹下面所有文件的路径
  const watchFileDataArr = []; //存放所有监听文件的信息和取消监听方法
  const watchDirDataArr = []; //存放所有监听目录的信息和取消监听方法
  let _cancelWatchFileCreateAndRemove;
  let _cancelWatchTarget;
  //取消所有文件的监听
  function cancelWatchDir() {
    [...watchFileDataArr].forEach((watchFileObj, index) => {
      watchFileObj.cancelWatch(watchFileDataArr, index);
    });
    [...watchDirDataArr].forEach((watchDirObj, index) => {
      watchDirObj.cancelWatch(watchDirDataArr, index);
    });
    _cancelWatchFileCreateAndRemove();
    if (isRoot) _cancelWatchTarget();
  }
  //如果文件夹存在的话
  if (exists(absolutePath)) {
    if (isRoot)
      watchExist(
        absolutePath,
        () => {},
        () => {
          changeCallback({
            absolutePath,
            message: `The directory in '${absolutePath}' has already been deleted`,
            type: REDUCED,
          });
          cancelWatchDir();
        },
        absolutePath,
        options,
        (cancel) => (_cancelWatchTarget = cancel)
      );
    const files = readdirSync(absolutePath);
    files.forEach((filename) => {
      const childAbsolutePath = resolve(absolutePath, filename);
      dirChildPath.push(childAbsolutePath);
      //需要深度处理
      if (deep) {
        //这是一个文件夹
        if (statSync(childAbsolutePath).isDirectory()) {
          const cancel = watchDirSync(
            childAbsolutePath,
            changeCallback,
            options,
            false
          );
          watchDirDataArr.push(new WatchDirData(childAbsolutePath, cancel));
        }
        //这是一个文件
        else {
          const cancel = watchFileSync(
            childAbsolutePath,
            changeCallback,
            options
          );
          watchFileDataArr.push(new WatchFileData(childAbsolutePath, cancel));
        }
      }
      //不需要深度处理
      else {
        //跳过文件夹
        if (statSync(childAbsolutePath).isFile()) {
          const cancel = watchFileSync(
            childAbsolutePath,
            changeCallback,
            options
          );
          watchFileDataArr.push(new WatchFileData(childAbsolutePath, cancel));
        } else {
          watchExist(
            childAbsolutePath,
            changeCallback,
            () => {},
            absolutePath,
            options
          );
        }
      }
      // console.log(watchFileDataArr, watchDirDataArr, dirChildPath);
    });
    _cancelWatchFileCreateAndRemove = watchFileCreateAndRemove(
      1000 / poll,
      absolutePath,
      watchFileDataArr,
      watchDirDataArr,
      dirChildPath,
      changeCallback,
      options
    );
    return cancelWatchDir;
    //监听文件的增加和删除
  } else {
    throw new Error(`Can not find directory from '${absolutePath}'`);
  }
}

function watchFileCreateAndRemove(
  eachTime,
  dirPath,
  watchFileDataArr,
  watchDirDataArr,
  currentDirPath,
  changeCallback,
  options
) {
  let curDirPath = currentDirPath;
  let nextDirPath;
  let next = function () {
    try {
      const filesName = readdirSync(dirPath);
      setTimeout(() => {
        nextDirPath = filesName.map((fileName) => resolve(dirPath, fileName));
        //找出增加和删除的文件目录`
        const createAndRemoveFilesPath = findCreateAndRemoveFilePath(
          curDirPath,
          nextDirPath
        );
        //如果没有增加和删除的文件目录
        curDirPath = nextDirPath;
        if (createAndRemoveFilesPath.length === 0) next && next();
        createAndRemoveFilesPath.forEach((pathObj) => {
          const absolutePath = pathObj.path;

          //如果是增加了文件就增加监听
          try {
            const stats = statSync(absolutePath);
            if (pathObj.type === INCREASED) {
              if (stats.isDirectory()) {
                //如果开启了深度监视 则递归监视文件夹
                if (options.deep === true) {
                  const cancel = watchDirSync(
                    absolutePath,
                    changeCallback,
                    options,
                    false
                  );
                  watchDirDataArr.push(new WatchDirData(absolutePath, cancel));
                }
                //没有开启深度监视则将这个文件夹当做为一个文件持续判断是否存在即可
                else {
                  watchExist(
                    absolutePath,
                    changeCallback,
                    () => {},
                    dirPath,
                    options
                  );
                }
              } else if (stats.isFile()) {
                const cancel = watchFileSync(
                  absolutePath,
                  changeCallback,
                  options
                );
                watchFileDataArr.push(new WatchFileData(absolutePath, cancel));
              }
              changeCallback(
                new FileDetail(
                  null,
                  absolutePath,
                  null,
                  INCREASED,
                  options.isContent,
                  options.isStats
                )
              );
            }
            //如果是减少了文件就取消监听
            else if (pathObj.type === REDUCED) {
              cancelMonitor(
                absolutePath,
                watchDirDataArr,
                watchFileDataArr,
                options,
                next,
                changeCallback
              );
            }
          } catch (err) {
            if (err) {
              cancelMonitor(
                absolutePath,
                watchDirDataArr,
                watchFileDataArr,
                options,
                next,
                changeCallback
              );
            }
            next && next();
          }
          next && next();
        });
      }, eachTime);
    } catch (err) {
      if (err) return;
    }
  };
  next();
  return function () {
    next = null;
  };
}

module.exports = watchDirSync;
