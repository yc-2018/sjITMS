import {
  query,
  startJob,
  endJob,
  getAlc
} from '@/services/wcs/Job';

export default {
  namespace: 'job',
  state: {
    data: {
      list: [],
      pagination: {},
    },
  },
  effects: {
    *query({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: {
            list: response.data.records,
            pagination: {
              total: response.data.paging.recordCount,
              pageSize: response.data.paging.pageSize,
              current: response.data.page + 1,
              showTotal: total => `共 ${total} 条`,
            },
          },
        });
      }
      if (callback) callback(response);
    },
    *startJob({ payload, callback }, { call, put }) {
      const response = yield call(startJob, payload);
      if (callback) callback(response);
    },
    *endJob({ payload, callback }, { call, put }) {
      const response = yield call(endJob, payload);
      if (callback) callback(response);
    },
    *getAlc({ payload, callback }, { call, put }) {
      const response = yield call(getAlc, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    }
  }
};
