import { setAuthority } from './authority';
import jwtDecode from 'jwt-decode';
import localforage from 'localforage';
import { Modal } from 'antd';
import { saveUserLog } from '@/services/quick/Quick';
import configs from '@/utils/config';

const { warning } = Modal;

const cache = {}; // idb下所有的 存储信息
const pageFilterKeys = [];

let loginOutTime = null; //定时器

export function iterateAllData(callback) {
  localforage
    .iterate(function(value, key, iterationNumber) {
      // 查询全部的存储信息 并赋值
      cache[key] = value;
    })
    .then(function() {
      if (callback) callback();
    })
    .catch(function(err) {
      // 当出错时，此处代码运行
      console.log(err);
    });
}
export function loginOrg() {
  let org = JSON.parse(localStorage.getItem(window.location.hostname + '-org'));
  if (!org) {
    return { uuid: '', code: '', name: '' };
  }
  return org;
}
export function loginUser() {
  let user = JSON.parse(localStorage.getItem(window.location.hostname + '-user'));
  if (!user) {
    return { uuid: '', code: '', name: '' };
  }
  return user;
}

export function loginCompany() {
  let company = JSON.parse(localStorage.getItem(window.location.hostname + '-company'));
  if (!company) {
    return { uuid: '', code: '', name: '' };
  }
  return company;
}
export function getDefOwner() {
  return JSON.parse(localStorage.getItem(window.location.hostname + '-owner'));
}
export function getQueryBillDays() {
  return localStorage.getItem(window.location.hostname + '-queryBillDays');
}
export function cacheLogin(loginContext) {
  setAuthority(loginContext.resources);
  localStorage.setItem(
    window.location.hostname + '-user',
    JSON.stringify({
      uuid: loginContext.userUuid,
      code: loginContext.userCode,
      name: loginContext.userName,
      phone: loginContext.userPhone,
      avatar: loginContext.userAvatar,
      resources: loginContext.resources,
      rolesOrg: loginContext.rolesOrg,
    })
  );
  localStorage.setItem(
    window.location.hostname + '-company',
    JSON.stringify({
      uuid: loginContext.companyUuid,
      code: loginContext.companyCode,
      name: loginContext.companyName,
    })
  );
  localStorage.setItem(
    window.location.hostname + '-org',
    JSON.stringify({
      uuid: loginContext.orgUuid,
      code: loginContext.orgCode,
      name: loginContext.orgName,
      type: loginContext.orgType,
    })
  );
  let ip = {
    accountIp: loginContext.accountIp,
    basicIp: loginContext.basicIp,
    facilityIp: loginContext.facilityIp,
    openApiIp: loginContext.openApiIp,
  };
  localforage.setItem(window.location.hostname + '-ip', ip);
  localStorage.setItem(window.location.hostname + '-loginId', loginContext.uuid);
}

export function cacheTableColumns(key, value) {
  let user = {};
  if (loginUser()) {
    user = loginUser();
  }
  localforage.setItem(window.location.hostname + user.uuid + '-' + key, JSON.stringify(value));
  cache[window.location.hostname + user.uuid + '-' + key] = value;
}

export function getTableColumns(key) {
  let user = {};
  if (loginUser()) {
    user = loginUser();
  }
  return cache[window.location.hostname + user.uuid + '-' + key];
}

export function removeTableColumns(key) {
  let user = {};
  if (loginUser()) {
    user = loginUser();
  }
  const cacheKey = window.location.hostname + user.uuid + '-' + key;
  localforage.removeItem(cacheKey);
  delete cache[cacheKey];
}

export function cacheResourceDescription(helpInfos) {
  if (isNotEmpty(helpInfos)) {
    let user = {};
    if (loginUser()) {
      user = loginUser();
    }
    for (let i = 0; i < helpInfos.length; i++) {
      const helpInfo = helpInfos[i];
      // if (isNotEmpty(helpInfo.))
      localforage.setItem(
        window.location.hostname + user.uuid + '-rk-' + helpInfo.resourceKey,
        helpInfo.description
      );
      cache[window.location.hostname + user.uuid + '-rk-' + helpInfo.resourceKey] =
        helpInfo.description;
    }
  }
}
export function getResourceDescription(key) {
  let user = {};
  if (loginUser()) {
    user = loginUser();
  }
  return cache[window.location.hostname + user.uuid + '-rk-' + key];
}

export function cacheLoginKey(loginKey) {
  localStorage.setItem(window.location.hostname + '-iwmsJwt', loginKey);
  //HD原有token逻辑为 每次请求赋予新的TOKEN 有效期为1小时 因此在最后一次请求后 58分钟不操作时 自动弹出登录过期 并跳转到登录页
  if (loginOutTime != null) {
    clearTimeout(loginOutTime);
  }
  loginOutTime = setTimeout(() => {
    warning({
      title: '登录过期,请重新登录!',
      onOk() {
        window.g_app._store.dispatch({
          type: 'login/logout',
        });
      },
    });
  }, 3480000); //58min  3480000ms

  setTimeout(() => {
    let allBt = document.getElementsByClassName('ant-btn');
    if (allBt && allBt.length > 0) {
      for (let i = 0; i < allBt.length; i++) {
        allBt[i].addEventListener('click', clickLog);
      }
    }
  }, 1000);
  if (loginUser().code) {
    createSseConnect(loginUser().code);
  }
}

