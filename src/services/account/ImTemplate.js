import request from '@/utils/request';
import { loginCompany, loginOrg, loginKey } from '@/utils/LoginContext';
import axios from 'axios';
import configs from '@/utils/config';

export async function save(payload) {
  return request(`/iwms-account/account/importTemplate`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-account/account/importTemplate/modify`, {
    method: 'POST',
    body: payload,
  });
}

export async function remove(payload) {
  return request(
    `/iwms-account/account/importTemplate/remove?uuid=${payload.uuid}&version=${payload.version}`,
    {
      method: 'DELETE',
    }
  );
}

export async function getPath(payload) {
  axios(
    configs[API_ENV].API_SERVER +
      `/iwms-account/account/importTemplate/getPath?type=${payload.type}&isDataBase=${
        payload.isDataBase
      }`,
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
    let fileName = payload.type;
    if (payload.isDataBase) {
      // fileName = payload.type + '.xlsx';
      let str = res.headers['content-disposition']?.split(';')[1]?.substring(9);
      fileName = payload.fileName ? +'.xlsx' : payload.fileName ? +'.xlsx' : decodeURI(str);
    }
    if ('msSaveOrOpenBlob' in navigator) {
      //ie使用的下载方式
      window.navigator.msSaveOrOpenBlob(res.data, decodeURI(fileName));
    } else {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
    }
  });
  // return request(
  //   `/iwms-account/account/importTemplate/getPath?type=${payload.type}&isDataBase=${
  //     payload.isDataBase
  //   }`,
  //   {
  //     method: 'POST',
  //     responseType: 'blob', //data: payload,
  //   }
  // );
}

export async function queryAll(payload) {
  return request(`/iwms-account/account/importTemplate/queryAll`, {
    method: 'POST',
  });
}
