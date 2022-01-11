
import request from '@/utils/request';
import requestQ from '@/utils/requestQuick';
import { async } from 'q';
import { func } from 'prop-types';
import axios from 'axios';


export async function query(payload) {
    return request(`/itms-schedule/itms-schedule/online/report/api/getColumnsAndData/${payload}`, {
      method: 'POST',
    });
}

export async function queryDate(payload) {
  return request(`/itms-schedule/itms-schedule/online/report/api/getData/${payload.quickuuid}`, {
    method: 'POST',
    body:payload
  });
}

export async function queryColumns(payload) {
  return requestQ(`/online/report/api/getColumns/${payload}`, {
    method: 'POST',
  }); 
}

