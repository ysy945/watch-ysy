const utils = require("./utils");
const watchFileSync = require("./watchFileSync");
const watchFile = require("./watchFile");
const watchDir = require("./watchDir");
const watchDirSync = require("./watchDirSync");
const watch = require("./watch");
const watchSync = require("./watchSync");
const types = require("./types");

const watchAPI = {
  ...utils,
  watchFileSync,
  watchFile,
  watchDir,
  watchDirSync,
  watch,
  watchSync,
  ...types,
};

module.exports = watchAPI;
