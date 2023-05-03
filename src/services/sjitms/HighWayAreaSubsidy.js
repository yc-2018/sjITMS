/*
 * @Author: Liaorongchang
 * @Date: 2023-05-03 10:28:30
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-05-03 15:02:08
 * @version: 1.0
 */
import request from '@/utils/request';

export async function updateSerialnumber(COMPANYUUID, DISPATCHCENTERUUID, AREAGROUPUUID) {
  return request(
    `/itms-schedule/itms-schedule/sj/highWayAreaSubsidy/updateSerialnumber?companyUuid=${COMPANYUUID}&dispatchCenterUuid=${DISPATCHCENTERUUID}&areaGroupUuid=${AREAGROUPUUID}`,
    {
      method: 'POST',
    }
  );
}
