import { stringify } from 'qs';
import request from '@/utils/request';

export async function query(payload) {
  return request(`/ips-archive-server/dps/controller/query`, {
    method: 'POST',
    body: payload,
  });
}

export async function saveController(payload) {
  return request(`/ips-archive-server/dps/controller/save`, {
    method: 'POST',
    body: payload,
  });
}

export async function remove(payload) {
  return request(`/ips-archive-server/dps/controller/remove?uuid=${payload.uuid}`, {
    method: 'DELETE',
  });
}

export async function get(uuid) {
  return request(`/ips-archive-server/dps/controller/getbyuuid?uuid=${uuid}`);
}

export async function addTag(payload) {
  return request(`/ips-archive-server/dps/equipment/batchAdd`, {
    method: 'POST',
    body: payload,
  });
}

export async function removeTag(payload) {
  return request(`/ips-archive-server/dps/equipment/remove?uuid=${payload.uuid}`, {
    method: 'DELETE',
  });
}

export async function saveTag(payload) {
  return request(`/ips-archive-server/dps/equipment/save`, {
    method: 'POST',
    body: payload,
  });
}

export async function getTag(payload) {
  return request(`/ips-archive-server/dps/equipment/getbycontroller`, {
    method: 'POST',
    body: payload,
  });
}

export async function getOneTag(payload) {
  return request(`/ips-archive-server/dps/equipment/getbyaddressandcontroller?address=${payload.address}&controllerUuid=${payload.uuid}`);
}

export async function getLightStep(uuid) {
  return request(`/ips-archive-server/dps/lightstep/getbyuuid?uuid=${uuid}`);
}

export async function queryLightStep(payload) {
  return request(`/ips-archive-server/dps/lightstep/query`, {
    method: 'POST',
    body: payload,
  });
}

export async function removeLightStep(payload) {
  return request(`/ips-archive-server/dps/lightstep/remove?uuid=${payload.uuid}`, {
    method: 'DELETE',
  });
}

export async function saveLightStep(payload) {
  return request(`/ips-archive-server/dps/lightstep/save`, {
    method: 'POST',
    body: payload,
  });
}

export async function queryList(payload) {
  return request(`/ips-archive-server/dps/lightstep/querytree?dcuuid=${payload.dcuuid}&uuid=${payload.uuid}`);
}

