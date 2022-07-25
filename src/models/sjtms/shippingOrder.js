/*
 * @Author: Liaorongchang
 * @Date: 2022-07-25 17:04:41
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-07-25 17:05:04
 * @version: 1.0
 */
import { batchImport } from '@/services/sjitms/ShippingOrder';
export default {
  namespace: 'ShippingOrder',
  state: {},
  effects: {
    *batchImport({ payload, callback }, { call, put }) {
      const response = yield call(batchImport, payload);
      if (callback) callback(response);
    },
  },
  reducers: {},
};
