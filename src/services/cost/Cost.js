import request from '@/utils/request';
import axios from 'axios';
import configs from '@/utils/config';
import { cacheLoginKey, loginKey } from '@/utils/LoginContext';

export function getFile(param) {
  axios(
    configs[API_ENV].API_SERVER +
      `/itms-cost/itms-cost/costProject/download/${param.uuid}/${param.index}`,
    {
      method: 'post',
      responseType: 'blob', //data: payload,
      headers: {
        iwmsJwt: loginKey(),
        'Content-Type': 'multipart/form-data',
        Accept: '*/*',
      },
    }
  ).then(res => {
    console.log(res);
    const { data, headers } = res;
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', param.fileName);
    document.body.appendChild(link);
    link.click();
  });
}

export function getPlanFile(param) {
  axios(
    configs[API_ENV].API_SERVER +
      `/itms-cost/itms-cost/costplan/download/${param.uuid}/${param.index}`,
    {
      method: 'post',
      responseType: 'blob', //data: payload,
      headers: {
        iwmsJwt: loginKey(),
        'Content-Type': 'multipart/form-data',
        Accept: '*/*',
      },
    }
  ).then(res => {
    console.log(res);
    const { data, headers } = res;
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', param.fileName);
    document.body.appendChild(link);
    link.click();
  });
}

export async function save(payload) {
  return axios(configs[API_ENV].API_SERVER + `/itms-cost/itms-cost/costProject/onSave`, {
    method: 'post',
    data: payload,
    headers: {
      iwmsJwt: loginKey(),
      'Content-Type': 'multipart/form-data',
      Accept: '*/*',
    },
  }).then(e => {
    return e;
  });
}

export async function deleteFile(payload) {
  return request(`/itms-cost/itms-cost/costProject/deleteFile`, {
    method: 'POST',
    body: payload,
  });
}

export async function analysisSql(payload) {
  return request(`/itms-cost/itms-cost/costProject/analysisSql`, {
    method: 'POST',
    body: payload,
  });
}

export async function savePlan(payload) {
  return axios(configs[API_ENV].API_SERVER + `/itms-cost/itms-cost/costplan/onSave`, {
    method: 'post',
    data: payload,
    headers: {
      iwmsJwt: loginKey(),
      'Content-Type': 'multipart/form-data',
      Accept: '*/*',
    },
  }).then(e => {
    return e;
  });
}

export async function copyPlan(uuid) {
  return request(`/itms-cost/itms-cost/costplan/copyPlan/${uuid}`, {
    method: 'GET'
  });
}
export async function addHistory(uuid) {
  return request(`/itms-cost/itms-cost/costplan/addHistory/${uuid}`, {
    method: 'GET'
  });
}

