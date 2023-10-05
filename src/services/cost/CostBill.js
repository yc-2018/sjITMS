/*
 * @Author: Liaorongchang
 * @Date: 2023-09-07 11:24:59
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-10-05 09:28:43
 * @version: 1.0
 */
import request from '@/utils/request';
import axios from 'axios';
import configs from '@/utils/config';
import { cacheLoginKey, loginKey } from '@/utils/LoginContext';

//清单确认
export async function checklistConfirm(uuid) {
  return request(`/itms-cost/itms-cost/newCostBill/checklistConfirm?uuid=${uuid}`, {
    method: 'POST',
  });
}

//创建子帐单
export async function createChildBill(billUuid, payload) {
  return request(`/itms-cost/itms-cost/newCostBill/createChildBill/${billUuid}`, {
    method: 'POST',
    body: payload,
  });
}
//账单确认
export async function billConfirm(type, billUuid) {
  return request(`/itms-cost/itms-cost/newCostBill/billConfirm?type=${type}&billUuid=${billUuid}`, {
    method: 'POST',
  });
}
//对账确认
export async function reconciliation(type, billUuid) {
  return request(
    `/itms-cost/itms-cost/newCostBill/reconciliation?type=${type}&billUuid=${billUuid}`,
    {
      method: 'POST',
    }
  );
}
//票据确认
export async function invoice(type, billUuid) {
  return request(`/itms-cost/itms-cost/newCostBill/invoice?type=${type}&billUuid=${billUuid}`, {
    method: 'POST',
  });
}
//核销
export async function verification(type, billUuid) {
  return request(
    `/itms-cost/itms-cost/newCostBill/verification?type=${type}&billUuid=${billUuid}`,
    {
      method: 'POST',
    }
  );
}
//付款
export async function payment(type, billUuid) {
  return request(`/itms-cost/itms-cost/newCostBill/payment?type=${type}&billUuid=${billUuid}`, {
    method: 'POST',
  });
}
//归档
export async function completed(type, billUuid) {
  return request(`/itms-cost/itms-cost/newCostBill/completed?type=${type}&billUuid=${billUuid}`, {
    method: 'POST',
  });
}

//子帐单上传附件
export async function childUploadFile(file, uuid) {
  return request(`/itms-cost/itms-cost/newCostBill/childUploadFile?uuid=${uuid}`, {
    method: 'POST',
    body: file,
  });
}

export async function deleteChildFile(uuid, download, index) {
  return request(
    `/itms-cost/itms-cost/newCostBill/deleteChildFile?uuid=${uuid}&download=${download}&index=${index}`,
    {
      method: 'POST',
    }
  );
}

export function childDownload(param) {
  axios(
    configs[API_ENV].API_SERVER +
      `/itms-cost/itms-cost/newCostBill/childDownload/${param.uuid}/${param.index}`,
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
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', param.fileName);
    document.body.appendChild(link);
    link.click();
  });
}

//获取子帐单明细
export async function getChildBillInfo(uuid, payload) {
  return request(`/itms-cost/itms-cost/newCostBill/getChildBillInfo/${uuid}`, {
    method: 'POST',
    body: payload,
  });
}

//导出子帐单
export async function portChildBill(uuid) {
  axios(
    configs[API_ENV].API_SERVER +
      `/itms-cost/itms-cost/newCostBill/portChildBill/${uuid}`,
    {
      method: 'post',
      responseType: 'blob',
      headers: {
        iwmsJwt: loginKey(),
        'Content-Type': 'application/json; charset=utf-8',
        Accept: '*/*',
      },
    }
  ).then(res => {
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      decodeURI(res.headers['content-disposition'].split('=')[1])
    );
    document.body.appendChild(link);
    link.click();
  });
}