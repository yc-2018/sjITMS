import {stringify} from 'qs';
import request from '@/utils/request';
import {loginCompany,loginOrg} from '@/utils/LoginContext';
export async function save(payload) {
  return request(`/iwms-facility/facility/inwrh`, {
    method: 'POST',
    body: payload,
  });
}
export async function outWrh(payload) {
  return request(`/iwms-facility/facility/inwrh/outWrh?billNumber=${payload.billNumber}&dcUuid=${loginOrg().uuid}`, {
    method: 'POST',
  });
}
export async function getByBillNumber(payload){
  return request(`/iwms-facility/facility/inwrh/getByBillNumber?dcUuid=${loginOrg().uuid}&inwrhBillNumber=${payload.inwrhBillNumber}`);
}
export async function get(payload){
  return request(`/iwms-facility/facility/inwrh/${payload}`);
}
export async function query(payload) {
  return request(`/iwms-facility/facility/inwrh/page`, {
    method: 'POST',
    body: payload,
  });
}
export async function assignDock(payload) {
  return request(`/iwms-facility/facility/inwrh/assignDock?dockUuids=${payload.dockUuids}&inwrhBillUuids=${payload.inwrhBillUuids}`, {
    method: 'POST',
  });
}
export async function cancelAssignDock(payload) {
  return request(`/iwms-facility/facility/inwrh/cancelAssignDock/${payload.uuid}?version=${payload.version}`, {
    method: 'POST',
  });
}
export async function abort(payload) {
  return request(`/iwms-facility/facility/inwrh/abort/${payload.uuid}?version=${payload.version}`, {
    method: 'POST',
  });
}
export async function getDetail(payload){
  return request(`/iwms-facility/facility/inwrh/${payload.uuid}`);
}
