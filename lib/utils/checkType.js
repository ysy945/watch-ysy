function createCheckTypeFunction(type) {
  return function (value) {
    return value && value.constructor === type;
  };
}

const typeArr = [
  "isNumber",
  "isString",
  "isFunction",
  "isBoolean",
  "isArray",
  "isObject",
];

const is = (function (typeArr) {
  return typeArr.reduce((pre, cur) => {
    pre[cur] = createCheckTypeFunction(
      new Function(`return ${cur.slice(2, cur.length)}`)()
    );
    return pre;
  }, {});
})(typeArr);

module.exports = {
  isUndefined(value) {
    return value === undefined;
  },
  isNull(value) {
    return value === Null;
  },
  ...is,
};
