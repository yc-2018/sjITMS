import { stringify } from 'qs';
import request from '@/utils/request';
import { loginOrg, loginUser,loginCompany } from '@/utils/LoginContext';

export async function saveNotice(payload) {
  return request(`/iwms-basic/basic/notice`, {
    method: 'POST',
    body:payload
  });
}

export async function saveReplition(payload) {
  return request(`/iwms-basic/basic/notice/reply`, {
    method: 'POST',
    body:payload
  });
}

export async function getNotice(payload) {

  return request(`/iwms-basic/basic/notice/${payload.uuid}?orgUuid=${loginOrg().uuid}&userUuid=${loginUser().uuid}`, {
    method: 'GET',
  });
}

export async function getUnReadedNotice(payload) {
  return request(`/iwms-basic/basic/notice/unreaded?userUuid=${loginUser().uuid}&orgUuid=${loginOrg().uuid}`, {
    method: 'GET',
  });
}

export async function query(payload) {
  return request(`/iwms-basic/basic/notice/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function readNotice(payload) {
  return request(`/iwms-basic/basic/notice/readNotice?noticeUuid=${payload.noticeUuid}&userUuid=${payload.userUuid}`, {
    method: 'POST'
  });
}

export async function clearNotice(payload) {
  return request(`/iwms-basic/basic/notice/clearNotice?orgUuid=${payload.orgUuid}&userUuid=${payload.userUuid}`, {
    method: 'POST'
  });
}

export async function getUnReadedReplition(payload) {
  return request(`/iwms-basic/basic/notice/reply?erUuid=${loginUser().uuid}`, {
    method: 'GET',
  });
}

export async function clearReplition(payload) {
  return request(`/iwms-basic/basic/notice/clearReplition?userUuid=${payload.userUuid}`, {
    method: 'POST'
  });
}

export async function queryOrg(payload) {
  return request(`/iwms-account/account/org/getByCodeOrName?key=${payload}`, {
    method: 'GET',
  });
}


