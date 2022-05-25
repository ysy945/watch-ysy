const watch = require("./lib/index");
const { resolve } = require("path");

// const cancel = watch.watchFileSync(
// "./test.js",
// function (data) {
// console.log(data);
// },
// { monitorTimeChange: true, poll: 1000 }
// );
// setTimeout(() => {
// cancel();
// }, 5000);

watch.watchFile(
  "./test.js",
  function (data) {
    console.log(data);
  },
  { monitorTimeChange: true },
  function (cancel) {
    console.log("111");
    setTimeout(() => {
      cancel();
    }, 5000);
  }
);

// watch.watchDir(
// "./a",
// function (data) {
// console.log(data);
// },
// { monitorTimeChange: true, deep: true, isContent: true },
// function (cancel) {
// setTimeout(() => {
// cancel();
// }, 1000);
// }
// );

// const cancel = watch.watchDirSync(
// "./a",
// function (data) {
// console.log(data);
// },
// { monitorTimeChange: true, deep: false }
// );
// cancel();

// watch.watch(
// ["./a", "./lib"],
// function (data) {
// console.log(data);
// },
// { monitorTimeChange: true, deep: true },
// function (cancel) {
// cancel();
// }
// );

// const cancel = watch.watchSync(
//   ["./a", "./lib"],
//   function (data) {
//     console.log(data);
//   },
//   { monitorTimeChange: true, deep: true }
// );
// cancel();
