/*
 * @Author: qiuhui
 * @Date: 2023-05-19 10:28:30
 * @LastEditors: qiuhui
 * @LastEditTime: 2023-05-19 15:02:08
 * @version: 1.0
 */
import request from '@/utils/request';

export async function addNearStore(COMPANYUUID, DISPATCHCENTERUUID, storeCode, params) {
    return request(
        `/itms-schedule/itms-schedule/jmlCostApi/addNearStore/${COMPANYUUID}/${DISPATCHCENTERUUID}/${storeCode}`,
        {
            method: 'POST',
            body:params
        }
    );
}
export async function audits(costUuids) {
    return request(
        `/itms-schedule/itms-schedule/jmlCostApi/audits`,
        {
            method: 'POST',
            body: costUuids
        }
    );
}

export async function cancelAudits(costUuids) {
    return request(
        `/itms-schedule/itms-schedule/jmlCostApi/cancelAudits`,
        {
            method: 'POST',
            body: costUuids
        }
    );
}

