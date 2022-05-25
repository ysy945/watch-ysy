const fs = require("fs");

function readFile(path, callback) {
  const readStream = fs.createReadStream(path);
  const chunks = [];
  readStream.on("data", (chunk) => {
    chunks.push(chunk);
  });
  readStream.on("end", () => {
    const result = Buffer.concat(chunks).toString();
    callback(result, null);
  });
  readStream.on("error", (err) => {
    callback(null, err);
  });
}

function readFilePromise(path) {
  const readStream = fs.createReadStream(path);
  const chunks = [];
  readStream.on("data", (chunk) => {
    chunks.push(chunk);
  });
  return new Promise((resolve, reject) => {
    readStream.on("end", () => {
      const result = Buffer.concat(chunks).toString();
      resolve(result);
    });
    readStream.on("error", (err) => {
      reject(err);
    });
  });
}

module.exports = {
  readFile,
  readFilePromise,
};
