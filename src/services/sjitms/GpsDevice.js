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

export async function switchDevice(gpsNos) {
  return request(`/itms-schedule/itms-schedule/g7/deivce/switchDevice?gpsNos=${gpsNos}`,
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