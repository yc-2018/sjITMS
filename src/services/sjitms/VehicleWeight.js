/*
 * @Author: Liaorongchang
 * @Date: 2022-11-15 14:39:13
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-04-07 16:20:25
 * @version: 1.0
 */

import request from '@/utils/request';
import axios from 'axios';
import configs from '@/utils/config';
import { loginKey } from '@/utils/LoginContext';

export async function vehicleApply(payload) {
  return request(`/itms-schedule/itms-schedule/sj/bill/vehicleApply/vehicleApply`, {
    method: 'POST',
    body: payload,
  });
}

export async function vehicleApplyAudit(payload) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/vehicleApply/vehicleApplyAudit?uuid=${payload}`,
    {
      method: 'POST',
      body: payload,
    }
  );
}

export async function vehicleApplyRejected(payload) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/vehicleApply/vehicleApplyRejected?uuid=${payload}`,
    {
      method: 'POST',
      body: payload,
    }
  );
}

export async function portVehicleApply(payload) {
  axios(
    configs[API_ENV].API_SERVER +
      `/itms-schedule/itms-schedule/sj/bill/vehicleApply/portVehicleApply`,
    {
      method: 'post',
      responseType: 'blob',
      data: payload,
      headers: {
        iwmsJwt: loginKey(),
        'Content-Type': 'application/json; charset=utf-8',
        Accept: '*/*',
      },
    }
  ).then(res => {
    const date = new Date();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      '运管配送每日安排超限申报表（茶山配送组）' + month + day + '.xlsx'
    );
    document.body.appendChild(link);
    link.click();
  });
}

export async function aborted(uuid, type) {
  return request(
    `/itms-schedule/itms-schedule/sj/bill/vehicleApply/aborted?uuid=${uuid}&type=${type}`,
    {
      method: 'POST',
    }
  );
}
