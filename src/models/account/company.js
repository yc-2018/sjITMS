import {
  query,
  save,
  modify,
  enable,
  disable,
  authorize,
  get,
  getByUuid32,
  getByCode,
  getResourceKeys,
  getResources,
  saveAndAuthorize,
} from '@/services/account/Company';

export default {
  namespace: 'company',

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
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: {
            showDetailView: true,
            company: response.data,
            showDetailEditForm: false,
          }
        });
      }
      if (callback) callback(response);
    },
    *getByUuid32({ payload, callback }, { call, put }) {
      const response = yield call(getByUuid32, payload);
      if (callback) callback(response);
    },
    *getByUuid32({ payload, callback }, { call, put }) {
      const response = yield call(getByCode, payload);
      if (callback) callback(response);
    },
    *enable({ payload, callback }, { call, put }) {
      const response = yield call(enable, payload);
      if (callback) callback(response);
    },
    *disable({ payload, callback }, { call, put }) {
      const response = yield call(disable, payload);
      if (callback) callback(response);
    },
    *authorize({ payload, callback }, { call, put }) {
      const response = yield call(authorize, payload);
      if (callback) callback(response);
    },
    *onView({ payload }, { call, put }) {
      const response = yield call(get, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: {
            showDetailView: true,
            company: response.data
          }
        });
      }
    },
    *onCancel({ payload, callback }, { call, put }) {
      yield put({
        type: 'save',
        payload: {
          showDetailView: false
        }
      });
      if (callback) callback();
    },
    *onViewCreate({ payload, callback }, { call, put }) {
      yield put({
        type: 'save',
        payload: {
          showCreateView: true,
        }
      });
    },
    *onCancelCreate({ payload, callback }, { call, put }) {
      yield put({
        type: 'save',
        payload: {
          showCreateView: false
        }
      });
      if (callback) callback();
    },
    *getResourceKeys({ payload, callback }, { call, put }) {
      const response = yield call(getResourceKeys, payload);
      if (callback) callback(response);
    },
    *getResources({ payload, callback }, { call, put }) {
      const response = yield call(getResources, payload);
      if (callback) callback(response);
    },

    *saveAndAuthorize({ payload, callback }, { call, put }) {
      const response = yield call(saveAndAuthorize, payload);
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
  },
};
