import { query,openOrClose,queryLog } from '@/services/facility/InterfaceConfig';

export default {
  namespace: 'interfaceConfig',

  state: {
    data: {
      list: [],
      pagination: {},

    },
  },

  effects: {
    *openOrClose({ payload, callback }, { call, put }) {
      const response = yield call(openOrClose, payload);
      if (callback) callback(response);
    },
    *query({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: response.data
        });
      }
    },
    *queryLog({ payload, callback }, { call, put }) {
      const response = yield call(queryLog, payload);
      if (response && response.success) {
        yield put({
          type: 'saveLog',
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
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    saveLog(state,action){
      return {
        ...state,
        interfaceLog: action.payload,
      };
    }
  }
}