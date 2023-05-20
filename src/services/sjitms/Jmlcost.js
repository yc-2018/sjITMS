/*
 * @Author: qiuhui
 * @Date: 2023-05-19 10:28:30
 * @LastEditors: qiuhui
 * @LastEditTime: 2023-05-19 15:02:08
 * @version: 1.0
 */
import request from '@/utils/request';

export async function addNearStore(COMPANYUUID, DISPATCHCENTERUUID, storeCode, orderUuid, scheduleBillnumber) {
    return request(
        `/itms-schedule/itms-schedule/jmlCostApi/addNearStore/${COMPANYUUID}/${DISPATCHCENTERUUID}/${storeCode}/${orderUuid}/${scheduleBillnumber}`,
        {
            method: 'POST',
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

