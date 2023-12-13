import request from '@/utils/request';

export async function query(payload) {
  return request(`/iwms-facility/facility/dispatcherconfig/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function add(payload) {
  return request(`/iwms-facility/facility/dispatcherconfig`, {
    method: 'POST',
    body: payload,
  });
}

export async function remove(uuid) {
  return request(`/iwms-facility/facility/dispatcherconfig/${uuid}`, {
    method: 'DELETE',
  });
}

export async function queryPlanConfig(payload) {
  return request(`/iwms-basic/basic/planConfig/page`, {
    method: 'POST',
    body: payload,
  });
}
export async function update(payload) {
  return request(`/iwms-basic/basic/planConfig/update`, {
    method: 'POST',
    body: payload,
  });
}
export async function insert(payload) {
  return request(`/iwms-basic/basic/planConfig/insert`, {
    method: 'POST',
    body: payload,
  });
}

export async function getByCompanyUuid(payload) {
  return request(`/iwms-basic/basic/dispatchcenter/getByCompanyUuid?companyUuid=${payload}`, {
    method: 'GET',
  });
}

export async function getByDispatchcenterUuid(payload) {
  return request(`/iwms-basic/basic/planConfig/getByDispatchcenterUuid/${payload}`, {
    method: 'POST',
  });
}

export async function queryDispatchConfig(payload) {
  return request(`/iwms-basic/basic/dispatcherConfig/page`, {
    method: 'POST',
    body: payload,
  });
}
export async function updateDispatchConfig(payload) {
  return request(`/iwms-basic/basic/dispatcherConfig/update`, {
    method: 'POST',
    body: payload,
  });
}
export async function insertDispatchConfig(payload) {
  return request(`/iwms-basic/basic/dispatcherConfig/insert`, {
    method: 'POST',
    body: payload,
  });
}

export async function getDispatchConfig(payload) {
  return request(`/iwms-basic/basic/dispatcherConfig/getByDispatchCenterUuid/${payload}`, {
    method: 'POST',
  });
}
