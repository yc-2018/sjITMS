import moment from 'moment';
import React from 'react';
import nzh from 'nzh/cn';
import { parse, stringify } from 'qs';
import { func } from 'prop-types';
import Empty from '@/pages/Component/Form/Empty';

import ReactDOM from 'react-dom';

/**
 * ReactDOM 不推荐直接向 document.body mount 元素
 * 当 node 不存在时，创建一个 div
 */
export function domRender(reactElem, node) {
  let div;
  if (node) {
    div = typeof node === 'string'
      ? window.document.getElementById(node)
      : node;
  } else {
    div = window.document.createElement('div');
    window.document.body.appendChild(div);
  }
  return ReactDOM.render(reactElem, div);
}

export function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}

export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - day * oneDay;

    return [moment(beginTime), moment(beginTime + (7 * oneDay - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [
      moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`),
      moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000),
    ];
  }

  const year = now.getFullYear();
  return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
}

export function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach(node => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}

export function digitUppercase(n) {
  return nzh.toMoney(n);
}

function getRelation(str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!'); // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1;
  }
  if (arr1.every((item, index) => item === arr2[index])) {
    return 2;
  }
  return 3;
}

function getRenderArr(routes) {
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    // 去重
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    // 是否包含
    const isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  return renderArr;
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
export function getRoutes(path, routerData) {
  let routes = Object.keys(routerData).filter(
    routePath => routePath.indexOf(path) === 0 && routePath !== path
  );
  // Replace path to '' eg. path='user' /user/name => name
  routes = routes.map(item => item.replace(path, ''));
  // Get the route to be rendered to remove the deep rendering
  const renderArr = getRenderArr(routes);
  // Conversion and stitching parameters
  const renderRoutes = renderArr.map(item => {
    const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
    return {
      exact,
      ...routerData[`${path}${item}`],
      key: `${path}${item}`,
      path: `${path}${item}`,
    };
  });
  return renderRoutes;
}

export function getPageQuery() {
  return parse(window.location.href.split('?')[1]);
}

export function getQueryPath(path = '', query = {}) {
  const search = stringify(query);
  if (search.length) {
    return `${path}?${search}`;
  }
  return path;
}

/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export function isUrl(path) {
  return reg.test(path);
}

export function formatWan(val) {
  const v = val * 1;
  if (!v || Number.isNaN(v)) return '';

  let result = val;
  if (val > 10000) {
    result = Math.floor(val / 10000);
    result = (
      <span>
        {result}
        <span
          styles={{
            position: 'relative',
            top: -2,
            fontSize: 14,
            fontStyle: 'normal',
            lineHeight: 20,
            marginLeft: 2,
          }}
        >
          万
        </span>
      </span>
    );
  }
  return result;
}

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export function isAntdPro() {
  return window.location.hostname === 'preview.pro.ant.design';
}

/**
 * 日期处理
 * @param {*} time 时间字符串
 * @param {Boolean} isHHMMSSZero 是否将hhmmss设置为00:00:00
 */
export function formatDate(time, isHHMMSSZero) {
  let date = new Date(time);
  let str =
    date.getFullYear() +
    '-' +
    (date.getMonth() + 1) +
    '-' +
    date.getDate();

  if (isHHMMSSZero) {
    str += ' ' + '00:00:00';
  } else {
    str += ' ' +
      date.getHours() +
      ':' +
      date.getMinutes() +
      ':' +
      date.getSeconds();
  }
  return str;
};

/**
 * 合并两个数组，并去重
 * 
 * @param {Array} arr1 
 * @param {Array} arr2 
 */
export function arrConcat(arr1, arr2) {
  let arr = arr1.concat();
  for (let i = 0; i < arr2.length; i++) {
    if (arr.indexOf(arr2[i]) === -1) {
      arr.push(arr2[i])
    }
  }

  return arr;
}

/**
 * 获取两个数组的差集
 * 
 * @param {Array} arr1 
 * @param {Array} arr2
 */
export function arrDiff(arr1, arr2) {
  return arr1.concat(arr2).filter(function (arg) {
    return !(arr1.indexOf(arg) >= 0 && arr2.indexOf(arg) >= 0);
  });
}

/**
 * 刷新/退出该页面时执行，但页面卸载时不会执行
 * 
 * @param {*} e 
 */
export function confirmLeaveFunc(e) {
  e = e || window.event;
  if (e) {
    e.returnValue = '确定离开？'
  }
  return '确定离开？'
}

export function getArrEqual(arr1, arr2) {
  let newArr = [];
  for (let i = 0; i < arr2.length; i++) {
    if (arr1.indexOf(arr2[i]) >=0) {
      newArr.push(arr2[i]);
    }
  }
  return newArr;
}

/**
 * 字符串分隔符和省略号处理
 * 
 * @param {Array} data  数组数据
 * @param {Integer} count 最大可视数量
 * @param {String} separator 分隔符
 * @param {Boolean} isEllipsis 是否有省略号，true 保留； false 不保留
 * @returns allItems: 代表全部经过分隔符处理过的数据; items: 代表最终显示数据
 */
export function strSeparatorEllipsis(data, count, separator, isEllipsis) {
  let len = data.length;
  if (data && len > 0) {
    let items = '';
    let ellipsis = "...";
    let allItems = '';


    // for-in 出错
    // for (let index in data) {
    //   items += data[index] + separator;
    // }

    data.forEach(i=>{
      items +=i + separator;
    })

    allItems = items = items.substr(0, items.length - 1);
    if (len > count) {
      let arr = items.split(separator);
      let tempItems = '';
      for (let i = 0; i < count; i++) {
        tempItems += arr[i] + separator;
      }
      items = tempItems.substr(0, tempItems.length - 1) + (isEllipsis && ' ' + ellipsis);
    }

    return {
      allItems: allItems,
      items: items,
    }
  } else {
    return {
      allItems: '',
      items: '',
    };
  }
}

/**
 * 生成GUID(Globally Unique Identifier)
 */
export function guid() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

/**
 * 匹配 1*m*n，m和n均为大于0的数
 * 
 * @param {String} 带检测的字符串, 返回true，匹配成功；返回false，匹配失败
 */
export function match1MN(str) {
  var regex = /^1\*((?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,})\*((?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,})$/g

  if (str) {
    if (str.match(regex)) {
      return true;
    }
    return false;
  }

  return false;
}

/**
 * 匹配 m*n，m和n均为大于0的数
 * 
 * @param {String} 带检测的字符串, 返回true，匹配成功；返回false，匹配失败
 */
export function matchMN(str) {
  var regex = /^((?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,})\*((?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,})$/g

  if (str) {
    if (str.match(regex)) {
      return true;
    }
    return false;
  }

  return false;
}

/**
 * UCN -> [code]name
 */
export function convertCodeName(entity) {
  if (entity) {
    let arr = Object.getOwnPropertyNames(entity)
    if (arr.length > 0) {
      let code = entity.code ? entity.code : '';
      let name = entity.name ? entity.name : '';
      return '[' + code + ']' + name;
    } else {
      return '<空>';
    }
  } else {
    return '<空>';
  }

}

/**
 * ArticleDocFields -> [articleCode]articleName
 */
export function convertArticleDocField(article){
  if (article) {
      return '[' + article.articleCode + ']' + article.articleName;
    }
  
    return '';
}

/**
 * entity.qpcStr+"/"+entity.article.munit
 */
export function composeQpcStrAndMunit(entity){
  if(!entity)
    return '';
  if (entity && entity.article &&  entity.article.munit) {
      return entity.qpcStr+"/"+entity.article.munit;
  }
  return entity.qpcStr;
}

/**
 * 转换日期 （YYYY-MM-DD）
 */
export function convertDate(date){
  if(date){
   return moment(date).format('YYYY-MM-DD')
  }

  return '';
}

/**
 * 转换日期 （YYYY-MM-DD HH:mm:ss）
 */
export function convertDateToTime(date){
  if(date){
   return moment(date).format('YYYY-MM-DD HH:mm:ss')
  }
  return <Empty />;
}

export function addressToStr(address) {
  if (address) {
    let str = address.country;
    let province = address.province;
    if (province && province !== '上海' && province !== '重庆' && province !== '天津' && province !== '北京') {
      str = str + province;
    }

    return str + (address.city ? address.city : '') +
      (address.district ? address.district : '') + ((address.street ? address.street : ''));
  }
  return '';
}

export function addressToStr1(address) {
  if (address) {
    const str = address.country;
    const province = address.province;
    return str + province + (address.city ? address.city : '') +
      (address.district ? address.district : '') + ((address.street ? address.street : ''));
  }
  return '';
}

/**
 * 用于检查字符串是否为空、null或未定义
 * 
 * @param {String} str 源字符串
 */
export function isEmpty(str) {
  return (!str || 0 === str.length);
}

export function isNotEmpty(obj) {
  return !isEmpty(obj);
}

/**
 * 用于检查字符串是否为空、空或未定义
 * 
 * @param {String} str 源字符串
 */
export function isBlank(str) {
  return (!str || /^\s*$/.test(str));
}

/**
 * 判断是否为空对象
 * 
 * @param {Object} obj 源对象
 */
export function isEmptyObj(obj) {
  return Object.keys(obj).length == 0;
}

/**
 * 是否为非零正整数
 * 
 * @param {Integer} str 源字符串 
 */
export function isNoNZeroPositiveInteger(str) {
  return (!str || /^[1-9]\d*$/.test(str));
}

/**
 * 是否为正整数
 * 
 * @param {Integer} str 源字符串 
 */
export function isPositiveInteger(str) {
  return (!str || /^[+]{0,1}(\d+)$/.test(str));
}

/**
 * 显示全局提示
 */
export function showMessage() {
  localStorage.setItem("showMessage", "1");
}

/**
 * 异常全局提示
 */
export function hideMessage() {
  localStorage.setItem("showMessage", "0");
}

/**
 * 根据路径表达式获取字符串
 *
 * @param {Object} obj: 对象
 * @param {string|string[]} dataIndexs: 路径表达式
 * @returns {string}: 多个路径表达式平铺字符串join结果
 */
export function getValueByStrPaths(obj, dataIndexs) {
  let ret = '';
  if (dataIndexs instanceof Array) {
    for (let i = 0; i < dataIndexs.length; i ++) {
      let dataIndex = dataIndexs[i];
      let value = getValueByStrPath(obj, dataIndex);
      if (value) {
        ret += value;
      }
    }
    return ret;
  } else {
    return getValueByStrPath(obj, dataIndexs);
  }
}

/**
 * 获取指定对象中的属性平铺字符串
 *
 * @param {Object} obj: 抽取的对象
 * @param {string} str: 路径表达式, 如 article,vendor.code,vendor.name
 * @returns {null|string}: obj/string的平铺字符串
 */
export function getValueByStrPath(obj, str) {
  str = str.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  str = str.replace(/^\./, '');           // strip a leading dot
  let arr = str.split('.');
  for (let i = 0, n = arr.length; i < n; i ++) {
    let key = arr[i];
    if (key in obj) {
      obj = obj[key];
    } else {
      return null;
    }
  }
  return objToString(obj);
}

function objToString (obj) {
  if (obj === null) {
    return '';
  }
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }
  let str = '';
  for (let p in obj) {
    if (p == 'uuid') {
      continue;
    }
    if (obj.hasOwnProperty(p)) {
      str += ':' + obj[p];
    }
  }
  return str.length >= 1 ? str.slice(1) : str;
}

