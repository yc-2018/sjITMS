/*
 * @Author: Liaorongchang
 * @Date: 2022-08-03 16:32:04
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-11-02 12:54:43
 * @version: 1.0
 */
import { batchImport } from '@/services/cost/BasicSource';
import { newBatchImport } from '@/services/bms/BasicSource';

export default {
  namespace: 'basicSource',
  state: {},
  effects: {
    *batchImport({ payload, callback }, { call, put }) {
      const response = yield call(batchImport, payload);
      if (callback) callback(response);
    },

    *newBatchImport({ payload, callback }, { call, put }) {
      const response = yield call(newBatchImport, payload);
      if (callback) callback(response);
    },
  },
  reducers: {},
};
