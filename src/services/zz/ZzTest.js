
import request from '@/utils/request';
import { async } from 'q';
import { func } from 'prop-types';

export async function query(payload) {
    return request(`/itms-schedule/itms-schedule/zz/page`, {
      method: 'POST',
      body: payload,
    });
  }
export async function save(payload) {
  return request(`/itms-schedule/itms-schedule/zz`,{
    method: 'POST',
    body: payload,
  });
}
export async function getById(id) {
  return request(`/itms-schedule/itms-schedule/zz/${id}`);
}
export async function modify(payload) {
  return request(`/itms-schedule/itms-schedule/zz/modify`,{
    method: 'POST',
    body: payload,
  });
}

export async function deleteById(payload) {
  console.log("进入了删除，要删除的id为",payload)
  return request(`/itms-schedule/itms-schedule/zz/deleteById`,{
    method: 'POST',
    body: payload,
  });
}