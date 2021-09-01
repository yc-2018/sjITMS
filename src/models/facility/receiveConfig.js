import {
  query,
  save,
  modify,
  get,
  remove,
  getByDockGroupUuid
} from '@/services/facility/ReceiveConfig';

export default {
  namespace: 'receiveConfig',

  state: {
    data: {
      list: [],
      pagination: {},
    },
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
    *add({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (callback) callback(response);
    },
    *modify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
      if (callback) callback(response);
    },
    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      if (callback) callback(response);
    },
    *getByDockGroupUuid({ payload, callback }, { call, put }) {
      const response = yield call(getByDockGroupUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: response.data
        });
      }
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(remove, payload);
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