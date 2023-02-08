import request from '@/utils/request';
import { async } from 'q';
import { func } from 'prop-types';
import axios from 'axios';

export async function queryDict(dictCode) {
  return request(`/itms-schedule/itms-schedule/dict/findDictByDictType/${dictCode}`, {
    method: 'GET',
  });
}
export async function queryDictByCode(dictCodes) {
  return request(`/itms-schedule/itms-schedule/dict/findDictByDictCode?dictCodes=${dictCodes}`, {
    method: 'GET',
    headers: { check_flag: false },
  });
}

export async function queryData(payload,headers) {
  return request(`/itms-schedule/itms-schedule/dev/getData/${payload.quickuuid}/tms`, {
    method: 'POST',
    body: payload,
    headers:headers
  });
}

export async function queryCreateConfig(payload,headers) {
  return request(`/itms-schedule/itms-schedule/dev/getOnlFormInfoByCode/${payload}`, {
    method: 'POST',
    headers:headers
  });
}

export async function queryColumns(payload,headers) {
  return request(`/itms-schedule/itms-schedule/dev/getColumns`, {
    method: 'POST',
    body: payload,
    headers:headers
  });
}

export async function queryAllData(payload,headers) {
  return request(`/itms-schedule/itms-schedule/dev/getAllData/${payload.quickuuid}`, {
    method: 'POST',
    body: payload,
    headers:headers
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

export async function updateEntity(payload) {
  return request('/itms-schedule/itms-schedule/devDynamicCRUD/update', {
    method: 'POST',
    body: payload,
  });
}
