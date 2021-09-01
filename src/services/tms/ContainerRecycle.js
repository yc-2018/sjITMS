import request from '@/utils/request';
import { loginOrg, loginUser, loginCompany } from '@/utils/LoginContext';
export async function query(payload) {
    return request(`/iwms-facility/facility/containerrecycle/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function get(payload) {
    return request(`/iwms-facility/facility/containerrecycle?uuid=${payload}`);
}

export async function getByStoreCode(payload) {
  return request(`/iwms-facility/facility/containerrecycle/getByStoreCode?storeCode=${payload}&fromOrgUuid=${loginOrg().uuid}&companyUuid=${loginCompany().uuid}&createOrgUuid=${loginOrg().type}`);
}

export async function recycleByQty(payload) {
    return request(`/iwms-facility/facility/containerrecycle/recycle/qty`, {
        method: 'POST',
        body: payload,
    });
}

export async function recycleByBarcode(payload) {
    return request(`/iwms-facility/facility/containerrecycle/recycle/barcode`, {
        method: 'POST',
        body: payload,
    });
}

export async function recycleByStores(payload) {
    return request(`/iwms-facility/facility/containerrecycle/recycle/store?storeUuid=${payload.storeUuid}&companyUuid=${payload.companyUuid}&fromOrgUuid=${payload.fromOrgUuid}`, {
        method: 'POST'
    });
}
