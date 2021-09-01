import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function query(payload) {
  return request(`/iwms-basic/basic/classgroup/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function get(payload) {
  return request(`/iwms-basic/basic/classgroup/${payload}?companyUuid=${loginCompany().uuid}`, {
    method: 'GET',
  });
}

export async function offline(payload) {
  return request(`/iwms-basic/basic/classgroup/${payload.uuid}/disable?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function online(payload) {
  return request(`/iwms-basic/basic/classgroup/${payload.uuid}/enable?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function save(payload) {
  return request(`/iwms-basic/basic/classgroup`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-basic/basic/classgroup/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function remove(payload) {
  return request(`/iwms-basic/basic/classgroup/${payload.uuid}`, {
    method: 'DELETE',
  });
}

export async function getClassGroupUserByUuid(payload) {
  return request(`/iwms-basic/basic/classgroup/getClassGroupUserByUuid?uuid=${payload}`, {
    method: 'GET',
  });
}

export async function modifyClassGroupUser(payload) {
  return request(`/iwms-basic/basic/classgroup/modifyClassGroupUser`, {
    method: 'POST',
    body: payload,
  });
}

export async function deleteClassGroupUser(payload) {
  return request(`/iwms-basic/basic/classgroup/deleteClassGroupUser?uuid=${payload}`, {
    method: 'POST',
  });
}

export async function modifyClassGroupVehicle(payload) {
  return request(`/iwms-basic/basic/classgroup/modifyClassGroupVehicle`, {
    method: 'POST',
    body: payload,
  });
}

export async function deleteClassGroupVehicle(payload) {
  return request(`/iwms-basic/basic/classgroup/deleteClassGroupVehicle?uuid=${payload}`, {
    method: 'POST',
  });
}

export async function modifyClassGroupCustomer(payload) {
  return request(`/iwms-basic/basic/classgroup/modifyClassGroupCustomer`, {
    method: 'POST',
    body: payload,
  });
}

export async function deleteClassGroupCustomer(payload) {
  return request(`/iwms-basic/basic/classgroup/deleteClassGroupCustomer?uuid=${payload}`, {
    method: 'POST',
  });
}

export async function getByCode(payload) {
  return request(`/iwms-basic/basic/classgroup/getByCompanyUuidAndCode?code=${payload.code}&companyUuid=${loginCompany().uuid}`, {
    method: 'GET',
  });
}
