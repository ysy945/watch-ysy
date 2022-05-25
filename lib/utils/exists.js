const fs = require("fs");
function exists(filePath) {
  return fs.existsSync(filePath);
}
module.exports = exists;
