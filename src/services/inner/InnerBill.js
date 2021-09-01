import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function getNext(payload) {
    return request(`/iwms-facility/facility/bill/${payload.billNumber}/next?dcUuid=${loginOrg().uuid}&type=${payload.type}&createOrgUuid=${loginOrg().uuid}&companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}`);
}

export async function getBefore(payload) {
    return request(`/iwms-facility/facility/bill/${payload.billNumber}/before?dcUuid=${loginOrg().uuid}&type=${payload.type}&createOrgUuid=${loginOrg().uuid}&companyUuid=${loginCompany().uuid}&dispatchCenterUuid=${loginOrg().uuid}`);
}
