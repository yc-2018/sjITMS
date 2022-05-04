import request from '@/utils/request';
import requestQ from '@/utils/requestQuick';
import { async } from 'q';
import { func } from 'prop-types';
import axios from 'axios';

export async function queryData(payload) {
  return request(`/itms-schedule/itms-schedule/dev/getData/${payload.quickuuid}/tms`, {
    method: 'POST',
    body: payload,
  });
}

export async function queryCreateConfig(payload) {
  return request(`/itms-schedule/itms-schedule/dev/getOnlFormInfoByCode/${payload}`, {
    method: 'POST',
  });
}

export async function queryColumns(payload) {
  return request(`/itms-schedule/itms-schedule/dev/getColumns`, {
    method: 'POST',
    body: payload,
  });
}

export async function queryAllData(payload) {
  return request(`/itms-schedule/itms-schedule/dev/getAllData/${payload.quickuuid}`, {
    method: 'POST',
    body: payload,
  });
}

export async function saveFormData(param) {
  return request(`/itms-schedule/itms-schedule/dev/saveFormData/${param.code}`, {
    method: 'POST',
    body: param.entity,
  });
}

export async function dynamicDelete(payload) {
  return request(`/itms-schedule/itms-schedule/devDynamicCRUD/delete/${payload.code}`, {
    method: 'POST',
    body: payload.params,
  });
}

export async function dyDelete(payload) {
  return request(`/itms-schedule/itms-schedule/devDynamicCRUD/delete`, {
    method: 'POST',
    body: payload.params,
  });
}

export async function dynamicQuery(payload) {
  return request(`/itms-schedule/itms-schedule/devDynamicCRUD/query`, {
    method: 'POST',
    body: payload,
  });
}

export async function dynamicqueryById(payload) {
  return request(`/itms-schedule/itms-schedule/devDynamicCRUD/query`, {
    method: 'POST',
    body: payload,
  });
}
export async function selectCoulumns(payload) {
  return request(`/itms-schedule/itms-schedule/dev/selectCoulumns/${payload.quickuuid}`, {
    method: 'POST',
    body: payload,
  });
}

export async function saveOrUpdateEntities(payload) {
  return request('/itms-schedule/itms-schedule/devDynamicCRUD/saveOrUpdateEntities', {
    method: 'POST',
    body: payload,
  });
}

export async function findLineSystemTree() {
  return request(`/itms-schedule/itms-schedule/line/LineSystemTree/findLineSystemTree`, {
    method: 'get',
  });
}

export async function deleteLineSystemTree(payload) {
  return request(
    `/itms-schedule/itms-schedule/line/LineSystemTree/deleteLineSystemTree/${payload}`,
    {
      method: 'get',
    }
  );
}
export async function deleteLineStoreAddressById(payload) {
  return request(`/itms-schedule/itms-schedule/line/LineSystemTree/deleteLineAddress/${payload}`, {
    method: 'get',
  });
}

export async function findLineByNameLike(payload) {
  return request(`/itms-schedule/itms-schedule/line/LineSystemTree/findLineByNameLike/${payload}`, {
    method: 'POST',
  });
}
export async function addToNewLine(payload) {
  return request(
    `/itms-schedule/itms-schedule/line/LineSystemTree/addToNewLine/${payload.lineuuid}`,
    {
      method: 'POST',
      body: payload.addressIds,
    }
  );
}
