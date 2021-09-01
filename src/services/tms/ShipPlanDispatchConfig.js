import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany } from '@/utils/LoginContext';

export async function get(param) {
    return request(`/iwms-facility/facility/shipplandispatchconfig?companyUuid=${loginCompany().uuid}`);
}
  

export async function save(payload) {
    return request(`/iwms-facility/facility/shipplandispatchconfig?companyUuid=${loginCompany().uuid}`, {
        method: 'POST',
        body: payload,
    });
}