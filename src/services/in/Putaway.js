import {stringify} from 'qs';
import request from '@/utils/request';
import {loginCompany,loginOrg} from '@/utils/LoginContext';

export async function save(payload) {
  return request(`/iwms-facility/facility/putawayBill`, {
    method: 'POST',
    body: payload,
  });
}

export async function saveAndAudit(payload) {
  return request(`/iwms-facility/facility/putawayBill/saveAndAudit`, {
    method: 'POST',
    body: payload,
  });
}

export async function deletePutaway(payload) {
  return request(`/iwms-facility/facility/putawayBill/remove?uuid=${payload.uuid}&version=${payload.version}`, {
    method: 'DELETE',
  });
}

export async function modify(payload) {
  return request(`/iwms-facility/facility/putawayBill/modify`, {
    method: 'POST',
    body: payload,
  });
}
export async function query(payload) {
  return request(`/iwms-facility/facility/putawayBill/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function audit(payload) {
  return request(`/iwms-facility/facility/putawayBill/audit?uuid=${payload.uuid}&version=${payload.version}`, {
    method: 'POST'
  });
}

export async function get(uuid) {
  return request(`/iwms-facility/facility/putawayBill/${uuid}`);
}

export async function getByBillNumberAndDcUuid(billNumber) {
  return request(`/iwms-facility/facility/putawayBill/getByBillNumberAndDcUuid?billNumber=${billNumber}&dcUuid=${loginOrg().uuid}`);
}

export async function queryPutawayContainers(payload) {
  return request(`/iwms-facility/facility/putawayBill/queryPutawayContainers`, {
    method: 'POST',
    body: payload,
  });
}

export async function queryPutawayBins(payload) {
  return request(`/iwms-facility/facility/putawayBill/queryPutawayBins?containerBarcode=${payload.containerBarcode}&dcUuid=${loginOrg().uuid}&companyUuid=${loginCompany().uuid}&binCode=${payload.binCode}`, {
    method: 'POST',
  });
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/putawayBill/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/putawayBill/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}
