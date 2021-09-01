import {
  query,
  save,
  remove,
  modify,
  enable,
  disable,
  authorize,
  getResources,
  getCompanyResources,
  getByOrgUuid,
  get,
  addUser,
  removeUser,
} from '@/services/account/Role';

export default {
  namespace: 'role',

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
    *add({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (callback) callback(response);
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(remove, payload);
      if (callback) callback(response);
    },
    *modify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
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
    *getResources({ payload, callback }, { call, put }) {
      const response = yield call(getResources, payload);
      if (callback) callback(response);
    },
    *getByOrgUuid({ callback }, { call, put }) {
      const response = yield call(getByOrgUuid);
      if (callback) callback(response);
    },
    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      if (callback) callback(response);
    },
    *addUser({ payload, callback }, { call, put }) {
      const response = yield call(addUser, payload);
      if (callback) callback(response);
    },
    *removeUser({ payload, callback }, { call, put }) {
      const response = yield call(removeUser, payload);
      if (callback) callback(response);
    }
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