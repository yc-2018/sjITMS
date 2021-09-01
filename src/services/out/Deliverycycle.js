import { stringify } from 'qs';
import request from '@/utils/request';
import { loginOrg, loginUser, loginCompany } from '@/utils/LoginContext';

// 配送周期
export async function save(payload) {
  return request(`/iwms-facility/facility/deliverycycle`, {
    method: 'POST',
    body: payload,
  });
}
export async function modify(payload) {
  return request(`/iwms-facility/facility/deliverycycle/modify`, {
    method: 'POST',
    body: payload,
  });
}
export async function remove(payload) {
  return request(`/iwms-facility/facility/deliverycycle/${payload.uuid}?version=${payload.version}`, {
    method: 'DELETE',
  });
}
export async function getDeliveryCycleList(params) {
  return request(`/iwms-facility/facility/deliverycycle/get?companyUuid=${params.companyUuid}&dcUuid=${params.dcUuid}`);
}
export async function getDeliveryCycleByUuid(payload) {
  return request(`/iwms-facility/facility/deliverycycle/${payload.uuid}`);
}
export async function setDefault(payload) {
  return request(`/iwms-facility/facility/deliverycycle/${payload.uuid}/setDefault?companyUuid=${payload.companyUuid}&dcUuid=${payload.dcUuid}`, {
    method: 'POST',
    body: payload,
  });
}

// 门店组
export async function saveStoreGroup(payload) {
  return request(`/iwms-facility/facility/deliverycycle/${payload.deliveryCycleUuid}/storesGroup`, {
    method: 'POST',
    body: payload,
  });
}
export async function modifyStoreGroup(payload) {
  return request(`/iwms-facility/facility/deliverycycle/${payload.deliveryCycleUuid}/storesGroup/modify`, {
    method: 'POST',
    body: payload,
  });
}
export async function removeStoreGroup(payload) {
  return request(`/iwms-facility/facility/deliverycycle/${payload.uuid}/storesGroup?version=${payload.version}`, {
    method: 'DELETE',
  });
}
export async function getStoreGroup(payload){
  return request(`/iwms-facility/facility/deliverycycle/${payload.uuid}/storesGroup`,{
    method:'GET'
  });
}
export async function getStoreGroups(payload) {
  return request(`/iwms-facility/facility/deliverycycle/queryStoresGroup?companyUuid=${payload.companyUuid}&dcUuid=${payload.dcUuid}&deliveryCycleUuid=${payload.deliveryCycleUuid}`, {
    method: 'GET'
  });
}
export async function queryStoreGroup(payload) {
  return request(`/iwms-facility/facility/deliverycycle/storesGroup/page`, {
    method: 'POST',
    body: payload,
  });
}
// 门店
export async function saveStoreDeliveryCycle(payload) {
  return request(`/iwms-facility/facility/deliverycycle/${payload.deliveryCycleUuid}/storeDeliveryCycle`, {
    method: 'POST',
    body: payload,
  });
}
export async function modifyStoreDeliveryCycle(payload) {
  return request(`/iwms-facility/facility/deliverycycle/${payload.deliveryCycleUuid}/storeDeliveryCycle/modify`, {
    method: 'POST',
    body: payload,
  });
}
export async function removeStoreDeliveryCycle(payload) {
  return request(`/iwms-facility/facility/deliverycycle/${payload.deliveryCycleUuid}/storeDeliveryCycle/${payload.storeUuid}`, {
    method: 'DELETE',
  });
}
export async function getStoreDeliveryCycle(payload) {
  return request(`/iwms-facility/facility/deliverycycle/storeDeliveryCycle/${payload}`, {
    method: 'GET'
  });
}
export async function getStoreDeliveryCycleWave(payload) {
  return request(`/iwms-facility/facility/deliverycycle/getStoreDeliveryCycleWave?storeUuid=${payload.storeUuid}&dcUuid=${loginOrg().uuid}`, {
    method: 'GET'
  });
}
export async function query(payload) {
  return request(`/iwms-facility/facility/deliverycycle/storeDeliveryCycle/page`, {
    method: 'POST',
    body: payload,
  });
}
export async function batchImport(payload) {
  return request(`/iwms-facility/facility/deliverycycle/batchImport?deliveryCycleGroupUuid=${payload.deliveryCycleGroupUuid}&fileKey=${payload.fileKey}`, {
    method: 'POST',
    body: payload,
  });
}

