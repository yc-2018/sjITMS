/*
 * @Author: guankongjin
 * @Date: 2022-03-29 14:09:59
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-03-29 14:09:59
 * @Description: file content
 * @FilePath: \iwms-web\src\models\sjtms\dispatching.js
 */
export default {
  namespace: 'dispatching',
  state: { showPage: 'query' },
  effects: {
    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        payload,
      });
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
