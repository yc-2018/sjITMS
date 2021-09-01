import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany,loginOrg } from '@/utils/LoginContext';

//----- 集货位管理方案-------------
export async function getByDcUuid(payload) {
  return request(`/iwms-facility/facility/collectBinScheme/queryByDcUuid?dcUuid=${payload.dcUuid}`, {
    method: 'GET',
  });
}

export async function getByCodeAndDcUuid(payload) {
  return request(`/iwms-facility/facility/collectBinScheme/${payload.code}/get?dcUuid=${payload.dcUuid}`, {
    method: 'GET',
  });
}

export async function save(payload){
  return request(`/iwms-facility/facility/collectBinScheme`, {
    method: 'POST',
    body:payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-facility/facility/collectBinScheme/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function remove(payload) {
  return request(`/iwms-facility/facility/collectBinScheme/${payload.uuid}?version=${payload.version}`, {
    method: 'DELETE',
  });
}

export async function query(payload) {
  return request(`/iwms-facility/facility/collectBinScheme/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function get(payload) {
  return request(`/iwms-facility/facility/collectBinScheme/${payload.uuid}`, {
    method: 'GET',
  });
}
