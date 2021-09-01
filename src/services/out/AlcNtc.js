import { stringify } from 'qs';
import request from '@/utils/request';
import { loginOrg, loginUser, loginCompany } from '@/utils/LoginContext';
export async function query(params) {
  return request(`/iwms-facility/facility/alcntc/page`, {
    method: 'POST',
    body: params,
  });
}

export async function add(params) {
  return request(`/iwms-facility/facility/alcntc`, {
    method: 'POST',
    body: params,
  });
}

export async function saveAndAudit(params) {
  return request(`/iwms-facility/facility/alcntc/saveAndAudit`, {
    method: 'POST',
    body: params,
  });
}

export async function update(params) {
  return request(`/iwms-facility/facility/alcntc/modify`, {
    method: 'POST',
    body: params,
  });
}

export async function modifyInitial(params) {
  return request(`/iwms-facility/facility/alcntc/modifyInitial`, {
    method: 'POST',
    body: params,
  });
}

export async function get(param) {
  return request(`/iwms-facility/facility/alcntc/${param.uuid}`);
}

export async function remove(payload) {
  return request(`/iwms-facility/facility/alcntc/${payload.uuid}?version=${payload.version}`, {
    method: 'DELETE'
  });
}

export async function audit(payload) {
  return request(`/iwms-facility/facility/alcntc/${payload.uuid}/audit?version=${payload.version}`, {
    method: 'POST'
  });
}

export async function finish(payload) {
  return request(`/iwms-facility/facility/alcntc/complete?uuid=${payload.uuid}&version=${payload.version}`, {
    method: 'POST'
  });
}

export async function abort(payload) {
  return request(`/iwms-facility/facility/alcntc/abort?uuid=${payload.uuid}&version=${payload.version}`, {
    method: 'POST'
  });
}

export async function getWaveAlcNtcBills(params) {
  return request(`/iwms-facility/facility/alcntc/getWaveAlcNtcBill`, {
    method: 'POST',
    body: params,
  });
}
export async function batchImport(payload) {
  return request(`/iwms-facility/facility/alcntc/batchimport?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}&fileKey=${payload.fileKey}`, {
    method: 'POST'
  });
}
export async function copy(payload) {
  return request(`/iwms-facility/facility/alcntc/cpAndSave?${stringify(payload)}`,{
    method: 'POST'
  });
}
export async function getByNumber(billNumber) {
  return request(`/iwms-facility/facility/alcntc/${billNumber}/get?dcUuid=${loginOrg().uuid}`);
}
// export async function getImportTemplateUrl() {
//   return request(`/iwms-facility/facility/alcntc/templet/download`);
// }

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/alcntc/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/alcntc/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}
