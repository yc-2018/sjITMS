import { save, deletePreType, modify, query, queryType } from '@/services/basic/PreType';

export default {
  namespace: 'pretype',

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
          type: 'save', // 这个save不对，几乎所有界面的查询都是这样写的，带分页的查询都这样
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
    *delete({ payload, callback }, { call, put }) {
      const response = yield call(deletePreType, payload);
      if (callback) callback(response)
    },
    *queryType({ payload, callback }, { call, put }) {
      const response = yield call(queryType, payload);
      if (response && response.success) {
        yield put({
          type: 'names',
          names: response.data,
          queryType: payload.preType ? payload.preType :payload
        });
      }
    },
    *queryTypeForSecond({ payload, callback }, { call, put }) {
      const response = yield call(queryType, payload);
      if (response && response.success) {
        yield put({
          type: 'namesTwo',
          names: response.data,
          queryType: payload.preType
        });
      }
    }
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload
      };
    },
    namesTwo(state, action) {
      return {
        ...state,
        namesTwo: action.names,
        queryTypeTwo: action.queryType
      };
    },
    names(state, action) {
      return {
        ...state,
        names: action.names,
        queryType: action.queryType
      };
    },
  },
}
