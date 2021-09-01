import { setAuthority } from './authority';
import jwtDecode from 'jwt-decode';
import localforage from 'localforage';
const cache = {}; // idb下所有的 存储信息
const pageFilterKeys = [];
export function iterateAllData(callback) {
  localforage.iterate(function (value, key, iterationNumber) {
    // 查询全部的存储信息 并赋值
    cache[key] = value;
  }).then(function () {
    if (callback) callback();
  }).catch(function (err) {
    // 当出错时，此处代码运行
    console.log(err);
  });
}
export function loginOrg() {
  let org = JSON.parse(localStorage.getItem(window.location.hostname + "-org"));
  if (!org) {
    return {uuid: '', code: '', name: ''};
  }
  return org;
}
export function loginUser() {
  let user = JSON.parse(localStorage.getItem(window.location.hostname + "-user"));
  if (!user) {
    return {uuid: '', code: '', name: ''};
  }
  return user;
}

export function loginCompany() {
  let company = JSON.parse(localStorage.getItem(window.location.hostname + "-company"))
  if (!company) {
    return {uuid: '', code: '', name: ''};
  }
  return company;
}
export function getDefOwner() {
  return JSON.parse(localStorage.getItem(window.location.hostname + "-owner"));
}
export function getQueryBillDays() {
  return localStorage.getItem(window.location.hostname + "-queryBillDays");
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
  localforage.setItem(window.location.hostname + user.uuid+ '-' + key, JSON.stringify(value));
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
      localforage.setItem(window.location.hostname + user.uuid + '-rk-' + helpInfo.resourceKey, helpInfo.description);
      cache[window.location.hostname + user.uuid + '-rk-' + helpInfo.resourceKey] = helpInfo.description;
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
}
export function loginKey() {
  return localStorage.getItem(window.location.hostname + '-iwmsJwt');
}
export function loginIp() {
  let ip = cache[window.location.hostname + "-ip"]
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
  localStorage.removeItem(window.location.hostname + "-user");
  localStorage.removeItem(window.location.hostname + "-org");
  localStorage.removeItem(window.location.hostname + "-company");
  localStorage.removeItem(window.location.hostname + "-loginId");
  localStorage.removeItem(window.location.hostname + "-owner");
  localStorage.removeItem(window.location.hostname + "-queryBillDays");
  localStorage.removeItem(window.location.hostname + '-iwmsJwt');
  localforage.removeItem(window.location.hostname + "-ip");
}

export function getExtensionId() {
  return cache["extensionId"];
}

export function getBalanceConfig() {
  return cache["BalanceConfig"];
}

export function setUserBreadcrumb(data) {
  cache["userBreadcrumb"] = data;
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
  return cache["userBreadcrumb"];
}

export function getAuthorityInfo() {
  return cache['antd-pro-authority'];
}

export function getSearchMenus() {
  return cache[window.location.hostname + '-searchMenu'];
}

export function setCollectData(data) {
  cache["collectData"] = data;
}

export function getPageFilter(key) {
  const prefix = "pageFilter" + window.location.hostname;
  return cache[prefix + key]
}

export function setPageFilter(key, value) {
  const prefix = "pageFilter" + window.location.hostname;
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
  return cache["collectData"];
}
