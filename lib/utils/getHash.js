const crypto = require("crypto");

function getHash(content) {
  const fsHash = crypto.createHash("md5");
  fsHash.update(content);
  return fsHash.digest("hex");
}

module.exports = getHash;
