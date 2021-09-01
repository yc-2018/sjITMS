import request from '@/utils/request';
import { loginOrg } from '@/utils/LoginContext';

export async function getByUserUuidAndDispatchCenterUuid(payload) {
  return request(`/iwms-basic/basic/userprofession/getByUserUuidAndDispatchCenterUuid/?userUuid=${payload}&dispatchCenterUuid=${loginOrg().uuid}`, {
    method: 'GET',
  });
}

export async function save(payload) {
  return request(`/iwms-basic/basic/userprofession`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-basic/basic/userprofession/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function remove(payload) {
  return request(`/iwms-basic/basic/userprofession/?uuid=${payload.uuid}`, {
    method: 'DELETE',
  });
}

export async function query(payload) {
  return request(`/iwms-basic/basic/userprofession/page`, {
    method: 'POST',
    body: payload,
  });
}