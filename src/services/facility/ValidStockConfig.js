import request from '@/utils/request';
import { loginOrg } from '@/utils/LoginContext';

export async function save(payload) {
    return request(`/iwms-facility/facility/validStockConfig`, {
        method: 'POST',
        body: payload,
    });
}

export async function getByDCUuid(payload) {
    return request(`/iwms-facility/facility/validStockConfig/getByDCUuid?dcUuid=${loginOrg().uuid}`);
}
