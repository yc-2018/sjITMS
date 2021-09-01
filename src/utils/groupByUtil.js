
/**
 * js 分组 判断是否包含相同行
 * @param {*} array 对象数组
 * @param {*} f 匿名函数 返回对象的某个指定属性的属性值并存放在数组中
 */
export function groupBy(array, f) {
  const groups = {};
  array.forEach(function (i) {
    const group = JSON.stringify(f(i));
    groups[group] = groups[group] || [];
    groups[group].push(i);
  });

  return Object.keys(groups).map(function (group) {
    return groups[group];
  });
}