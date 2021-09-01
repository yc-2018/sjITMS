import fetch from 'dva/fetch';
import { notification, message } from 'antd';
import router from 'umi/router';
import hash from 'hash.js';
import { isAntdPro } from './utils';
import { getLocale } from 'umi/locale';
import { decode } from 'jsonwebtoken';
import configs from './config';
import { setAuthority } from './authority';
import {cacheLoginKey, loginKey} from './LoginContext';
import {LOGIN_JWT_KEY} from './constants';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

const localMap = {
  'zh-CN': 'zh_CN',
  'zh-TW': 'zh_TW',
  'en-US': 'en_US',
};

const checkStatus = response => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error();
  error.response = response;
  error.name = response.status;
  throw error;
};

function cacheLogin(response) {

  const authorization = response.headers.get(LOGIN_JWT_KEY);
  if (!authorization || authorization === loginKey()) {
    return response;
  }

  cacheLoginKey(authorization);

  return response;
}

const cachedSave = (response, hashcode) => {
  /**
   * Clone a response data and store it in sessionStorage
   * Does not support data other than json, Cache only json
   */
  const contentType = response.headers.get('Content-Type');
  if (contentType && contentType.match(/application\/json/i)) {
    // All data is saved as text
    response
      .clone()
      .text()
      .then(content => {
        sessionStorage.setItem(hashcode, content);
        sessionStorage.setItem(`${hashcode}:timestamp`, Date.now());
      });
  }
  return response;
};

/**
 * Requests a URL, returning a promise.
 * @param {string} url The URL we want to request
 * @param {object} option he options we want to pass to "fetch"
 * @param {object} ingoreTimeOut 是否忽略超时比较 传值则忽略
 * @return {object}       An object containing either "data" or "err"
 */
export default function request(url, option,ingoreTimeOut) {
  url = configs[API_ENV].API_SERVER + url;
  if (url.indexOf('?') > -1) url = url + '&lang=' + localMap[getLocale()];
  else url = url + '?lang=' + localMap[getLocale()];

  const options = {
    expirys: isAntdPro(),
    ...option,
  };
  /**
   * Produce fingerprints based on url and parameters
   * Maybe url has the same parameters
   */
  const fingerprint = url + (options.body ? JSON.stringify(options.body) : '');
  const hashcode = hash
    .sha256()
    .update(fingerprint)
    .digest('hex');

  const defaultOptions = {
    credentials: 'include',
  };
  const newOptions = { ...defaultOptions, ...options };
  if (
    newOptions.method === 'POST' ||
    newOptions.method === 'PUT' ||
    newOptions.method === 'DELETE'
  ) {
    if (!(newOptions.body instanceof FormData)) {
      newOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        ...newOptions.headers,
        iwmsJwt: loginKey(),
      };
      newOptions.body = JSON.stringify(newOptions.body);
    } else {
      // newOptions.body is FormData
      newOptions.headers = {
        Accept: 'application/json',
        ...newOptions.headers,
        iwmsJwt: loginKey(),
      };
    }
  } else {
    newOptions.headers = {
      iwmsJwt: loginKey(),
      ...newOptions.headers,
    };
  }

  const expirys = options.expirys && 60;
  // options.expirys !== false, return the cache,
  if (options.expirys !== false) {
    const cached = sessionStorage.getItem(hashcode);
    const whenCached = sessionStorage.getItem(`${hashcode}:timestamp`);
    if (cached !== null && whenCached !== null) {
      const age = (Date.now() - whenCached) / 1000;
      if (age < expirys) {
        const response = new Response(new Blob([cached]));
        return response.json();
      }
      sessionStorage.removeItem(hashcode);
      sessionStorage.removeItem(`${hashcode}:timestamp`);
    }
  }
  const controller = new AbortController()
  const signal = controller.signal

  if(!navigator.onLine){
    message.error('当前网络不可用');
    controller.abort();
    return {
      'error':'no network'
    };
  }
  
  return Promise.race([
    fetch(url, newOptions,{ signal })
    .then(checkStatus)
    .then(cacheLogin)
    .then(response => cachedSave(response, hashcode)),
      
      new Promise(function(resolve,reject){  //60秒后执行，如果后端接口没有返回，则直接返回timeout
        if(!ingoreTimeOut && url.indexOf('iwms-report') < 0){
          setTimeout(()=> reject('timeout'),60000)
        }
      })
  ]).then(response => {
    const res = response.json();
    res.then(body => {
      if (body && !body.success && (!localStorage.getItem("showMessage") || localStorage.getItem("showMessage") === '1')) {
        message.error(body.message);
      }
    });
    return res;
  })
  .catch(e => {
    if(!navigator.onLine){
      message.error('当前网络不可用')
      controller.abort();
      return {
        'error':'no network'
      };
    }
    if(e =='timeout'){
      message.error('请求超时')
      controller.abort();
      return {
        'error':'timeout'
      };
    }else{
      const status = e.name;
      if (status === 401) {
        window.g_app._store.dispatch({
          type: 'login/logout',
        });
        message.error("登录信息失效，请重新登录！");
        return e.response.json();
      }
      const res = e.response.json();
      res.then(result => {
          if (!localStorage.getItem("showMessage") || localStorage.getItem("showMessage") === '1') {
            message.error(result.message);
          }
      });
      return res;
    }
  });
}
