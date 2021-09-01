import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import moment from 'moment';

export async function query(payload) {
    return request(`/iwms-facility/facility/stockLock/page`, {
        method: 'POST',
        body: payload
    });
}
export async function queryLockStocksWithLock(payload) {
  return request(`/iwms-facility/facility/stockLock/stocks`, {
    method: 'POST',
    body: payload
  });
}

export async function get(payload) {
    return request(`/iwms-facility/facility/stockLock/${payload.uuid}`);
}


export async function getByBillNumber(payload) {
    return request(`/iwms-facility/facility/stockLock/${payload.billNumber}/get?dcUuid=${payload.dcUuid}`);
}

export async function audit(payload) {
    return request(`/iwms-facility/facility/stockLock/${payload.uuid}/audit?version=${payload.version}`, {
        method: 'POST'
    });
}

export async function save(payload) {
    return request(`/iwms-facility/facility/stockLock`, {
        method: 'POST',
        body: payload,
    });
}

export async function modify(payload) {
    return request(`/iwms-facility/facility/stockLock/modify`, {
        method: 'POST',
        body: payload,
    });
}


export async function saveAndApprove(payload) {
    return request(`/iwms-facility/facility/stockLock/saveAndAudit`, {
      method: 'POST',
      body: payload,
    });
  }

export async function remove(payload) {
    return request(`/iwms-facility/facility/stockLock/${payload.uuid}?version=${payload.version}`, {
        method: 'DELETE',
    });
}

export async function queryStocks(payload) {
    return request(`/iwms-facility/facility/stockLock/queryStock?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}
       &ownerUuid=${payload.ownerUuid}&articleUuid=${payload.articleUuid}`);
}

export async function queryArticles(payload) {
    return request(`/iwms-facility/facility/stockLock/queryArticle?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}
       &ownerUuid=${payload.ownerUuid}&articleCodeAndName=${payload.articleCodeAndName}`);
}

export async function queryLockStock(payload) {
    return request(`/iwms-facility/facility/stockLock/${payload.billNumber}/queryLockStock?companyUuid=${loginCompany().uuid}&dcUuid=${loginOrg().uuid}`);
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/stockLock/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/stockLock/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}
