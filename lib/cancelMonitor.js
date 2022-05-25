const { REDUCED } = require("./types");
function cancelMonitor(
  absolutePath,
  watchDirDataArr,
  watchFileDataArr,
  options,
  next,
  changeCallback
) {
  const { deep } = options;
  let index;
  //如果在watchDirDataArr中找到了说明之前是文件夹
  if (deep) {
    index = watchDirDataArr.findIndex(
      (value) => value.filePath === absolutePath
    );
  }
  if (index !== -1 && deep === true) {
    watchDirDataArr[index].cancelWatch(watchDirDataArr, index);
  }
  //说明删除的是一个文件
  else {
    index = watchFileDataArr.findIndex(
      (value) => value.filePath === absolutePath
    );
    if (index === -1) return next && next();
    //执行取消函数
    watchFileDataArr[index].cancelWatch(watchFileDataArr, index);
  }

  changeCallback({ type: REDUCED, absolutePath });
}

module.exports = cancelMonitor;
