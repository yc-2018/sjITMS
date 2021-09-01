import jwtDecode from 'jwt-decode';
import localforage from 'localforage';
import { isNotEmpty } from '@/utils/utils';
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
  let org = cache[window.location.hostname + "-org"];

  if (!org) {
    return { uuid: '', code: '', name: '' };
  }
  return org;
}

export function loginUser() {
  let user = cache[window.location.hostname + "-user"];

  if (!user) {
    return { uuid: '', code: '', name: '' };
  }
  return user;
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

export function loginCompany() {
  let company = cache[window.location.hostname + "-company"];

  if (!company) {
    return { uuid: '', code: '', name: '' };
  }
  return company;
}

export function getDefOwner() {
  return cache[window.location.hostname + "-owner"];
}

export function setDefOwner(owner) {
  localforage.setItem(window.location.hostname + '-owner', owner);
  cache[window.location.hostname + '-owner'] = owner;
}

export function getBalanceConfig() {
  return cache["BalanceConfig"];
}

export function setBalanceConfig(balanceConfig) {
  localforage.setItem("BalanceConfig", balanceConfig);
  cache['BalanceConfig'] = balanceConfig;
}

export function getExtensionId() {
  return cache["extensionId"];
}

export function setExtensionId(extensionId) {
  localforage.setItem("extensionId", extensionId);
  cache['extensionId'] = extensionId;
}

export function getSerialConnectionId() {
  return cache["serialConnectionId"];
}

export function setSerialConnectionId(serialConnectionId) {
  localforage.setItem("serialConnectionId", serialConnectionId);
}

export function getSerialPort() {
  return cache["serialPort"];
}

export function setSerialPort(serialPort) {
  localforage.setItem("serialPort", serialPort);
  cache['serialPort'] = serialPort;
}

export function addSearchMenu(menuKey) {
  let searchedMenus = cache[window.location.hostname + '-searchMenu'];
  if (!searchedMenus) {
    searchedMenus = [];
  }
  let idx = searchedMenus.indexOf(menuKey);
  if (idx > -1) {
    searchedMenus.splice(idx, 1);
    searchedMenus.push(menuKey);
  } else {
    searchedMenus.push(menuKey);
    if (searchedMenus.length > 5) {
      searchedMenus.splice(0, 1);
    }
  }
  localforage.setItem(window.location.hostname + '-searchMenu', searchedMenus);
  cache[window.location.hostname + '-searchMenu'] = searchedMenus;
}

export function getSearchMenus() {
  return cache[window.location.hostname + '-searchMenu'];
}

export function loginIp() {
  let ip = cache[window.location.hostname + "-ip"]
  if (!ip) {
    return { accountIp: '', basicIp: '', facilityIp: '', openApiIp: '' };
  }
  return ip;
}

export function cacheLogin(loginContext) {
  setAuthority(loginContext.resources);
  let user = {
    uuid: loginContext.userUuid,
    code: loginContext.userCode,
    name: loginContext.userName,
    phone: loginContext.userPhone,
    avatar: loginContext.userAvatar,
    resources: loginContext.resources,
  };
  let company = {
    uuid: loginContext.companyUuid,
    code: loginContext.companyCode,
    name: loginContext.companyName,
  };
  let org = {
    uuid: loginContext.orgUuid,
    code: loginContext.orgCode,
    name: loginContext.orgName,
    type: loginContext.orgType,
  };
  let ip = {
    accountIp: loginContext.accountIp,
    basicIp: loginContext.basicIp,
    facilityIp: loginContext.facilityIp,
    openApiIp: loginContext.openApiIp,
  };
  let loginId = loginContext.uuid;

  localforage.setItem(window.location.hostname + '-user', user);
  localforage.setItem(window.location.hostname + '-company', company);
  localforage.setItem(window.location.hostname + '-org', org);
  localforage.setItem(window.location.hostname + '-ip', ip);
  localforage.setItem(window.location.hostname + '-loginId', loginId);

  cache[window.location.hostname + '-user'] = user;
  cache[window.location.hostname + '-company'] = company;
  cache[window.location.hostname + '-org'] = org;
  cache[window.location.hostname + '-ip'] = ip;
  cache[window.location.hostname + '-loginId'] = loginId;
}

export function cacheLoginKey(loginKey) {
  localforage.setItem(window.location.hostname + '-iwmsJwt', loginKey);
  cache[window.location.hostname + '-iwmsJwt'] = loginKey;
}

export function cacheTableColumns(key, value) {
  let user = {};
  if (loginUser()) {
    user = loginUser();
  }
  localforage.setItem(window.location.hostname + user.uuid + '-' + key, value);
  cache[window.location.hostname + user.uuid + '-' + key] = value;
}

export function cacheResourceDescription(helpInfos) {
  if (isNotEmpty(helpInfos)) {
    let user = {};
    if (loginUser()) {
      user = loginUser();
    }
    for (let i = 0; i < helpInfos.length; i ++) {
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

export function removeTableColumns(key) {
  let user = {};
  if (loginUser()) {
    user = loginUser();
  }
  const cacheKey = window.location.hostname + user.uuid + '-' + key;
  localforage.removeItem(cacheKey);
  delete cache[cacheKey];
}

export function getTableColumns(key) {
  let user = {};
  if (loginUser()) {
    user = loginUser();
  }
  return cache[window.location.hostname + user.uuid + '-' + key];
}

export function loginKey() {
  return cache[window.location.hostname + '-iwmsJwt'];

}

export function getMenuLayout() {
  const user = loginUser();
  if (!user) {
    return 'sidermenu';
  }

  let menuLayouts = cache['menuLayouts']
  if (!menuLayouts || !menuLayouts[user.uuid]) {
    return 'sidermenu';
  }

  return menuLayouts[user.uuid];
}

export function setMenuLayout(layout) {
  let menuLayouts = cache['menuLayouts']

  if (!menuLayouts) {
    menuLayouts = {};
  }
  const user = loginUser();
  if (!user) {
    return;
  }
  menuLayouts[user.uuid] = layout;

  localforage.setItem('menuLayouts', menuLayouts);
  cache['menuLayouts'] = menuLayouts;

}

export function setActiveKey(activeKey) {
  sessionStorage.setItem(window.location.hostname + '-activeKey', activeKey);
}

export function getActiveKey() {
  return sessionStorage.getItem(window.location.hostname + '-activeKey');
}

export function setCollectData(data) {
  cache["collectData"] = data;
}

export function getCollectData() {
  return cache["collectData"];
}

export function addCollectData(data) {
  let collectedData = cache["collectData"];
  if (!collectedData) collectedData = [];
  collectedData.push(data);
  cache["collectData"] = collectedData;
}

export function removeCollectData(data) {
  let collectedData = cache["collectData"];
  if (!collectedData) return;

  let idx = collectedData.indexOf(data);
  if (idx > -1) {
    collectedData.splice(idx, 1);
  }
  cache["collectData"] = collectedData;
}

export function setUserBreadcrumb(data) {
  cache["userBreadcrumb"] = data;
}

export function getUserBreadcrumb() {
  return cache["userBreadcrumb"];
}

export function clearLogin() {
  sessionStorage.clear();

  localforage.removeItem(window.location.hostname + "-user");
  localforage.removeItem(window.location.hostname + "-org");
  localforage.removeItem(window.location.hostname + "-company");
  localforage.removeItem(window.location.hostname + "-loginId");
  localforage.removeItem(window.location.hostname + "-owner");
  localforage.removeItem(window.location.hostname + "-iwmsJwt");
  localforage.removeItem(window.location.hostname + "-ip");
  localforage.removeItem("antd-pro-authority");

  delete cache[window.location.hostname + "-user"];
  delete cache[window.location.hostname + "-org"];
  delete cache[window.location.hostname + "-company"];
  delete cache[window.location.hostname + "-loginId"];
  delete cache[window.location.hostname + "-owner"];
  delete cache[window.location.hostname + "-iwmsJwt"];
  delete cache[window.location.hostname + "-ip"];
  delete cache["antd-pro-authority"];

  clearPageFilter();
}

export function setAuthority(value) {
  localforage.setItem('antd-pro-authority', value);
  cache['antd-pro-authority'] = value;
}

export function getAuthorityInfo() {
  return cache['antd-pro-authority'];
}

export function setLastLogin(value) {
  localforage.setItem(window.location.hostname + 'lastLoginAccount', value);
  cache[window.location.hostname + 'lastLoginAccount'] = value;
}

export function getLastLogin() {
  return cache[window.location.hostname + 'lastLoginAccount'];
}

export function setPageFilter(key, value) {
  const prefix = "pageFilter" + window.location.hostname;
  cache[prefix + key] = value;
  if (pageFilterKeys.indexOf(prefix + key) == -1) {
    pageFilterKeys.push(prefix + key);
  }
}

export function getPageFilter(key) {
  const prefix = "pageFilter" + window.location.hostname;
  return cache[prefix + key]
}

export function clearPageFilter() {
  for (let i = 0; i < pageFilterKeys.length; i++) {
    delete cache[pageFilterKeys[i]];
  }
}

export function getPrintLabel() {
  return cache[loginCompany().uuid + '-printLabel'];
}

export function getPrintElectronic() {
  return cache[loginCompany().uuid + '-printElectronic'];
}

export function getPrintLabelTpick() {
  return cache[loginCompany().uuid + '-printLabelTpick'];
}

export function setPrintLabel(value) {
  localforage.setItem(loginCompany().uuid + '-printLabel', value);
  cache[loginCompany().uuid + '-printLabel'] = value;
}

export function setPrintElectronic(value) {
  localforage.setItem(loginCompany().uuid + '-printElectronic', value);
  cache[loginCompany().uuid + '-printElectronic'] = value;
}

export function setPrintLabelTpick(value) {
  localforage.setItem(loginCompany().uuid + '-printLabelTpick', value);
  cache[loginCompany().uuid + '-printLabelTpick'] = value;
}
