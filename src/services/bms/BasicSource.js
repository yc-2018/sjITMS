/*
 * @Author: Liaorongchang
 * @Date: 2022-06-01 16:01:34
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-11-14 15:15:38
 * @version: 1.0
 */
import { func } from 'prop-types';
import request from '@/utils/request';
import { loginOrg, loginCompany } from '@/utils/LoginContext';

//新
export async function getAllSource() {
  return request(`/bms-cost/bms-cost/newSource/getAllSource?dcUuid=${loginOrg().uuid}`, {
    method: 'GET',
  });
}

export async function addDtl(payload) {
  return request(`/bms-cost/bms-cost/source/addDtl/${payload.formUuid}`, {
    method: 'POST',
    body: payload.params,
  });
}

//新
export async function getSourceTree() {
  return request(`/bms-cost/bms-cost/source/getSourceTree?bmsUuid=${loginOrg().uuid}`, {
    method: 'GET',
  });
}

export async function newBatchImport(payload) {
  return request(
    `/bms-cost/bms-cost/source/batchImport?sourceUuid=${payload.sourceUuid}&fileKey=${
      payload.fileKey
    }&importType=${payload.importType}&importMonth=${payload.importMonth}`,
    {
      method: 'POST',
    }
  );
}

//混
export async function deleteSourceTree(uuid) {
  return request(`/bms-cost/bms-cost/source/deleteSourceTree/${uuid}`, {
    method: 'POST',
  });
}

//新
export async function getTableInfoNew(tableName, database) {
  return request(
    `/itms-schedule/itms-schedule/dev/parseSql?tableName=${tableName}&database=${database}`,
    {
      method: 'POST',
    }
  );
}

//新
export async function getNewUnAddInfo(payload) {
  return request(
    `/bms-cost/bms-cost/newSource/getUnAddInfo/${payload.tableName}/${payload.database}/${
      payload.formUuid
    }`,
    {
      method: 'GET',
    }
  );
}

//混
export async function updateDtl(payload) {
  return request(`/bms-cost/bms-cost/source/updateDtl`, {
    method: 'POST',
    body: payload,
  });
}

//新
export async function newOnSave(payload, type) {
  return request(`/bms-cost/bms-cost/newSource/onSaveSourceData/${type}`, {
    method: 'POST',
    body: payload,
  });
}
//混
export async function deleteSourceData(payload) {
  return request(`/bms-cost/bms-cost/source/deleteSourceData`, {
    method: 'POST',
    body: payload,
  });
}
//新
export async function sourceConfirm(payload) {
  return request(`/bms-cost/bms-cost/newSource/sourceConfirm`, {
    method: 'POST',
    body: payload,
  });
}
//新
export async function sourceAbnormal(sourceUuid) {
  return request(`/bms-cost/bms-cost/newSource/sourceAbnormal/${sourceUuid}`, {
    method: 'POST',
  });
}
//新
export async function remind(sourceUuid) {
  return request(`/bms-cost/bms-cost/newSource/remind/${sourceUuid}`, {
    method: 'GET',
  });
}
//新
export async function getDataColumns() {
  return request(`/bms-cost/bms-cost/newSource/getDataColumns`, {
    method: 'GET',
  });
}
//新
export async function sortDateSourceTree(payload) {
  return request(`/bms-cost/bms-cost/newSource/sortDateSourceTree`, {
    method: 'POST',
    body: payload,
  });
}
//新
export async function queryData(payload, sourceUuid) {
  return request(`/bms-cost/bms-cost/newSource/queryData/${sourceUuid}`, {
    method: 'POST',
    body: payload,
  });
}
