import { stringify } from 'qs';
import request from '@/utils/request';
import { async } from 'q';
import {loginOrg} from '@/utils/LoginContext';

export async function save(payload) {
  return request(`/iwms-basic/basic/pretype`,{
    method: 'POST',
    body: payload,
  });
}


export async function deletePreType(payload) {
  return request(`/iwms-basic/basic/pretype/${payload.uuid}`, {
    method: 'POST'
  });
}
export async function modify(payload) {
  return request(`/iwms-basic/basic/pretype/modify`,{
    method: 'POST',
    body: payload,
  });
}

export async function query(payload) {
  return request(`/iwms-basic/basic/pretype/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function queryType(payload) {
  let orgUuid = loginOrg().uuid;
  let preType = payload.preType ? payload.preType:payload;
  if(payload.orgUuid){
    orgUuid = payload.orgUuid
  }
  return request(`/iwms-basic/basic/pretype/queryNames?orgUuid=${orgUuid}&preType=${preType}`);
}