const getAbsolutePath = require("./getAbsolutePath");
const exists = require("./exists");
const getHash = require("./getHash");
const { readFilePromise, readFile } = require("./readFile");
const checkType = require("./checkType");

const utils = {
  getAbsolutePath,
  exists,
  getHash,
  readFilePromise,
  readFile,
  ...checkType,
};

module.exports = utils;
