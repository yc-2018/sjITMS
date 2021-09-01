import { stringify } from 'qs';
import request from '@/utils/request';
import { loginOrg, loginUser, loginCompany } from '@/utils/LoginContext';

  export async function cost(payload) {
    return request(`/iwms-bms/bms/cost`, {
      method: 'POST',
      body:payload
    });
  }

  export async function modify(payload) {
    return request(`/iwms-bms/bms/cost/modify`, {
      method: 'PUT',
      body:payload
    });
  }

  export async function remove(payload) {
    return request(`/iwms-bms/bms/cost/remove?uuid=${payload.uuid}`, {
      method: 'DELETE',
    });
  }

  export async function page(payload) {
    return request(`/iwms-bms/bms/cost/page`, {
      method:'POST',
      body:payload
    });
  }

  export async function audit(payload) {
    return request(`/iwms-bms/bms/cost/audit/${payload.uuid}?version=${payload.version}`, {
      method:'POST',
      body:payload
    });
  }