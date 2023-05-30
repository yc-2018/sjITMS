/*
 * @Author: Liaorongchang
 * @Date: 2023-03-28 17:24:04
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-03-28 17:39:07
 * @version: 1.0
 */
import request from '@/utils/request';
import { loginOrg } from '@/utils/LoginContext';

export async function updateVehicleShipArea(shipAreaUuid) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/vehicle/updateVehicleShipArea?dispatchCenterUuid=${
      loginOrg().uuid
    }&shipAreaUuid=${shipAreaUuid}`,
    {
      method: 'POST',
    }
  );
}
