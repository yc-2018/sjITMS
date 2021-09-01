import { stringify } from 'qs';
import request from '@/utils/request';
import { loginOrg, loginUser,loginCompany } from '@/utils/LoginContext';
export async function query(params) {
  return request(`/iwms-facility/facility/highLowStock/page`, {
    method: 'POST',
    body: params,
  });
}

export async function update(params) {
  return request(`/iwms-facility/facility/highLowStock/modify`, {
    method: 'POST',
    body: params,
  });
}

export async function batchUpdate(params) {
  return request(`/iwms-facility/facility/highLowStock/batchModify`, {
    method: 'POST',
    body: params,
  });
}

export async function queryStock(params){
  return request(`/iwms-facility/facility/highLowStock/query`,{
    method:'POST',
    body:params
  })
}

export async function getQpcByQueryStock(params){
  return request(`/iwms-facility/facility/stock/stocks`,{
    method:'POST',
    body:params
  })
}