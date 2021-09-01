import { insert, query } from '@/services/account/NoticeConfig';

export default {
  namespace: 'noticeConfig',

  state: {
    data: []
  },
  effects: {
    *query({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
      if (callback) callback(response);
      if (response && response.success) {
        yield put({
          type: 'save',
          value: response.data ? response.data : []
        });
      }
    },
    *insert({ payload, callback }, { call, put }) {
      const response = yield call(insert, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.value
      };
    },
  },
}