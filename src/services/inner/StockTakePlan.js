import { stringify } from 'qs';
import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function save(payload) {
  return request(`/iwms-facility/facility/stockTakePlan`, {
    method: 'POST',
    body: payload,
  });
}

export async function modify(payload) {
  return request(`/iwms-facility/facility/stockTakePlan`, {
    method: 'PUT',
    body: payload,
  });
}

export async function getByBillNumber(payload) {
  return request(`/iwms-facility/facility/stockTakePlan/billNumber?${stringify(payload)}`);
}

export async function deletePlan(payload) {
  return request(`/iwms-facility/facility/stockTakePlan/?${stringify(payload)}`, {
    method: 'DELETE',
  });
}

export async function query(payload) {
  return request(`/iwms-facility/facility/stockTakePlan/page`, {
    method: 'POST',
    body: payload
  });

  // return {
  //   "data": {
  //     "paging": {
  //       "pageSize": 10,
  //       "page": 0,
  //       "pageCount": 1,
  //       "recordCount": 1,
  //       "more": false
  //     },
  //     "records": [{
  //       "uuid": "00000210000004",
  //       "version": 0,
  //       "createInfo": {
  //         "time": "2019-03-28 17:18:17",
  //         "operator": {
  //           "namespace": "0000021",
  //           "id": "13738068462",
  //           "fullName": "麦兜",
  //           "qualifiedId": "13738068462@@0000021"
  //         }
  //       },
  //       "lastModifyInfo": {
  //         "time": "2019-03-28 17:20:38",
  //         "operator": {
  //           "namespace": "0000021",
  //           "id": "13738068462",
  //           "fullName": "麦兜",
  //           "qualifiedId": "13738068462@@0000021"
  //         }
  //       },
  //       "billNumber": "13738068463",
  //       "serialNum": "oooo",
  //       "stockTakeMethod": "MANUALBILL",
  //       "stockTakeSchema": "BLIND_TAKE",
  //       "state": 'INITIAL',
  //       "companyUuid": "0000021",
  //       "owner": {
  //         "uuid": '111',
  //         "code": '111',
  //         "name": '111'
  //       },
  //     }],
  //     "pageCount": 1,
  //     "pageSize": 10,
  //     "page": 0,
  //     "recordCount": 1,
  //     "more": false
  //   },
  //   "success": true
  // }
}

export async function finish(payload) {
  return request(`/iwms-facility/facility/stockTakePlan/finish/?${stringify(payload)}`, {
    method: 'POST'
  });
}

export async function generateTakeBill(payload) {
  return request(`/iwms-facility/facility/stockTakePlan/generateTakeBill/?${stringify(payload)}`, {
    method: 'POST'
  });
}

export async function billUuid(payload){
  return request(`/iwms-facility/facility/stockTakePlan/billUuid?uuid=${payload.uuid}`)
}