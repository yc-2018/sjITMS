import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { async } from 'q';

export async function query(payload) {
  return request(`/iwms-facility/facility/process/page`, {
    method: 'POST',
    body: payload
  });
}

export async function get(payload) {
  return request(`/iwms-facility/facility/process/${payload.uuid}`);
}

export async function save(payload) {
  return request(`/iwms-facility/facility/process`, {
    method: 'POST',
    body: payload,
  });
}

export async function saveAndApprove(payload) {
  return request(`/iwms-facility/facility/process/saveAndAudit`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-facility/facility/process/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function remove(payload) {
  return request(`/iwms-facility/facility/process/${payload.uuid}?version=${payload.version}`, {
    method: 'DELETE',
  });
}

export async function audit(payload) {
  return request(`/iwms-facility/facility/process/${payload.uuid}/audit?version=${payload.version}`, {
    method: 'POST',
  });
} 

export async function queryProcessAbleStock(payload) {
  return request(`/iwms-facility/facility/process/queryStocks?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}&wrhUuid=${payload.wrhUuid}&ownerUuid=${payload.ownerUuid}&articleCode=${payload.articleCode}&schemeUuid=${payload.schemeUuid}`, {
    method: 'GET'
  });
}

export async function queryProcessEndArticles(payload) {
  return request(`/iwms-facility/facility/process/queryEndProducts?companyUuid=${loginCompany().uuid}&ownerUuid=${payload.ownerUuid}&articleCode=${payload.articleCode}&schemeUuid=${payload.schemeUuid}`, {
    method: 'GET'
  });
}

export async function queryContainers(payload) {
  return request(`/iwms-facility/facility/process/queryUsingOrIdelContainers?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}&containerBarcode=${payload.containerBarCode}&articleUuid=${payload.articleUuid}&qpcStr=${payload.qpcStr}&productionBatch=${payload.productionBatch}&binCode=${payload.binCode}`, {
    method: 'GET'
  });
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/process/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/process/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}
