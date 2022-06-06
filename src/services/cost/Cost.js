import request from '@/utils/request';
import { requestQ, requestP } from '@/utils/requestQuick';
import { async } from 'q';
import { func } from 'prop-types';
import axios from 'axios';
import configs from '@/utils/config';
import { cacheLoginKey, loginKey } from '@/utils/LoginContext';
import lineSystem from '@/models/sjtms/lineSystem';

export  function getFile(param) {
   axios(configs[API_ENV].API_SERVER + `/itms-cost/itms-cost/costProject/download/${param.uuid}/${param.index}`, {
    method: 'post',
    responseType:"blob",
    //data: payload,
    headers: {
      iwmsJwt: loginKey(),
      'Content-Type': 'multipart/form-data',
      Accept: '*/*',
    },
  }).then(res=>{
    console.log(res);
  const{data,headers} = res;
  const url = window.URL.createObjectURL(new Blob([res.data]))
  const link = document.createElement("a");
  link.href =url;
  link.setAttribute("download",param.fileName);
  document.body.appendChild(link);
  link.click();
  })}
//   return request(`/itms-cost/itms-cost/costProject/download/${param.uuid}/${param.index}`, {
//     method: 'GET',
//   });
// }

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
