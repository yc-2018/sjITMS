/*
 * @Author: Liaorongchang
 * @Date: 2023-04-06 09:50:55
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-04-06 09:56:47
 * @version: 1.0
 */
import { uploading } from '@/services/sjitms/ETCIssueAndRecycle';
export default {
  namespace: 'etcCost',
  state: {},
  effects: {
    *uploading({ payload, callback }, { call, put }) {
      const response = yield call(uploading, payload);
      if (callback) callback(response);
    },
  },
  reducers: {},
};
