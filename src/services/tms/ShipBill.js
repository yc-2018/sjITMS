import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function query(payload) {
    return request(`/iwms-facility/facility/shipbill/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function queryUnShipItems(payload) {
    return request(`/iwms-facility/facility/shipbill/unShipItem?shipPlanBillNumber=${payload.shipPlanBillNumber}&companyUuid=${loginCompany().uuid}`, {
        method: 'POST'
    });
}

export async function pageQueryUnShipItem(payload) {
    return request(`/iwms-facility/facility/shipbill/unShipItem/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function get(payload) {
    return request(`/iwms-facility/facility/shipbill/${payload}`);
}

export async function getByBillNumber(payload) {
    return request(`/iwms-facility/facility/shipbill/bill/?billNumber=${payload.billNumber}&companyUuid=${loginCompany().uuid}`);
}

export async function save(payload) {
    return request(`/iwms-facility/facility/shipbill`, {
        method: 'POST',
        body: payload,
    });
}

export async function modify(payload) {
    return request(`/iwms-facility/facility/shipbill/modify`, {
        method: 'POST',
        body: payload,
    });
}

export async function audit(payload) {
    return request(`/iwms-facility/facility/shipbill/audit?billUuid=${payload.uuid}&version=${payload.version}`, {
        method: 'PUT'
    });
}

export async function remove(payload) {
    return request(`/iwms-facility/facility/shipbill/${payload.uuid}?version=${payload.version}`, {
        method: 'DELETE',
    });
}

export async function generateShipBill(payload) {
    return request(`/iwms-facility/facility/shipbill/generateShipBill?companyUuid=${loginCompany().uuid}`, {
        method: 'POST',
        body: payload,
    });
}

export async function queryVirtualUnShipItem(payload) {
    return request(`/iwms-facility/facility/shipbill/virtualUnShipItem/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function queryStockItem(payload) {
  return request(`/iwms-facility/facility/shipbill/queryStockItem`, {
    method: 'POST',
    body: payload,
  });
}

export async function queryUnShipItemsForShip(payload) {
  return request(`/iwms-facility/facility/shipbill/unShipItems?companyUuid=${loginCompany().uuid}&shipPlanBillNumber=${payload.shipPlanBillNumber}`);
}

export async function auditForShip(payload) {
  return request(`/iwms-facility/facility/shipbill/auditTms?billUuid=${payload.uuid}&version=${payload.version}`, {
    method: 'PUT'
  });
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/shipbill/getLastByBillNumber/?billNumber=${payload}&companyUuid=${loginCompany().uuid}&createOrgUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/shipbill/getNextByBillNumber/?billNumber=${payload}&companyUuid=${loginCompany().uuid}&createOrgUuid=${loginOrg().uuid}`);
}
