
import request from '@/utils/request';
import { async } from 'q';
import { func } from 'prop-types';

export async function query(payload) {
    console.log("query方法");
    return request(`iwms-account/account/user/00000070000030`, {
      method: 'POST',
      body: payload,
    });
  }
export async function save(payload) {
  console.log("save",payload);
  return request(`/iwms-facility/facility/batchConfigurationZz/insert`,{
    method: 'POST',
    body: payload,
  });
}
export async function getById(id) {
  return request(`/iwms-basic/basic/zz/${id}`);
}
export async function modify(payload) {
  console.log("modify",payload);
  return request(`/iwms-facility/facility/batchConfigurationZz/update`,{
    method: 'POST',
    body: payload,
  });
}

export async function deleteById(payload) {
  console.log("进入了删除，要删除的id为",payload)
  return request(`/iwms-facility/facility/batchConfigurationZz/delete/`+payload,{
    method: 'get',

  });
}
