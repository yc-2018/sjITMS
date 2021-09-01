import { save,modify,remove,getPath,queryAll } from '@/services/account/ImTemplate';

export default {
  namespace: 'imTemplate',

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
    *getPath({ payload, callback }, { call, put }) {
      const response = yield call(getPath, payload);
      if (response && response.success) {
        yield put({
          type: 'savePath',
          payload: response.data
        });
      }
      if (callback) callback(response);
    },
    *queryAll({ payload,callback }, { call, put }) {
      const response = yield call(queryAll);
      if (response && response.success) {
        yield put({
          type: 'saveAll',
          payload: response.data ? response.data : []
        });
      }
    },
  },

  reducers: {
    savePath(state, action) {
      return {
        ...state,
        path: action.payload,
      };
    },
    saveAll(state,action){
      return {
        ...state,
        allData: action.payload,
      };
    }
  },
};
