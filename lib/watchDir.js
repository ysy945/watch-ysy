const { readdir, statSync, stat } = require("fs");
const { resolve } = require("path");
const { getAbsolutePath, exists } = require("./utils");
const _extensions = require("./extensions");
const watchFile = require("./watchFile");
const watchExist = require("./watchExist");
const { WatchFileData, WatchDirData } = require("./WatchData");
const { validWatchFileOrDirArguments } = require("./valid");
const FileDetail = require("./FileDetail");
const findCreateAndRemoveFilePath = require("./utils/findCreateAndRemoveFilePath");
const cancelMonitor = require("./cancelMonitor");
const { INCREASED, REDUCED } = require("./types");
/**
 *
 * @param {*} dirPath 文件夹目录
 * @param {*} options 配置项
 * @param {*} callback 回调函数
 */
function watchDir(
  dirPath,
  changeCallback,
  options = {},
  resultCallback = () => {},
  isRoot = true
) {
  validWatchFileOrDirArguments(false, ...arguments);
  options.deep = options.deep || false;
  options.extensions = options.extensions || _extensions;
  options.poll = options.poll || 10;
  const { deep, extensions, poll } = options;
  // const context = process.cwd(); //获取当前文件的上下文
  const absolutePath = getAbsolutePath(
    dirPath,
    extensions, //拓展名
  );
  const dirChildPath = []; //当前监听文件夹下面所有文件的路径
  const watchFileDataArr = []; //存放所有监听文件的信息和取消监听方法
  const watchDirDataArr = []; //存放所有监听目录的信息和取消监听方法
  let hasFinishCount = 0; //监听完成个数
  let _cancelWatchCreateAndRemove; //移除监听创建和删除文件的函数
  let _cancelWatchTarget; //移除监听监视文件夹本身
  let _files; //当前路径下所有文件路径
  //取消所有文件的监听
  function cancelWatchDir() {
    [...watchFileDataArr].forEach((watchFileObj, index) => {
      watchFileObj.cancelWatch(watchFileDataArr, index);
    });
    [...watchDirDataArr].forEach((watchDirObj, index) => {
      watchDirObj.cancelWatch(watchDirDataArr, index);
    });
    _cancelWatchCreateAndRemove();
    //只有是根节点才调用
    if (isRoot) _cancelWatchTarget();
  }
  const _resultCallback = function (maxCount) {
    if (++hasFinishCount === maxCount) {
      return resultCallback(cancelWatchDir);
    }
  };

  //如果文件夹存在的话
  if (exists(absolutePath)) {
    if (isRoot)
      watchExist(
        absolutePath,
        () => {},
        () => {
          cancelWatchDir();
          changeCallback({
            absolutePath,
            message: `The directory in '${absolutePath}' has already been deleted`,
            type: REDUCED,
          });
        },
        absolutePath,
        options,
        (cancel) => (_cancelWatchTarget = cancel)
      );
    readdir(absolutePath, { encoding: "utf-8" }, (err, files) => {
      _files = files;
      files.forEach((filename) => {
        const childAbsolutePath = resolve(absolutePath, filename);
        dirChildPath.push(childAbsolutePath);
        //需要深度处理
        if (deep) {
          //这是一个文件夹
          if (statSync(childAbsolutePath).isDirectory()) {
            watchDir(
              childAbsolutePath,
              changeCallback,
              options,
              function (cancel) {
                watchDirDataArr.push(
                  new WatchDirData(childAbsolutePath, cancel)
                );
                _resultCallback(files.length + 1, cancelWatchDir);
              },
              false
            );
          }
          //这是一个文件
          else {
            watchFile(
              childAbsolutePath,
              changeCallback,
              options,
              function (cancelWatchFile) {
                watchFileDataArr.push(
                  new WatchFileData(childAbsolutePath, cancelWatchFile)
                );
                _resultCallback(files.length + 1, cancelWatchDir);
              }
            );
          }
        }
        //不需要深度处理
        else {
          //跳过文件夹
          if (statSync(childAbsolutePath).isFile()) {
            watchFile(
              childAbsolutePath,
              changeCallback,
              options,
              function (cancelWatchFile) {
                watchFileDataArr.push(
                  new WatchFileData(childAbsolutePath, cancelWatchFile)
                );
                _resultCallback(files.length + 1, cancelWatchDir);
              }
            );
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
      });
      // 监听文件的增加和删除;
      _cancelWatchCreateAndRemove = watchFileCreateAndRemove(
        1000 / poll,
        absolutePath,
        watchFileDataArr,
        watchDirDataArr,
        dirChildPath,
        changeCallback,
        options
      );
      _resultCallback(_files.length + 1, cancelWatchDir);
    });
  } else {
    throw new Error(`Can not find directory from '${absolutePath}'`);
  }
}

/**
 *监听文件的删除与创建
 * @param {*} eachTime //执行间隔时间
 * @param {*} absolutePath 监听的文件夹路径
 * @param {*} watchFileDataArr 监听文件的信息数组
 * @param {*} currentDirPath //当前文件夹中的所有文件路径
 */
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
    setTimeout(() => {
      readdir(dirPath, (err, filesName) => {
        if (err) return;
        nextDirPath = filesName.map((fileName) => resolve(dirPath, fileName));
        //找出增加和删除的文件目录`
        const createAndRemoveFilesPath = findCreateAndRemoveFilePath(
          curDirPath,
          nextDirPath
        );
        //如果没有增加和删除的文件目录
        curDirPath = nextDirPath;
        if (createAndRemoveFilesPath.length === 0) next && next();
        function push(arr, _class, path) {
          return function (cancel) {
            arr.push(new _class(path, cancel));
          };
        }
        createAndRemoveFilesPath.forEach((pathObj) => {
          const absolutePath = pathObj.path;

          stat(absolutePath, (err, stats) => {
            //如果是减少了文件就取消监听
            if (err || pathObj.type === REDUCED) {
              cancelMonitor(
                absolutePath,
                watchDirDataArr,
                watchFileDataArr,
                options,
                next,
                changeCallback
              );
            }
            //如果是增加了文件就增加监听
            else if (pathObj.type === INCREASED) {
              if (stats.isDirectory()) {
                //如果开启了深度监视 则递归监视文件夹
                if (options.deep === true) {
                  watchDir(
                    absolutePath,
                    changeCallback,
                    options,
                    push(watchDirDataArr, WatchDirData, absolutePath),
                    false
                  );
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
                watchFile(
                  absolutePath,
                  changeCallback,
                  options,
                  push(watchFileDataArr, WatchFileData, absolutePath)
                );
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
            next && next();
          });
        });
      });
    }, eachTime);
  };
  next();
  return function () {
    next = null;
  };
}

module.exports = watchDir;
