import { stringify } from 'qs';
import request from '@/utils/request';
import { loginOrg, loginUser, loginCompany } from '@/utils/LoginContext';

export async function bigSort(payload) {
    return request(`/iwms-bms/bms/bigSort`, {
      method: 'POST',
      body:payload
    });
  }

  export async function modify(payload) {
    return request(`/iwms-bms/bms/bigSort/modify`, {
      method: 'PUT',
      body:payload
    });
  }

  export async function page(payload) {
    return request(`/iwms-bms/bms/bigSort/queryByCompanyUuid/${loginCompany().uuid}`, {
        method: 'GET',
        // body:payload
      });
  }

  export async function queryByCodeOrName(payload) {
    return request(`/iwms-bms/bms/bigSort/queryByCodeOrName?codeOrName=${payload.codeOrName}`, {
      method: 'GET',
    });
  }

  export async function getByUuid(payload) {
    return request(`/iwms-bms/bms/bigSort/getByUuid/${payload.uuid}?uuid=1`, {
      method: 'GET',
    });
  }


  export async function querySortGroup(payload) {
    return request(`/iwms-bms/bms/bigSort/querySortGroup/${loginCompany().uuid}`, {
      method: 'GET',
    });
  }

  export async function remove(payload) {
    return request(`/iwms-bms/bms/bigSort/remove?uuid=${payload.uuid}`, {
      method: 'DELETE',
    });
  }

  export async function smallObject(payload) {
    return request(`/iwms-bms/bms/smallObject`, {
      method: 'POST',
      body:payload
    });
  }

  export async function smallObjectpage(payload) {
    return request(`/iwms-bms/bms/smallObject/page`, {
      method: 'POST',
      body:payload
    });
  }

  export async function smallSort(payload) {
    return request(`/iwms-bms/bms/smallSort`, {
      method: 'POST',
      body:payload
    });
  }

  export async function smallSortmodify(payload) {
    return request(`/iwms-bms/bms/smallSort/modify`, {
      method: 'PUT',
      body:payload
    });
  }

  export async function smallSortpage(payload) {
    return request(`/iwms-bms/bms/smallSort/page/${payload.uuid}`, {
      method: 'GET',
    
    });
  }

  export async function smallSortByUuid(payload) {
    return request(`/iwms-bms/bms/smallSort/getByUuid/${payload.uuid}`, {
      method: 'GET',
    });
  }

  export async function smallSortremove(payload) {
    return request(`/iwms-bms/bms/smallSort/remove?uuid=${payload.uuid}`, {
      method: 'DELETE',
    });
  }

  export async function smallObjectremove(payload) {
    return request(`/iwms-bms/bms/smallObject/remove`, {
      method: 'DELETE',
      body:payload.uuids
    });
  }