import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function get(payload) {
    return request(`/iwms-facility/facility/collectbinreviewshipconfig/${payload.dcUuid}`);
}


export async function modify(payload) {
    return request(`/iwms-facility/facility/collectbinreviewshipconfig?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}&reviewResultShip=${payload}`, {
        method: 'POST',
    });
}