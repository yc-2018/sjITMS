import{ collect,cancelcollect,queryCollection} from '@/services/account/Collect';

export default {
  namespace: 'collect',

  state: {
    data: []
  },

  effects: {
    *queryCollection({ payload, callback }, { call, put }) {
      const response = yield call(queryCollection, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: response.data ? response.data : []
        });
      }
    },
    *onCollect({ payload, callback }, { call, put }) {
      const response = yield call(collect, payload);
      if (callback) callback(response);
    },
    *onCancle({ payload, callback }, { call, put }) {
      const response = yield call(cancelcollect, payload);
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