import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function getByUuid(payload) {
    return request(`/iwms-facility/facility/stocktake?uuid=${payload}`);
}
export async function getByBillNumber(payload) {
    return request(`/iwms-facility/facility/stocktake/billnumber?billNumber=${payload.billNumber}&dcUuid=${payload.dcUuid}`);
}

export async function query(payload) {
    return request(`/iwms-facility/facility/stocktake/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function modifyStockTaker(payload) {
    return request(`/iwms-facility/facility/stocktake/modify/taker?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST',
        body: payload.taker
    });
}

export async function modifyStockTakeMethod(payload) {
    return request(`/iwms-facility/facility/stocktake/modify/method?uuid=${payload.uuid}&version=${payload.version}&method=${payload.method}`, {
        method: 'POST'
    });
}

export async function modifyStockTakeSchema(payload) {
    return request(`/iwms-facility/facility/stocktake/modify/schema?uuid=${payload.uuid}&version=${payload.version}&schema=${payload.schema}`, {
        method: 'POST'
    });
}

export async function snap(payload) {
    return request(`/iwms-facility/facility/stocktake/snap?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    });
}

export async function check(payload) {
    return request(`/iwms-facility/facility/stocktake/take`, {
        method: 'POST',
        body: payload
    }, true);
}

export async function finish(payload) {
    return request(`/iwms-facility/facility/stocktake/finish?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    }, true);
}

export async function repeatTake(payload) {
    return request(`/iwms-facility/facility/stocktake/repeattake?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    });
}

export async function abort(payload) {
    return request(`/iwms-facility/facility/stocktake/abort?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    });
}

export async function queryCheckByItemUuid(payload) {
    return request(`/iwms-facility/facility/stocktake/list/check?itemUuid=${payload}`);
}

export async function previousBill(payload) {
  return request(`/iwms-facility/facility/stocktake/getLastByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}

export async function nextBill(payload) {
  return request(`/iwms-facility/facility/stocktake/getNextByBillNumber/?billNumber=${payload}&dcUuid=${loginOrg().uuid}`);
}
