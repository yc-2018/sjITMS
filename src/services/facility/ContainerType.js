import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function save(payload) {
    return request(`/iwms-facility/facility/containertype`, {
      method: 'POST',
      body: payload,
    });
}

export async function modify(payload) {
    return request(`/iwms-facility/facility/containertype/modify`, {
      method: 'POST',
      body: payload,
    });
}

export async function query(payload) {
    return request(`/iwms-facility/facility/containertype/page`, {
      method: 'POST',
      body: payload,
    });
}

export async function get(payload) {
    return request(`/iwms-facility/facility/containertype/${payload}`);
}

export async function getByBarCodePrefix(payload) {
    return request(`/iwms-facility/facility/containertype/getByBarCodePrefix?barCodePrefix=${payload.barCodePrefix}&companyUuid=${loginCompany().uuid}`);
}

export async function getByCompanyAndDc(payload) {
    return request(`/iwms-facility/facility/containertype/getByCompanyAndDc?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}`);
}

export async function getByCode(payload) {
  return request(`/iwms-facility/facility/containertype/getByCode?code=${payload.code}&companyUuid=${payload.companyUuid}&dcUuid=${payload.dcUuid}`);
}

export async function remove(payload) {
    return request(`/iwms-facility/facility/containertype/remove/${payload}`,{
      method: 'POST'
    });
}

