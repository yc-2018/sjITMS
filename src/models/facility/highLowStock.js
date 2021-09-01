import {
  query,
  update,
  batchUpdate,
  queryStock,
  getQpcByQueryStock
} from '@/services/facility/HighLowStock';

export default {
  namespace: 'highLowStock',

  state: {
    data: {
      list: [],
      pagination: {}
    },
    showPage: 'query',
    entity: {}
  },
  effects: {
    *query({ payload }, { call, put }) {
      const response = yield call(query, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: {
            list: response.data.records ? response.data.records : [],
            pagination: {
              total: response.data.paging.recordCount,
              pageSize: response.data.paging.pageSize,
              current: response.data.page + 1,
              showTotal: total => `共 ${total}条`,
            }
          },
        });
      }
    },

    *update({ payload, callback }, { call, put }) {
      const response = yield call(update, payload);
      if (callback) callback(response);
    },

    *batchUpdate({ payload, callback }, { call, put }) {
      const response = yield call(batchUpdate, payload);
      if (callback) callback(response);
    },

    *get({ payload }, { call, put }) {
      const response = yield call(get, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          entity: response.data
        });
      }
    },

    *queryStock({ payload, callback }, { call, put }) {
      const response = yield call(queryStock, payload.queryParam);
      if (response && response.success) {
        yield put({
          type: 'onQuery',
          entitys: response.data ? response.data : [],
          editParam: payload.editParam
        });
      }
      if (callback) callback(response);
    },

    *clearEntitysAndParams({ payload }, { call, put }) {
      yield put({
        type: 'onQuery',
        entitys: null,
        editParam: null
      });
    },

    *getQpcByQueryStock({ payload, callback }, { call, put }) {
      const response = yield call(getQpcByQueryStock, payload);
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
    onView(state, action) {
      return {
        ...state,
        entity: action.entity
      };
    },
    onQuery(state, action) {
      return {
        ...state,
        entitys: action.entitys,
        editParam: action.editParam
      };
    }
  },

};
