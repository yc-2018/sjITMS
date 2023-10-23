/*
 * @Author: Liaorongchang
 * @Date: 2022-06-01 16:01:34
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-10-23 14:47:48
 * @version: 1.0
 */
import { func } from 'prop-types';
import request from '@/utils/request';
import { loginOrg, loginCompany } from '@/utils/LoginContext';

export async function findSourceTree() {
  return request(
    `/itms-cost/itms-cost/source/findAllSource?companyUuid=${loginCompany().uuid}&&dcUuid=${
      loginOrg().uuid
    }`,
    {
      method: 'GET',
    }
  );
}

export async function getAllSource() {
  return request(`/itms-cost/itms-cost/newSource/getAllSource?dcUuid=${loginOrg().uuid}`, {
    method: 'GET',
  });
}

export async function getSourceTree() {
  return request(`/itms-cost/itms-cost/source/getSourceTree?bmsUuid=${loginOrg().uuid}`, {
    method: 'GET',
  });
}

export async function deleteSourceTree(uuid) {
  return request(`/itms-cost/itms-cost/source/deleteSourceTree/${uuid}`, {
    method: 'POST',
  });
}

export async function getTableInfo(tablename) {
  return request(`/itms-cost/itms-cost/source/getTableInfo/${tablename}`, {
    method: 'GET',
  });
}

export async function getTableInfoNew(tableName, database) {
  return request(
    `/itms-schedule/itms-schedule/dev/parseSql?tableName=${tableName}&database=${database}`,
    {
      method: 'POST',
    }
  );
}

export async function getUnAddInfo(payload) {
  return request(
    `/itms-cost/itms-cost/source/getUnAddInfo/${payload.tableName}/${payload.formUuid}`,
    {
      method: 'GET',
    }
  );
}

export async function getNewUnAddInfo(payload) {
  return request(
    `/itms-cost/itms-cost/newSource/getUnAddInfo/${payload.tableName}/${payload.database}/${
      payload.formUuid
    }`,
    {
      method: 'GET',
    }
  );
}

export async function addDtl(payload) {
  return request(`/itms-cost/itms-cost/source/addDtl/${payload.formUuid}`, {
    method: 'POST',
    body: payload.params,
  });
}

export async function updateDtl(payload) {
  return request(`/itms-cost/itms-cost/source/updateDtl`, {
    method: 'POST',
    body: payload,
  });
}

export async function batchImport(payload) {
  return request(
    `/itms-cost/itms-cost/source/batchImport?sourceUuid=${payload.sourceUuid}&fileKey=${
      payload.fileKey
    }&importType=${payload.importType}`,
    {
      method: 'POST',
    }
  );
}

export async function onSaveSourceData(payload) {
  return request(`/itms-cost/itms-cost/source/onSaveSourceData`, {
    method: 'POST',
    body: payload,
  });
}

export async function newOnSave(payload, type) {
  return request(`/itms-cost/itms-cost/newSource/onSaveSourceData/${type}`, {
    method: 'POST',
    body: payload,
  });
}

export async function deleteSourceData(payload) {
  return request(`/itms-cost/itms-cost/source/deleteSourceData`, {
    method: 'POST',
    body: payload,
  });
}

export async function sourceConfirm(payload) {
  return request(`/itms-cost/itms-cost/newSource/sourceConfirm`, {
    method: 'POST',
    body: payload,
  });
}

export async function sourceAbnormal(sourceUuid) {
  return request(`/itms-cost/itms-cost/newSource/sourceAbnormal/${sourceUuid}`, {
    method: 'POST',
  });
}

export async function remind(sourceUuid) {
  return request(`/itms-cost/itms-cost/newSource/remind/${sourceUuid}`, {
    method: 'GET',
  });
}

export async function getDataColumns() {
  return request(`/itms-cost/itms-cost/newSource/getDataColumns`, {
    method: 'GET',
  });
}

export async function sortDateSourceTree(payload) {
  return request(`/itms-cost/itms-cost/newSource/sortDateSourceTree`, {
    method: 'POST',
    body: payload,
  });
}
