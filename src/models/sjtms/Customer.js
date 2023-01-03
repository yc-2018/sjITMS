/*
 * @Author: guankongjin
 * @Date: 2023-01-03 11:50:50
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-01-03 11:52:12
 * @Description: file content
 * @FilePath: \iwms-web\src\models\sjtms\Customer.js
 */
import { batchImport } from '@/services/sjitms/Customer';
export default {
  namespace: 'Customer',
  state: {},
  effects: {
    *batchImport({ payload, callback }, { call, put }) {
      const response = yield call(batchImport, payload);
      if (callback) callback(response);
    },
  },
  reducers: {},
};
