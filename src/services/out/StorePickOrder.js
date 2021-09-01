import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany,loginOrg } from '@/utils/LoginContext';
import { async } from 'q';

export async function save(payload) {
  return request(`/iwms-facility/facility/storepickorder`, {
    method: 'POST',
    body: payload,
  });
}

export async function saveOrder(payload) {
  return request(`/iwms-facility/facility/storepickorder/order`, {
    method: 'POST',
    body: payload,
  });
}

export async function saveItem(payload) {
  return request(`/iwms-facility/facility/storepickorder/${payload.orderUuid}/store`, {
    method: 'POST',
    body: payload.stores,
  });
}


export async function remove(payload) {
  return request(`/iwms-facility/facility/storepickorder/${payload.uuid}/remove?version=${payload.version}`, {
    method: 'DELETE',
  });
}

export async function removeOrder(payload) {
  return request(`/iwms-facility/facility/storepickorder/${payload.uuid}/order?version=${payload.version}`, {
    method: 'DELETE',
  });
}

export async function removeItem(payload) {
  return request(`/iwms-facility/facility/storepickorder/${payload.uuid}/store`, {
    method: 'DELETE',
  });
}

export async function modify(payload) {
  return request(`/iwms-facility/facility/storepickorder/modify`, {
    method: 'POST',
    body: payload,
  });
}
export async function modifyOrder(payload) {
  return request(`/iwms-facility/facility/storepickorder/modify/order`, {
    method: 'POST',
    body: payload,
  });
}

export async function modifyScheme(payload) {
  return request(`/iwms-facility/facility/storepickorder/${payload.uuid}/def?version=${payload.version}`, {
    method: 'POST'
  });
}

export async function listSchemes(payload) {
  return request(`/iwms-facility/facility/storepickorder/query?companyUuid=${payload.companyUuid}&dcUuid=${payload.dcUuid}`, {
    method: 'GET',
  });
}

export async function listOrders(payload) {
  return request(`/iwms-facility/facility/storepickorder/queryOrder?companyUuid=${payload.companyUuid}&dcUuid=${payload.dcUuid}&schemeUuid=${payload.schemeUuid}`, {
    method: 'GET',
  });
}

export async function getItemBySchemeUuid(payload) {
  return request(`/iwms-facility/facility/storepickorder/getStoreBySchemeUuid?schemeUuid=${payload.schemeUuid}`, {
    method: 'GET',
  });
}

export async function getScheme(payload) {
  return request(`/iwms-facility/facility/storepickorder/${payload.uuid}`, {
    method: 'GET',
  });
}

export async function getOrder(payload) {
  return request(`/iwms-facility/facility/storepickorder/${payload.uuid}/order`, {
    method: 'GET',
  });
}

export async function queryOrders(payload) {
  return request(`/iwms-facility/facility/storepickorder/queryOrders?companyUuid=${payload.companyUuid}&dcUuid=${payload.dcUuid}`, {
    method: 'GET',
  });
}

export async function adjust(payload) {
  return request(`/iwms-facility/facility/storepickorder/adjustStore?orderUuid=${payload.pickOrderUuid}&storeUuid=${payload.storeUuid}&orderNo=${payload.orderNo}`, {
    method: 'POST',
  });
}

export async function query(payload) {
  return request(`/iwms-facility/facility/storepickorder/store/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function getStoreUCN(payload){
  return request(`/iwms-facility/facility/storepickorder/getStoreUCN?companyUuid=${loginCompany().uuid}&schemeUuid=${payload.schemeUuid}`)
}

export async function batchImport(payload) {
  return request(`/iwms-facility/facility/storepickorder/batchImport?schemeUuid=${payload.schemeUuid}&fileKey=${payload.fileKey}`, {
    method: 'POST',
    body: payload,
  });
}

