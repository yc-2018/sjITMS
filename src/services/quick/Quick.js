import request from '@/utils/request';
import requestQ from '@/utils/requestQuick';
import { async } from 'q';
import { func } from 'prop-types';
import axios from 'axios';


export async function queryData(payload) {
  return request(`/itms-schedule/itms-schedule/dev/getData/${payload.quickuuid}/tms`, {
    method: 'POST',
    body:payload
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
    body:payload
  }); 
}

export async function queryAllData(payload) {
  return request(`/itms-schedule/itms-schedule/dev/getAllData/${payload.quickuuid}`, {
    method: 'POST',
    body:payload
  });
}


export async function saveOrUpdateEntities(payload) {
  return request(`/itms-schedule/itms-schedule/devDynamicCRUD/saveOrUpdateEntities`, {
    method: 'POST',
    body:payload
  });
}