import React from 'react';
import PromiseRender from './PromiseRender';
import { CURRENT } from './renderAuthorize';
import { loginOrg } from '../../utils/LoginContext';

function isPromise(obj) {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  );
}

/**
 * 通用权限检查方法
 * Common check permissions method
 * @param { 权限判定 Permission judgment type string |array | Promise | Function } authority  待检测的权限
 * @param { 你的权限 Your permission description  type:string} currentAuthority 当前权限数组
 * @param { 通过的组件 Passing components } target
 * @param { 未通过的组件 no pass components } Exception
 */
const checkPermissions = (authority, currentAuthority, target, Exception) => {
  // 没有判定权限.默认查看所有
  // Retirement authority, return target;
  if (!authority) {
    return target;
  }

  if (loginOrg() && loginOrg().type === 'SJWL') {
    return target;
  }

  // 数组处理
  if (Array.isArray(authority)) {
    if (authority.indexOf(currentAuthority) >= 0) {
      return target;
    }
    if (Array.isArray(currentAuthority)) {
      for (let i = 0; i < currentAuthority.length; i += 1) {
        const element = currentAuthority[i];
        for (let i = 0; i < authority.length; i++) {
          if (element === authority[i]) {
            return target;
          }
          if (element.indexOf(authority[i]) >= 0) {
            let char = element.charAt(authority[i].length);
            if (char === '.') {
              return target;
            }
          }
        }
        // 原来的逻辑
        // if (authority.indexOf(element) >= 0) {
        //   return target;
        // }
      }
    }
    return Exception;
  }

  // string 处理
  if (typeof authority === 'string') {
    if (authority === currentAuthority) {
      return target;
    }
    if (Array.isArray(currentAuthority)) {
      for (let i = 0; i < currentAuthority.length; i += 1) {
        const element = currentAuthority[i];

        if (element === authority) {
          return target;
        }
        if (element.indexOf(authority) >= 0) {
          let char = element.charAt(authority.length);
          if (char === '.') {
            return target;
          }
        }

        // 原来的逻辑
        // if (authority === element) {
        //   return target;
        // }
      }
    }
    return Exception;
  }

  // Promise 处理
  if (isPromise(authority)) {
    return <PromiseRender ok={target} error={Exception} promise={authority} />;
  }

  // Function 处理
  if (typeof authority === 'function') {
    try {
      const bool = authority(currentAuthority);
      // 函数执行后返回值是 Promise
      if (isPromise(bool)) {
        return <PromiseRender ok={target} error={Exception} promise={bool} />;
      }
      if (bool) {
        return target;
      }
      return Exception;
    } catch (error) {
      throw error;
    }
  }
  throw new Error('unsupported parameters');
};

export { checkPermissions };

const check = (authority, target, Exception) =>
  checkPermissions(authority, CURRENT, target, Exception);

export default check;
