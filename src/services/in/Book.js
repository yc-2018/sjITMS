import { stringify } from 'qs';
import request from '@/utils/request';
import {loginOrg} from '@/utils/LoginContext';
export async function query(params) {
  return request(`/iwms-facility/facility/bookbill/page`, {
    method: 'POST',
    body: params,
  });
}

export async function add(params) {
  return request(`/iwms-facility/facility/bookbill`, {
    method: 'POST',
    body: params,
  });
}

export async function saveAndAudit(params) {
  return request(`/iwms-facility/facility/bookbill/saveAndAudit`, {
    method: 'POST',
    body: params,
  });
}

export async function update(params) {
  return request(`/iwms-facility/facility/bookbill/modify`, {
    method: 'POST',
    body: params,
  });
}

export async function get(param) {
  return request(`/iwms-facility/facility/bookbill/${param.uuid}`);
}

export async function getByBillNumber(param) {
  return request(`/iwms-facility/facility/bookbill/${param.billNumber}/get?dcUuid=${param.dcUuid}`);
}

export async function remove(payload) {
  return request(`/iwms-facility/facility/bookbill/${payload.uuid}/remove?version=${payload.version}`, {
    method: 'POST'
  });
}

export async function audit(payload) {
  return request(`/iwms-facility/facility/bookbill/${payload.uuid}/audit?version=${payload.version}`, {
    method: 'POST'
  });
}

export async function abort(payload) {
  return request(`/iwms-facility/facility/bookbill/${payload.uuid}/abort?version=${payload.version}`, {
    method: 'POST'
  });
}

export async function getByBookDateAndDockGroupUuid(payload) {
  return request(`/iwms-facility/facility/bookbill/ByBookDateAndDockGroupUuid?bookDate=${payload.bookDate}&dockGroupUuid=${payload.dockGroupUuid}`);
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/bookbill/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/bookbill/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}
