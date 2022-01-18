
import request from '@/utils/request';
import requestQ from '@/utils/requestQuick';
import { async } from 'q';
import { func } from 'prop-types';
import axios from 'axios';


export async function queryDate(payload) {
  return request(`/itms-schedule/itms-schedule/dev/getData/${payload.quickuuid}/tms`, {
    method: 'POST',
    body:payload
  });
}

export async function queryAllDate(payload) {
  return request(`/itms-schedule/itms-schedule/online/report/api/getAllData/${payload.quickuuid}`, {
    method: 'POST',
    body:payload
  });
}

export async function queryColumns(payload) {
  return request(`/itms-schedule/itms-schedule/dev/getColumns`, {
    method: 'POST',
    body:payload
  }); 
}
