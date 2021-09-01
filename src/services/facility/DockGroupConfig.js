import request from '@/utils/request';

export async function queryByDc(payload) {
  return request(`/iwms-facility/facility/dockGroupConfig/queryByDc?dcUuid=${payload.dcUuid}`, {
    method: 'GET',
  });
}

export async function queryByDcUuid(payload) {
  return request(`/iwms-facility/facility/dockGroupConfig/queryByDcUuid?dcUuid=${payload.dcUuid}`, {
    method: 'GET',
  });
}

export async function save(payload) {
  return request(`/iwms-facility/facility/dockGroupConfig`, {
    method: 'POST',
    body: payload,
  });
}

export async function query(payload) {
  return request(`/iwms-facility/facility/dockGroupConfig/page`, {
    method: 'POST',
    body: payload,
  });
}

export async function remove(payload) {
  return request(`/iwms-facility/facility/dockGroupConfig/${payload.uuid}?version=${payload.version}`, {
    method: 'DELETE',
  });
}

export async function saveCollectBinRange(payload) {
  return request(`/iwms-facility/facility/dockGroupConfig/saveCollectBinRange`, {
    method: 'POST',
    body: payload
  });
}

export async function removeDockConfigCollectBinRange(payload) {
  return request(`/iwms-facility/facility/dockGroupConfig/removeDockConfigCollectBinRange/${payload.uuid}`, {
    method: 'DELETE'
  });
}

export async function queryCollectBins(payload) {
  return request(`/iwms-facility/facility/dockGroupConfig/queryByDc?dcUuid=${payload.dcUuid}`);
}

export async function queryCollectBinPage(payload) {
  return request(`/iwms-facility/facility/dockGroupConfig/queryCollectBinPage`, {
    method: 'POST',
    body: payload,
  });
}
