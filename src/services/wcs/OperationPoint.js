import request from '@/utils/request';

export async function queryOperationPoint(payload) {
  return request(`/ips-archive-server/dps/jobpoint/query`, {
    method: 'POST',
    body: payload,
  });
}

export async function removeOperationPoint(payload) {
  return request(`/ips-archive-server/dps/jobpoint/remove?uuid=${payload.uuid}`, {
    method: 'DELETE',
  });
}

export async function removeGateway(payload) {
  return request(`/ips-archive-server/dps/jobpoint/removecontroller?controlleruuid=${payload.uuid}&jobpointuuid=${payload.jobpointuuid}`, {
    method: 'DELETE',
  });
}

export async function queryGateway(payload) {
  return request(`/ips-archive-server/dps/jobpoint/querycontrollers`, {
    method: 'POST',
    body: payload,
  });
}

export async function addGateway(payload) {
  return request(`/ips-archive-server/dps/jobpoint/addcontrollers?controlleruuids=${payload.controlleruuids}&jobpointuuid=${payload.uuid}`, {
    method: 'POST'
  });
}

export async function addOperationPoint(payload) {
  return request(`/ips-archive-server/dps/jobpoint/save`, {
    method: 'POST',
    body: payload
  });
}

export async function queryArea(payload) {
  return request(`/ips-archive-server/dps/area/query`, {
    method: 'POST',
    body: payload,
  });
}

export async function removeArea(payload) {
  return request(`/ips-archive-server/dps/area/removebyuuid?uuid=${payload.uuid}`, {
    method: 'DELETE',
  });
}

export async function addArea(payload) {
  return request(`/ips-archive-server/dps/area/save`, {
    method: 'POST',
    body: payload
  });
}

export async function querySection(payload) {
  return request(`/ips-archive-server/dps/section/query`, {
    method: 'POST',
    body: payload,
  });
}

export async function removeSection(payload) {
  return request(`/ips-archive-server/dps/section/removebyuuid?uuid=${payload.uuid}`, {
    method: 'DELETE',
  });
}

export async function addSection(payload) {
  return request(`/ips-archive-server/dps/section/save`, {
    method: 'POST',
    body: payload
  });
}

export async function queryNode(payload) {
  return request(`/ips-archive-server/dps/facilityequipment/query`, {
    method: 'POST',
    body: payload,
  });
}

export async function removeNode(payload) {
  return request(`/ips-archive-server/dps/facilityequipment/remove?equipmentuuid=${payload.uuid}`, {
    method: 'DELETE',
  });
}

export async function addNode(payload) {
  return request(`/ips-archive-server/dps/facilityequipment/save`, {
    method: 'POST',
    body: payload
  });
}

export async function queryBin(payload) {
  return request(`/ips-archive-server/dps/bin/query`, {
    method: 'POST',
    body: payload,
  });
}

export async function removeBin(payload) {
  return request(`/ips-archive-server/dps/bin/removebyuuid?uuid=${payload.uuid}`, {
    method: 'DELETE',
  });
}

export async function editBin(payload) {
  return request(`/ips-archive-server/dps/bin/save`, {
    method: 'POST',
    body: payload
  });
}

export async function addBin(payload) {
  return request(`/ips-archive-server/dps/bin/batchadd`, {
    method: 'POST',
    body: payload,
  });
}

export async function getTag(payload) {
  return request(`/ips-archive-server/dps/jobpoint/getcontrollersbyuuid?uuid=${payload.uuid}`);
}

export async function getOperationPoint(payload) {
  return request(`/ips-archive-server/dps/jobpoint/getByUuid?uuid=${payload.uuid}`);
}

export async function getArea(payload) {
  return request(`/ips-archive-server/dps/area/getbyuuid?uuid=${payload.uuid}`);
}

export async function getSection(payload) {
  return request(`/ips-archive-server/dps/section/getByUuid?uuid=${payload.uuid}`);
}

export async function queryList(payload) {
  return request(`/ips-archive-server/dps/facility/querylist?companyuuid=${payload.companyuuid}&dcuuid=${payload.dcuuid}&facilitycls=${payload.facilitycls}&facilityuuid=${payload.facilityuuid}`);
}
