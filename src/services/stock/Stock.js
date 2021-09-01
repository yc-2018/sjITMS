import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function query(payload) {
    return request(`/iwms-facility/facility/stock/stocks`, {
        method: 'POST',
        body: payload
    });
}

export async function queryGroupedStock(payload) {
    return request(`/iwms-facility/facility/stock/stocks/aggregation`, {
        method: 'POST',
        body: payload
    });
}

export async function pageQuery(payload) {
    return request(`/iwms-facility/facility/stock/stocks/page`, {
        method: 'POST',
        body: payload
    });
}
