/*
 * @Author: Liaorongchang
 * @Date: 2023-09-13 17:31:38
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-09-13 17:35:45
 * @version: 1.0
 */
import { batchImport } from '@/services/cost/CostExProject';

export default {
  namespace: 'costSubsidy',
  state: {},
  effects: {
    *batchImport({ payload, callback }, { call, put }) {
      const response = yield call(batchImport, payload);
      if (callback) callback(response);
    },
  },
  reducers: {},
};
