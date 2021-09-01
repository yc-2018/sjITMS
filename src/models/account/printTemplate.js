import { save,modify,remove,queryAll,get,queryByTypeAndOrgUuid } from '@/services/account/PrintTemplate';

export default {
  namespace: 'template',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },
  effects: {
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
      if (callback) callback(response);
    },
    *queryAll({ payload, callback }, { call, put }) {
      const response = yield call(queryAll, payload);
      if (response && response.success) {
        yield put({
          type: 'saveAll',
          payload: response.data ? response.data : []
        });
      }
    },
    *queryByTypeAndOrgUuid({ payload, callback }, { call, put }) {
      const response = yield call(queryByTypeAndOrgUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'saveAll',
          payload: response.data ? response.data : []
        });
      }
    },
    *get({payload,callback},{call,put}){
      const response = yield call(get, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: response.data
        });
      }
    }
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        entity: action.payload
      };
    },
    saveAll(state,action){
      return {
        ...state,
        menuList: action.payload,
      };
    }
  },
};
