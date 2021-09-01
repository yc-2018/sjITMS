import { stringify } from 'qs';
import request from '@/utils/request';
import { loginOrg, loginUser, loginCompany } from '@/utils/LoginContext';

export async function save(payload) {
    return request(`/iwms-bms/bms/unitConversion/save`, {
      method: 'POST',
      body: payload,
    });
  }

  export async function update(payload) {
    return request(`/iwms-bms/bms/unitConversion/update`, {
      method: 'PUT',
      body: payload,
    });
  }

  export async function query(payload) {
    return request(`/iwms-bms/bms/unitConversion/page`, {
      method: 'POST',
      body:payload
    });
  }

  export async function remove(payload) {
    return request(`/iwms-bms/bms/unitConversion/remove`, {
      method: 'DELETE',
      body:payload.uuids
    });
  }

  export async function get(payload) {
    return request(`/iwms-bms/bms/unitConversion/get/${payload.uuid}`, {
      method: 'GET'
    });
  }