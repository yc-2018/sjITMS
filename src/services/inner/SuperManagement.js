import request from '@/utils/request';
import { loginOrg } from '@/utils/LoginContext';

export async function query(payload) {
    return request(`/iwms-facility/facility/supermanagement/page`, {
      method: 'POST',
      body: payload,
    });
}

export async function remove(payload) {
  return request(`/iwms-facility/facility/supermanagement/${payload.uuid}?version=${payload.version}`, {
    method: 'DELETE',
  });
}

export async function add(payload) {
  return request(`/iwms-facility/facility/supermanagement`, {
    method: 'POST',
    body: payload,
  });
}


export async function get(payload) {
  return request(`/iwms-facility/facility/supermanagement/${payload}`);
}


export async function update(payload) {
  return request(`/iwms-facility/facility/supermanagement/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function inValid(payload) {
  return request(`/iwms-facility/facility/supermanagement/${payload.uuid}/inValid?version=${payload.version}`, {
    method: 'POST',
  });
}

export async function queryValid(payload) {
  return request(`/iwms-facility/facility/supermanagement/queryValid?dcUuid=${loginOrg().uuid}&type=${payload.type}`, {
    method: 'POST',
    body: payload,
  });
}