/*
 * @Author: Liaorongchang
 * @Date: 2024-02-02 10:08:46
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2024-02-02 16:19:25
 * @version: 1.0
 */
import request from '@/utils/request';
import axios from 'axios';
import configs from '@/utils/config';

export async function queryDataByDbSource(payload) {
  return request(
    `/bms-cost/bms-cost/openApiCost/getData/${payload.quickuuid}/${payload.dbSource}`,
    {
      method: 'POST',
      body: payload,
    }
  );
}

export async function queryColumnsByOpen(payload) {
  return request(`/bms-cost/bms-cost/openApiCost/getColumns`, {
    method: 'POST',
    body: payload,
  });
}

//获取子帐单明细
export async function getChildBillInfo(uuid, payload) {
  return request(`/bms-cost/bms-cost/openApiCost/getChildBillInfo/${uuid}`, {
    method: 'POST',
    body: payload,
  });
}

//子帐单上传附件
export async function childUploadFile(file, uuid, type) {
  return request(`/bms-cost/bms-cost/openApiCost/childUploadFile?uuid=${uuid}&type=${type}`, {
    method: 'POST',
    body: file,
  });
}

export async function deleteChildFile(uuid, download, index, type) {
  return request(
    `/bms-cost/bms-cost/openApiCost/deleteChildFile?uuid=${uuid}&download=${download}&index=${index}&type=${type}`,
    {
      method: 'POST',
    }
  );
}

export function childDownload(param) {
  axios(
    configs[API_ENV].API_SERVER +
      `/bms-cost/bms-cost/openApiCost/childDownload/${param.uuid}/${param.index}/${param.type}`,
    {
      method: 'post',
      responseType: 'blob', //data: payload,
      headers: {
        // iwmsJwt: loginKey(),
        'Content-Type': 'multipart/form-data',
        Accept: '*/*',
      },
    }
  ).then(res => {
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', param.fileName);
    document.body.appendChild(link);
    link.click();
  });
}

export async function getUploadFile(accessory) {
  const res = await axios(
    configs[API_ENV].API_SERVER + `/bms-cost/bms-cost/openApiCost/getUploadFile`,
    {
      method: 'post',
      responseType: 'blob',
      headers: {
        // iwmsJwt: loginKey(),
        'Content-Type': 'application/json;charset=utf-8',
        Accept: '*/*',
      },
      data: accessory,
    }
  );
  // const url_1 = window.URL.createObjectURL(new Blob([res.data]));
  // return url_1;
  return res.data;
}

//对账确认
export async function reconciliation(type, billUuid) {
  return request(
    `/bms-cost/bms-cost/openApiCost/reconciliation?type=${type}&billUuid=${billUuid}`,
    {
      method: 'POST',
    }
  );
}
//票据确认
export async function invoice(type, billUuid) {
  return request(`/bms-cost/bms-cost/openApiCost/invoice?type=${type}&billUuid=${billUuid}`, {
    method: 'POST',
  });
}
