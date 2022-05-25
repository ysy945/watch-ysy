const fs = require("fs");
const { relative, dirname, extname } = require("path");
class FileDetail {
  constructor(hash, path, content, type, isContent, isStats) {
    this.type = type; //本次修改文件的类型CHANGE(改变) INCREASED(增加) REDUCED(减少)
    this.hash = hash; //文件的hash值
    this.absolutePath = path; //绝对路径
    this.filename = this.getFilename(); //文件名
    this.extname = extname(this.filename); //文件后缀
    this.relativePath = ".\\" + relative(process.cwd(), this.absolutePath); //相对于工作目录的路径
    this.stats = this.getStatsSync(); //文件的stats对象信息
    this.isFile = this.stats.isFile(); //是否是文件
    this.isDirectory = this.stats.isDirectory(); //是否是文件夹
    this.size = this.stats.size; //文件的大小
    this.parentPath = dirname(this.absolutePath); //文件的父路径
    isContent && (this.content = content); //文件内容
    !isStats && (this.stats = null);
  }
  getStats(callback) {
    fs.stat(this.absolutePath, (err, stats) => {
      this.stats = stats;
      callback(err, stats);
    });
  }
  getStatsSync() {
    return fs.statSync(this.absolutePath);
  }
  getFilename() {
    const pathArr = this.absolutePath.split("\\");
    return pathArr[pathArr.length - 1];
  }
}

module.exports = FileDetail;
