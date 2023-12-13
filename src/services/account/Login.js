/*
 * @Author: guankongjin
 * @Date: 2023-04-13 17:16:25
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-10-19 11:08:13
 * @Description: file content
 * @FilePath: \iwms-web\src\services\account\Login.js
 */
import { stringify } from 'qs';
import request from '@/utils/request';

export async function accountLogin(payload) {
  return request(`/iwms-account/account/login/accountlogin?${stringify(payload)}&deviceType=WEB`, {
    method: 'POST',
  });
}

export async function dingLogin(payload) {
  return request(`/iwms-account/account/dinglogin/login?${stringify(payload)}&deviceType=WEB`, {
    method: 'POST',
  });
}
export async function dingLogin1(payload) {
  return request(`/iwms-account/account/dinglogin/dinglogin?${stringify(payload)}&deviceType=WEB`, {
    method: 'POST',
  });
}
export async function getDingUserId(payload) {
  return request(`/iwms-account/account/dinglogin/getUserId?${stringify(payload)}`);
}

export async function phoneLogin(payload) {
  return request(`/iwms-account/account/login/captchalogin?${stringify(payload)}&deviceType=WEB`, {
    method: 'POST',
  });
}

export async function forgetPassword(payload) {
  return request(`/iwms-account/account/login/forgetpassword?phone=${payload.phone}&captcha=${payload.captcha}&newPassword=${payload.newPassword}`, {
    method: 'POST',
  });
}

export async function modifyPassword(payload) {
  return request(`/iwms-account/account/login/modify?userUuid=${payload.userUuid}&oldPassword=${payload.oldPassword}&newPassword=${payload.newPassword}`, {
    method: 'POST',
  });
}
export async function modifyNewPassword(payload) {
  return request(`/iwms-account/account/login/modifyNewPassword?userUuid=${payload.userUuid}&newPassword=${payload.newPassword}`, {
    method: 'POST',
  });
}

export async function switchOrg(payload) {
  return request(`/iwms-account/account/login/switch?userUuid=${payload.userUuid}&orgUuid=${payload.orgUuid}&deviceType=WEB`, {
    method: 'POST',
  });
}

export async function get(payload) {
  return request(`/iwms-account/account/login?${stringify(payload)}`);
}

export async function resetPassword(payload) {
  return request(`/iwms-account/account/login/resetPassword?userUuid=${payload.userUuid}`, {
    method: 'POST',
  });
}