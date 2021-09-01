import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function query(payload) {
  return request(`/iwms-facility/facility/receiveConfig/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function save(payload) {
  return request(`/iwms-facility/facility/receiveConfig`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-facility/facility/receiveConfig/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function remove(payload) {
  return request(`/iwms-facility/facility/receiveConfig/delete?uuid=${payload.uuid}`);
}

export async function get(uuid) {
  return request(`/iwms-facility/facility/receiveConfig/${uuid}`);
}

export async function getByDockGroupUuid(dockGroupUuid) {
  return request(`/iwms-facility/facility/receiveConfig/getByDockGroupUuid?dockGroupUuid=${dockGroupUuid}`);
}
