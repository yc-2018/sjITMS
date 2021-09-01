import {
  query,
  saveController,
  remove,
  get,
  addTag,
  removeTag,
  saveTag,
  getTag,
  getOneTag,
  getLightStep,
  queryLightStep,
  removeLightStep,
  saveLightStep,
  queryList
} from '@/services/wcs/FacilitiesMaintenance';

export default {
  namespace: 'facilitiesMaintenance',

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
    *queryLightStep({ payload, callback }, { call, put }) {
      const response = yield call(queryLightStep, payload);
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
    *queryList({ payload, callback }, { call, put }) {
      const response = yield call(queryList, payload);
      if (callback) callback(response);
    },
    *getTag({ payload, callback }, { call, put }) {
      const response = yield call(getTag, payload);
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
    *saveController({ payload, callback }, { call, put }) {
      const response = yield call(saveController, payload);
      if (callback) callback(response);
    },
    *saveLightStep({ payload, callback }, { call, put }) {
      const response = yield call(saveLightStep, payload);
      if (callback) callback(response);
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(remove, payload);
      if (callback) callback(response);
    },
    *removeLightStep({ payload, callback }, { call, put }) {
      const response = yield call(removeLightStep, payload);
      if (callback) callback(response);
    },
    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      if (callback) callback(response);
    },
    *getLightStep({ payload, callback }, { call, put }) {
      const response = yield call(getLightStep, payload);
      if (callback) callback(response);
    },
    *getOneTag({ payload, callback }, { call, put }) {
      const response = yield call(getOneTag, payload);
      if (callback) callback(response);
    },
    *removeTag({ payload, callback }, { call, put }) {
      const response = yield call(removeTag, payload);
      if (callback) callback(response);
    },
    *saveTag({ payload, callback }, { call, put }) {
      const response = yield call(saveTag, payload);
      if (callback) callback(response);
    },
    *addTag({ payload, callback }, { call, put }) {
      const response = yield call(addTag, payload);
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
    // saveTag(state, action) {
    //     //   return {
    //     //     ...state,
    //     //     data: action.payload,
    //     //   };
    //     // },
    //     // addTag(state, action) {
    //     //   return {
    //     //     ...state,
    //     //     data: action.payload,
    //     //   };
    //     // },
  },
};
