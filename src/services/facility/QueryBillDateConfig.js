import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function save(payload) {
    return request(`/iwms-facility/facility/billfilterdaysconfig/saveOrUpdate`, {
        method: 'POST',
        body: payload,
    });
}

export async function getByCompanyUuidAndDcUuid() {
  return request(`/iwms-facility/facility/billfilterdaysconfig/getByCompanyUuidAndDcUuid?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}`);
}