/*
 * @Author: guankongjin
 * @Date: 2022-03-09 10:39:39
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-03-09 16:25:36
 * @Description: file content
 * @FilePath: \iwms-web\src\models\tms\lineSystem.js
 */
import { query, getLinesByArchUuid } from '@/services/tms/DispatchSerialArch';
export default {
  namespace: 'lineSystem',
  state: { showPage: 'query' },
  effects: {
    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        payload,
      });
    },
    *query({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
      yield put({
        type: 'onView',
        payload: {
          data: response.data,
          showPage: 'query',
          notExistInLineStores: [],
          existInLineStores: [],
          archLines: [],
          lineUuid: '',
          lineEntity: {},
        },
      });
      if (callback) callback(response);
    },
    *getLinesByArchUuid({ payload, callback }, { call, put }) {
      const response = yield call(getLinesByArchUuid, payload);
      yield put({
        type: 'saveSerialArchLines',
        payload: {
          archLines: response.data,
          lineModalVisible: false,
          lineEntity: {},
          lineUuid: '',
        },
      });
      if (callback) callback(response);
    },
  },
  reducers: {
    onView(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    onShowPage(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
