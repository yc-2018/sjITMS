import request from '@/utils/request';
import { loginOrg, loginUser,loginCompany } from '@/utils/LoginContext';

export async function save(payload) {
    return request(`/iwms-basic/basic/wrh`, {
        method: 'POST',
        body: payload,
    });
}

export async function modify(payload) {
    return request(`/iwms-basic/basic/wrh/modify`, {
        method: 'POST',
        body: payload,
    });
}

export async function onLine(payload) {
    return request(`/iwms-basic/basic/wrh/${payload.uuid}/online?version=${payload.version}`, {
        method: 'POST',
    });
}

export async function offLine(payload) {
    return request(`/iwms-basic/basic/wrh/${payload.uuid}/offline?version=${payload.version}`, {
        method: 'POST',
    });
}

export async function get(payload) {
    return request(`/iwms-basic/basic/wrh?uuid=${payload}`);
}


export async function getByDcUuid(payload) {
    return request(`/iwms-basic/basic/wrh/dc?dcUuids=${payload}`);
}

export async function getByCodeAndDcUuid(payload) {
  return request(`/iwms-basic/basic/wrh/${payload.code}?dcUuid=${payload.dcUuid}`);
}

export async function query(payload) {
    return request(`/iwms-basic/basic/wrh/page`, {
      method: 'POST',
      body: payload,
    });
  }
