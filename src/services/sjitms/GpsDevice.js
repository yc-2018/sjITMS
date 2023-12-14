/*
 * @Author: guankongjin
 * @Date: 2023-10-16 08:59:17
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-12-14 11:22:26
 * @Description: file content
 * @FilePath: \iwms-web\src\services\sjitms\GpsDevice.js
 */
import request from '@/utils/request';

export async function shift(gpsNos, truckId, truckNo) {
  return request(`/itms-schedule/itms-schedule/g7/deivce/shift?gpsNos=${gpsNos}&truckId=${truckId}&truckNo=${truckNo}`,
    {
      method: 'POST'
    });
}

export async function split(gpsNos) {
  return request(`/itms-schedule/itms-schedule/g7/deivce/split?gpsNos=${gpsNos}`,
    {
      method: 'POST'
    });
}

export async function switchDevice(gpsNos, subGpsNos) {
  return request(`/itms-schedule/itms-schedule/g7/deivce/switchDevice?gpsNos=${gpsNos}&subGpsNos=${subGpsNos}`,
    {
      method: 'POST'
    });
}

export async function syncDevice(gpsNos) {
  return request(`/itms-schedule/itms-schedule/g7/deivce/syncDevice?gpsNos=${gpsNos}`,
    {
      method: 'POST'
    });
}

export async function saveServiceDate(gpsNos, type, serviceDate) {
  return request(`/itms-schedule/itms-schedule/g7/deivce/saveServiceDate?gpsNos=${gpsNos}&type=${type}&serviceDate=${serviceDate}`,
    {
      method: 'POST'
    });
}