function clickLog(btn) {
  let url = btn.target.baseURI;
  var startIndex = url.indexOf('/', url.indexOf('/', url.indexOf('/') + 1) + 1) + 1;
  var path = url.substr(startIndex - 1);
  let param = {
    userName: loginUser().name,
    userCode: loginUser().code,
    path: path,
    clickEvent: btn.target.innerText,
  };
  if (loginUser().code) {
    saveUserLog(param);
  }
}

export function loginKey() {
  return localStorage.getItem(window.location.hostname + '-iwmsJwt');
}
export function loginIp() {
  let ip = cache[window.location.hostname + '-ip'];
  if (!ip) {
    return { accountIp: '', basicIp: '', facilityIp: '', openApiIp: '' };
  }
  return ip;
}

export function getMenuLayout() {
  const user = loginUser();
  if (!user) {
    return 'topmenu';
  }
  const menuLayouts = JSON.parse(localStorage.getItem('menuLayouts'));
  if (!menuLayouts || !menuLayouts[user.uuid]) {
    return 'topmenu';
  }
  return menuLayouts[user.uuid];
}
export function setMenuLayout(layout) {
  let menuLayouts = JSON.parse(localStorage.getItem('menuLayouts'));
  if (!menuLayouts) {
    menuLayouts = {};
  }
  const user = loginUser();
  if (!user) {
    return;
  }
  menuLayouts[user.uuid] = layout;
  localStorage.setItem('menuLayouts', JSON.stringify(menuLayouts));
}
export function setActiveKey(activeKey) {
  sessionStorage.setItem(window.location.hostname + '-activeKey', activeKey);
}
export function getActiveKey() {
  return sessionStorage.getItem(window.location.hostname + '-activeKey');
}
export function clearLogin() {
  sessionStorage.clear();
  localStorage.removeItem(window.location.hostname + '-user');
  localStorage.removeItem(window.location.hostname + '-org');
  localStorage.removeItem(window.location.hostname + '-company');
  localStorage.removeItem(window.location.hostname + '-loginId');
  localStorage.removeItem(window.location.hostname + '-owner');
  localStorage.removeItem(window.location.hostname + '-queryBillDays');
  localStorage.removeItem(window.location.hostname + '-iwmsJwt');
  localforage.removeItem(window.location.hostname + '-ip');
}

export function getExtensionId() {
  return cache['extensionId'];
}

export function getBalanceConfig() {
  return cache['BalanceConfig'];
}

export function setUserBreadcrumb(data) {
  cache['userBreadcrumb'] = data;
}

export function isLogin() {
  const token = loginKey();
  if (!token) {
    return false;
  }

  var jwt = jwtDecode(token);
  let currentTime = new Date().getTime() / 1000;
  if (jwt.exp < currentTime) {
    return false;
  }

  return true;
}

export function getUserBreadcrumb() {
  return cache['userBreadcrumb'];
}

export function getAuthorityInfo() {
  return cache['antd-pro-authority'];
}

export function getSearchMenus() {
  return cache[window.location.hostname + '-searchMenu'];
}

export function setCollectData(data) {
  cache['collectData'] = data;
}

export function getPageFilter(key) {
  const prefix = 'pageFilter' + window.location.hostname;
  return cache[prefix + key];
}

export function setPageFilter(key, value) {
  const prefix = 'pageFilter' + window.location.hostname;
  cache[prefix + key] = value;
  if (pageFilterKeys.indexOf(prefix + key) == -1) {
    pageFilterKeys.push(prefix + key);
  }
}

export function clearPageFilter() {
  for (let i = 0; i < pageFilterKeys.length; i++) {
    delete cache[pageFilterKeys[i]];
  }
}

export function getCollectData() {
  return cache['collectData'];
}

let eventSource;
// 建立连接
const createSseConnect = clientId => {
  if (window.EventSource && !eventSource) {
    //ZUUL 不支持 SSE
    // let url =
    //   configs[API_ENV].API_SERVER.substring(0, configs[API_ENV].API_SERVER.lastIndexOf(':')) +
    //   ':8092/itms-schedule/sse/createSseConnect?clientId=' +
    //   clientId;
    // eventSource = new EventSource(new URL(url));
    // console.log(eventSource);
    // eventSource.onmessage = event => {
    //   console.log('onmessage:' + clientId + ': ' + event.data);
    //   if (event.data) {
    //     console.log('event.data', event.data);
    //     let message = JSON.parse(event.data);
    //     warning({
    //       title: message.sendTitle,
    //       content: message.sendMessage,
    //     });
    //   }
    // };
    // eventSource.onopen = event => {
    //   console.log('onopen:' + clientId + ': ' + event);
    // };
    // eventSource.onerror = event => {
    //   console.log('onerror :' + clientId + ': ' + event);
    // };
    // eventSource.close = event => {
    //   console.log('close :' + clientId + ': ' + event);
    // };
  } else {
    if (!window.EventSource) {
      console.log('你的浏览器不支持SSE~');
    } else {
      console.log('eventSource', eventSource);
    }
  }
  console.log(
    process.env.REACT_APP_ADDRESS_IP +
      ':8092/itms-schedule/sse/createSseConnect?clientId=' +
      clientId
  );
};
