import { loginUser, loginOrg } from './LoginContext';
import { BloomFilter } from './bloomfilter';

// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority(str) {
  // return localStorage.getItem('antd-pro-authority') || ['admin', 'user'];
  const authorityString =
    typeof str === 'undefined' ? localStorage.getItem('antd-pro-authority') : str;
  // authorityString could be admin, "admin", ["admin"]
  let authority;
  try {
    authority = JSON.parse(authorityString);
  } catch (e) {
    authority = authorityString;
  }
  if (typeof authority === 'string') {
    return [authority];
  }
  return authority || ['admin'];
}

export function setAuthority(authority) {
  const proAuthority = typeof authority === 'string' ? [authority] : authority;
  return localStorage.setItem('antd-pro-authority', JSON.stringify(proAuthority));
}

/**
 * 判断有没有权限
 * 
 * @param {String} currentResource 当前要检测的资源
 */
export function havePermission(currentResource) {
  if (loginOrg() && loginOrg().type === 'HEADING') {
    return true;
  }

  let allResources = loginUser() ? loginUser().resources : [];
  if (!allResources || allResources.length === 0)
    return false;

  let bloomFilter = SingletonBloomFilter.getInstance(allResources);
  return bloomFilter.test(currentResource);
}

export class SingletonBloomFilter {
  constructor(resources) {
    this.resources = resources;
  }

  static getInstance(resources) {
    if (!this.instance) {
      this.instance = new BloomFilter(32 * 256, 16);
      let resourcesArray = [];
      if (!Array.isArray(resources)) {
        resourcesArray = resources.replace(new RegExp(/"/g), '').slice(1, -1).split(",");
      } else {
        resourcesArray = resources;
      }
      resourcesArray.forEach(element => {
        this.instance.add(element)
      });
    }
    return this.instance;
  }

  static destory() {
    this.instance = undefined;
  }
}