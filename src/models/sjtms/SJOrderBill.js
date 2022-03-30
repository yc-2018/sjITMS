/*
 * @Author: Liaorongchang
 * @Date: 2022-03-12 16:12:40
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-03-30 09:51:58
 * @version: 1.0
 */
import { batchImport } from '@/services/sjitms/OrderBill';
export default {
  namespace: 'SJOrderBill',
  state: {},
  effects: {
    *batchImport({ payload, callback }, { call, put }) {
      const response = yield call(batchImport, payload);
      if (callback) callback(response);
    },
  },
  reducers: {},
};
