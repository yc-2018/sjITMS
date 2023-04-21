/*
 * @Author: guankongjin
 * @Date: 2023-04-21 10:14:27
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-04-21 10:15:03
 * @Description: file content
 * @FilePath: \iwms-web\src\models\sjtms\WeiShang.js
 */
import { batchImport } from '@/services/sjitms/WeiShang';
export default {
  namespace: 'WeiShang',
  state: {},
  effects: {
    *batchImport({ payload, callback }, { call, put }) {
      const response = yield call(batchImport, payload);
      if (callback) callback(response);
    },
  },
  reducers: {},
};
