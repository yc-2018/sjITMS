import {
  saveOrUpdate,
  getByBinCode,
  remove,
  query,
  get
} from '@/services/facility/PutAwayTransferConfig';

export default {
  namespace: 'putAwayTransferConfig',

  state: {
    data: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
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
    },

    *saveOrUpdate({ payload, callback }, { call, put }) {
      const response = yield call(saveOrUpdate, payload);
      if (callback) callback(response);
    },

    *getByBinCode({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: {
            entity: response.data,
          },
        });
      }
      if (callback) callback(response);
    },

    *remove({ payload, callback }, { call, put }) {
      const response = yield call(remove, payload);
      if (callback) callback(response);
    },

    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      if (callback) callback(response);
    },

  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  }
}