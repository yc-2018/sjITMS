import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import moment from 'moment';

export async function query(payload) {
  return request(`/iwms-facility/facility/incinv/page`, {
    method: 'POST',
    body: payload
  });
}

export async function get(payload) {
  return request(`/iwms-facility/facility/incinv/${payload.uuid}`);
}

export async function getByBillNumber(payload) {
  return request(`/iwms-facility/facility/incinv/${payload.billNumber}/get?dcUuid=${payload.dcUuid}`);
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/incinv/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/incinv/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function audit(payload) {
  return request(`/iwms-facility/facility/incinv/${payload.uuid}/audit?version=${payload.version}`, {
    method: 'POST',
    body: payload.realQtyStr,
  });
}

export async function save(payload) {
  return request(`/iwms-facility/facility/incinv`, {
    method: 'POST',
    body: payload,
  });
}

export async function saveAndApprove(payload) {
  return request(`/iwms-facility/facility/incinv/saveAndAudit`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-facility/facility/incinv/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function remove(payload) {
  return request(`/iwms-facility/facility/incinv/${payload.uuid}?version=${payload.version}`, {
    method: 'DELETE',
  });
}

export async function queryIncBins(payload) {
  return request(`/iwms-facility/facility/incinv/queryIncBins?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}&wrhUuid=${payload.wrhUuid}&binCode=${payload.binCode}`);
}

export async function queryIncContainers(payload) {
  return request(`/iwms-facility/facility/incinv/queryIncContainers?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}&binCode=${payload.binCode}&containerBarCode=${payload.containerBarcode}`);
}

// export async function getImportTemplateUrl(payload) {
//   return request(`/iwms-facility/facility/incinv/templet/download`);
// }

export async function batchImport(payload) {
  return request(`/iwms-facility/facility/incinv/batchimport?dcUuid=${loginOrg().uuid}&companyUuid=${loginCompany().uuid}&fileKey=${payload.fileKey}`, {
    method: 'POST',
    body: {
      uuid: loginUser().uuid,
      code: loginUser().code,
      name: loginUser().name
    },
  });
}

