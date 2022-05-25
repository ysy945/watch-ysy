const { getAbsolutePath } = require("./utils");
const { REDUCED } = require("./types");
const { stat, existsSync } = require("fs");

function watchExist(
  filePath,
  deleteChildCallback,
  deleteTargetCallback,
  dirPath,
  options,
  resultCallback = () => {}
) {
  const { poll = 10 } = options;
  const absolutePath = getAbsolutePath( filePath, []);
  RoundListening(
    absolutePath,
    1000 / poll,
    deleteChildCallback,
    deleteTargetCallback,
    dirPath,
    resultCallback
  );
}

function RoundListening(
  absolutePath,
  eachTime,
  deleteChildCallback,
  deleteTargetCallback,
  dirPath,
  resultCallback
) {
  let next = function () {
    setTimeout(() => {
      stat(absolutePath, (err, stats) => {
        //说明这个文件夹被删除了
        if (err) {
          if (existsSync(dirPath)) {
            return deleteChildCallback({
              type: REDUCED,
              absolutePath,
            });
          }
          return deleteTargetCallback();
        }
        next && next();
      });
    }, eachTime);
  };
  next();
  function cancel() {
    next = null;
  }
  resultCallback(cancel);
}

module.exports = watchExist;
