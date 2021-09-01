import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function save(payload) {
  return request(`/iwms-facility/facility/containerTypeBindConfig`, {
    method: 'POST',
    body: payload,
  });
}

export async function listByDcUuid() {
  return request(`/iwms-facility/facility/containerTypeBindConfig/getByDcUuid?dcUuid=${loginOrg().uuid}`);
}

export async function get(payload) {
    return request(`/iwms-facility/facility/containerTypeBindConfig/getByDcUuid?dcUuid=${loginOrg().uuid}&containerTypeUuid=${payload.containerTypeUuid}&parentContainerTypeUuid=${payload.parentContainerTypeUuid}`);
}

export async function remove(payload) {
    return request(`/iwms-facility/facility/containerTypeBindConfig/delete?dcUuid=${loginOrg().uuid}&containerTypeUuid=${payload.containerTypeUuid}&parentContainerTypeUuid=${payload.parentContainerTypeUuid}`);
}

export async function query(payload) {
  return request(`/iwms-facility/facility/containerTypeBindConfig/page`, {
    method: 'POST',
    body: payload,
  });
}

