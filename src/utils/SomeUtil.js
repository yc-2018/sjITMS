/**
 * js 分组 判断是否包含相同行
 * @param {*} array 对象数组
 * @param {*} f 匿名函数 返回对象的某个指定属性的属性值并存放在数组中
 */
export function groupBy(array, f) {
  const groups = {};
  array.forEach(function(i) {
    const group = JSON.stringify(f(i));
    groups[group] = groups[group] || [];
    groups[group].push(i);
  });

  return Object.keys(groups).map(function(group) {
    return groups[group];
  });
}
//判断b数组是否全部在a数组内
export function isContained(a, b) {
  // a和b其中一个不是数组，直接返回false
  if (!(a instanceof Array) || !(b instanceof Array)) return false;
  const len = b.length;
  // a的长度小于b的长度，直接返回false
  if (a.length < len) return false;
  for (let i = 0; i < len; i++) {
    // 遍历b中的元素，遇到a没有包含某个元素的，直接返回false
    if (!a.includes(b[i])) return false;
  }
  // 遍历结束，返回true
  return true;
}

/**
 * 深拷贝对象
 * @param {} obj
 * @returns
 */
export function shencopy(obj) {
  if (typeof obj !== 'object') {
    return obj;
  }
  var res = Array.isArray(obj) ? [] : {};
  for (let i in obj) {
    res[i] = shencopy(obj[i]);
  }
  return res;
}

export function isJSON(str) {
  if (typeof str == 'string') {
    try {
      var obj = JSON.parse(str);
      if (typeof obj == 'object' && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
}
