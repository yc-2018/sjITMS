import {
  save,
  getByDcUuidAndArticleUuid,
  query,
  modify,
  queryByArticles
} from '@/services/facility/PickSchema';

export default {
  namespace: 'pickSchema',

  state: {
    data: {
      list: [],
      pagination: {}
    },
    entity: {}
  },

  effects: {
    *query({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
      if (response && response.success) {
        yield put({
          type: 'success',
          payload: {
            list: response.data.records ? response.data.records: [],
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
    *add({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (callback) callback(response);
    },

    *modify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
      if (callback) callback(response);
    },

    *getByDcUuidAndArticleUuid({ payload, callback }, { call, put }) {
      const response = yield call(getByDcUuidAndArticleUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          payload: response.data
        });
      }
      if (callback) callback(response);
    },

    *queryByArticles({ payload, callback }, { call, put }){
      const response = yield call(queryByArticles, payload);

      if(response && response.success){
        yield put({
          type: 'saveSchemas',
          payload: response.data
        });
      }
      if (callback) callback(response);
    }


  },

  reducers: {
    success(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    onView(state, action) {
      return {
        ...state,
        entity: action.payload
      }
    },
    saveSchemas(state, action){
      return {
        ...state,
        schemaList: action.payload
      }
    }
  }
}
