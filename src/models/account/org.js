import { queryByUuids, query } from '@/services/account/Org';

export default {
  namespace: 'org',

  state: {
    data: []
  },

  effects: {
    *queryByUuids({ payload, callback }, { call, put }) {
      const response = yield call(queryByUuids, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: response.data ? response.data : []
        });
      }
    },
    *query({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: response.data.records ? response.data.records : []
        });
      }
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};