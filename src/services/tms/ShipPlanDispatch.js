import request from '@/utils/request';
import { stringify } from 'qs';

export async function queryShipPlanDeliveryDispatch(payload) {
    return request(`/iwms-facility/facility/shipplandispatch/shipPlanDeliveryDispatch`, {
        method: 'POST',
        body: payload,
    });
}

export async function queryShipPlanDispatch(payload) {
    return request(`/iwms-facility/facility/shipplandispatch/shipPlanDispatch?${stringify(payload)}`
        , {
            method: 'POST'
        });
}

export async function queryShipPlanDeliveryTaskItem(payload) {
    return request(`/iwms-facility/facility/shipplandispatch/queryShipPlanDeliveryTaskItem?${stringify(payload)}`, {
        method: 'POST'
    });
}