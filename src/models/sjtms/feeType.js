import { save, query,remove,modify } from '@/services/sjtms/FeeType';

export default {
  namespace: 'feeType1',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    showPage: 'query'
  },
  effects: {
    *query({ payload }, { call, put }) {
      const response = yield call(query, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: {
            list: response.data.records?response.data.records:[],
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
    *onSave({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (callback) callback(response);
    },
    *onModify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
      if (callback) callback(response);
    },
    *onRemove({ payload, callback }, { call, put }) {
      const response = yield call(remove, payload);
      if (callback) callback(response)
    },
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload
      };
    },
  },
}