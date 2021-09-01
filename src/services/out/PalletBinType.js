import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function save(payload) {
    return request(`/iwms-facility/facility/palletbintype`, {
      method: 'POST',
      body: payload,
    });
}

export async function modify(payload) {
    return request(`/iwms-facility/facility/palletbintype/modify`, {
      method: 'POST',
      body: payload,
    });
}

export async function query(payload) {
    return request(`/iwms-facility/facility/palletbintype/page`, {
      method: 'POST',
      body: payload,
    });
}

export async function get(payload) {
    return request(`/iwms-facility/facility/palletbintype/${payload}`);
}

export async function getByBarCodePrefix(payload) {
    return request(`/iwms-facility/facility/palletbintype/getByBarCodePrefix?barCodePrefix=${payload.barCodePrefix}&companyUuid=${loginCompany().uuid}`);
}

export async function getByCompanyAndDc(payload) {
    return request(`/iwms-facility/facility/palletbintype/getByCompanyAndDc?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}`);
}

export async function getByCode(payload) {
  return request(`/iwms-facility/facility/palletbintype/getByCode?code=${payload}&companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}`);
}

export async function remove(payload) {
    return request(`/iwms-facility/facility/palletbintype/remove/${payload}`,{
      method: 'POST'
    });
}

