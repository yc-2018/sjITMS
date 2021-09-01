import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function save(payload) {
  return request(`/iwms-facility/facility/serialarch`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-facility/facility/stockTakePlan`, {
    method: 'PUT',
    body: payload,
  });
}

export async function getSerialArchByUuid(payload) {
  return request(`/iwms-facility/facility/serialarch/byuuid?${stringify(payload)}`);
}

export async function deletePlan(payload) {
  return request(`/iwms-facility/facility/stockTakePlan/?${stringify(payload)}`, {
    method: 'DELETE',
  });
}

export async function query(payload) {
  return request(`/iwms-facility/facility/serialarch/bycompany?companyUuid=` + loginCompany().uuid);
}

export async function querySerialArchLines(payload) {
  return request(`/iwms-facility/facility/serialarch/line/bycompany?companyUuid=` + loginCompany().uuid);
}

export async function finish(payload) {
  return request(`/iwms-facility/facility/stockTakePlan/finish/?${stringify(payload)}`, {
    method: 'POST'
  });
}

export async function generateTakeBill(payload) {
  return request(`/iwms-facility/facility/stockTakePlan/generateTakeBill/?${stringify(payload)}`, {
    method: 'POST'
  });
}
export async function queryNotExistInLineStores(payload) {
  return request(`/iwms-facility/facility/serialarch/line/stores`, {
    method: 'POST',
    body: payload
  });
}

export async function saveLine(payload) {
  return request(`/iwms-facility/facility/serialarch/line`, {
    method: 'POST',
    body: payload,
  });
}
export async function removeLine(payload) {
  return request(`/iwms-facility/facility/serialarch/line?${stringify(payload)}`, {
    method: 'DELETE',
  });
}
export async function removeSerialArch(payload) {
  return request(`/iwms-facility/facility/serialarch/byuuid?${stringify(payload)}`, {
    method: 'DELETE',
  });
}
export async function modifyLine(payload) {
  return request(`/iwms-facility/facility/serialarch/line`, {
    method: 'PUT',
    body: payload,
  });
}
export async function modifyArch(payload) {
  return request(`/iwms-facility/facility/serialarch`, {
    method: 'PUT',
    body: payload,
  });
}
export async function getLinesByArchCode(payload) {
  return request(`/iwms-facility/facility/serialarch/line/byarchuuid?${stringify(payload)}`);
}
export async function getStoresByArchLineUuid(payload) {
  return request(`/iwms-facility/facility/serialarch/linestores?lineUuid=${payload.lineUuid}`);
}
export async function getLine_ByUuid(payload) {
  return request(`/iwms-facility/facility/serialarch/line/byuuid?${stringify(payload)}`);
}
export async function saveLineStore(payload) {
  return request(`/iwms-facility/facility/serialarch/linestore`, {
    method: 'POST',
    body: payload,
  });
}
export async function removeLineStore(payload) {
  return request(`/iwms-facility/facility/serialarch/linestore?lineUuid=${payload.lineUuid}`, {
    method: 'DELETE',
    body: payload.storeUuids,
  });
}
export async function sort(payload) {
  return request(`/iwms-facility/facility/serialarch/linestore/sort`, {
    method: 'POST',
    body: { startData: payload.startData, endData: payload.endData },
  });
}

export async function batchImport(payload) {
  return request(`/iwms-facility/facility/serialarch/batchimport?serialArchUuid=${payload.serialArchUuid}&companyUuid=${payload.companyUuid}&fileKey=${payload.fileKey}`, {
    method: 'POST',
  });
}