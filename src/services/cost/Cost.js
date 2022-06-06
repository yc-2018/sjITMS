import request from '@/utils/request';
import {requestQ,requestP} from '@/utils/requestQuick';
import { async } from 'q';
import { func } from 'prop-types';
import axios from 'axios';
import configs from '@/utils/config';
import {cacheLoginKey, loginKey} from '@/utils/LoginContext';

// export async function queryDict(dictCode) {
//   return request(`/itms-cost/itms-cost/costProject/onSave`, {
//     method: 'POST',
//   });
// }

export async function save(payload) {
axios(configs[API_ENV].API_SERVER+`/itms-cost/itms-cost/costProject/onSave`,{
  method :'post',
  data:payload,
  headers:{
    iwmsJwt: loginKey(),
    'Content-Type' :"multipart/form-data",
    "Accept":'*/*'

  }}).then(e=>{
        return e.data;
  })

  
}
