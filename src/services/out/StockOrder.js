import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { async } from 'q';

export async function queryScheme(payload) {
  return request(`/iwms-facility/facility/stockOrder/queryList?companyUuid=${payload.companyUuid}&dcUuid=${payload.dcUuid}`, {
    method: 'GET',
  });
}

export async function saveScheme(payload) {
  return request(`/iwms-facility/facility/stockOrder/save`, {
    method: 'POST',
    body: payload,
  })
}

export async function modifyScheme(payload) {
  return request(`/iwms-facility/facility/stockOrder/modify`, {
    method: 'POST',
    body: payload,
  })
}

export async function removeScheme(payload) {
  return request(`/iwms-facility/facility/stockOrder/remove?uuid=${payload.uuid}&version=${payload.version}`, {
    method: 'DELETE',
  })
}

export async function getScheme(payload) {
  return request(`/iwms-facility/facility/stockOrder/get?uuid=${payload.uuid}`, {
    method: 'GET',
  });
}

export async function isDef(payload) {
  return request(`/iwms-facility/facility/stockOrder/isDef?uuid=${payload.uuid}&version=${payload.version}`, {
    method: 'POST',
  })
}

export async function queryAllocateOrder(payload) {
  return request(`/iwms-facility/facility/stockOrder/queryOrders?${stringify(payload)}`, {
    method: 'GET',
  });
}

export async function getAllocateOrder(payload) {
  return request(`/iwms-facility/facility/stockOrder/getOrder?${stringify(payload)}`, {
    method: 'GET',
  });
}

export async function saveAllocateOrder(payload) {
  return request(`/iwms-facility/facility/stockOrder/saveOrder`, {
    method: 'POST',
    body: payload,
  });
}

export async function modifyAllocateOrder(payload) {
  return request(`/iwms-facility/facility/stockOrder/modifyOrder`, {
    method: 'POST',
    body: payload,
  });
}

export async function removeAllocateOrder(payload) {
  return request(`/iwms-facility/facility/stockOrder/removeOrder?uuid=${payload.uuid}&version=${payload.version}`, {
    method: 'DELETE',
  });
}

export async function saveAllocateOrderItem(payload) {
  return request(`/iwms-facility/facility/stockOrder/saveStore?allocateOrderUuid=${payload.allocateOrderUuid}`, {
    method: 'POST',
    body: payload.stores,
  });
}

export async function queryAllocateOrderItem(payload) {
  return request(`/iwms-facility/facility/stockOrder/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function adjust(payload) {
  return request(`/iwms-facility/facility/stockOrder/adjust?${stringify(payload)}`, {
    method: 'POST',
  });
}

export async function removeAllocateOrderItem(payload) {
  return request(`/iwms-facility/facility/stockOrder/removeStore?uuid=${payload.uuid}`, {
    method: 'DELETE',
  });
}

export async function getStoreUCN(payload) {
  return request(`/iwms-facility/facility/stockOrder/getStoreUCN?companyUuid=${loginCompany().uuid}&schemeUuid=${payload.schemeUuid}`)
}

export async function batchImport(payload) {
  return request(`/iwms-facility/facility/stockOrder/batchimport?stockAllocateSchemeUuid=${payload.stockAllocateSchemeUuid}&fileKey=${payload.fileKey}`, {
    method: 'POST',
    body: payload,
  });
}
