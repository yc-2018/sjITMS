import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import moment from 'moment';

export async function query(payload) {
  return request(`/iwms-facility/facility/packagebill/page`, {
    method: 'POST',
    body: payload
  });
}

export async function get(uuid) {
  return request(`/iwms-facility/facility/packagebill/${uuid}`,{
    method: 'GET'
  });
}

export async function audit(payload) {
  return request(`/iwms-facility/facility/packagebill/audit/${payload.uuid}?version=${payload.version}`, {
    method: 'POST',
    body: payload.items
  });
}

export async function finish(payload) {
  return request(`/iwms-facility/facility/packagebill/finish/${payload.uuid}?version=${payload.version}`, {
    method: 'POST',
    body: payload.items
  });
}

export async function modify(payload) {
  return request(`/iwms-facility/facility/packagebill/modify`, {
    method: 'POST',
    body: payload
  });
}

export async function save(payload) {
  return request(`/iwms-facility/facility/packagebill`, {
    method: 'POST',
    body: payload
  });
}

export async function saveAndAudit(payload) {
  return request(`/iwms-facility/facility/packagebill/saveandaudit`, {
    method: 'POST',
    body: payload
  });
}

export async function batchImport(payload) {
  return request(`/iwms-facility/facility/packagebill/batchimport?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}&fileKey=${payload.fileKey}`, {
     method: 'POST',
     body: {
       uuid: loginUser().uuid,
       code: loginUser().code,
       name: loginUser().name
     },
  });
}

export async function deleteOrder(payload) {
  return request(`/iwms-facility/facility/packagebill/${payload.uuid}?version=${payload.version}`, {
    method: 'DELETE',
  });
}

export async function getByOwnerCode(payload) {
  return request(`/iwms-facility/facility/virtualarticleconfig/getbyowner?dcUuid=${loginOrg().uuid}&ownerUuid=${payload.ownerUuid}`,{
    method: 'GET'
  });
}

export async function modifyafterfinish(payload) {
  return request(`/iwms-facility/facility/packagebill/modifyafterfinish/${payload.uuid}?version=${payload.version}`, {
    method: 'POST',
    body: {
      customerAddress: payload.customerAddress,
      note: payload.note
    },
  });
}

export async function getByBillNumber(payload) {
  return request(`/iwms-facility/facility/packagebill/${payload.billNumber}/get?dcUuid=${payload.dcUuid}`);
}
