class WatchFileData {
  constructor(filePath, cancelWatch) {
    this.filePath = filePath;
    this.cancelWatch = function (arr, index) {
      cancelWatch();
      arr.splice(index, 1);
    };
  }
}

class WatchDirData {
  constructor(filePath, cancelWatch) {
    this.filePath = filePath;
    this.cancelWatch = function (arr, index) {
      cancelWatch();
      arr.splice(index, 1);
    };
  }
}

module.exports = { WatchFileData, WatchDirData };
