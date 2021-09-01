import { queryByDc, remove, save } from '@/services/facility/AlcNtcBillConfig';

export default {
  namespace: 'alcNtcBillConfig',

  state: {
    data: {
      list: [],
      pagination: {}
    },
    showPage: 'query',
  },

  effects: {
    *queryByDc({ payload, callback }, { call, put }) {
      console.log(payload)
      const response = yield call(queryByDc, payload);
      if (response && response.success) {
        yield put({
          type: 'saveAlcNtcBillConfigList',
          saveAlcNtcBillConfigList: response.data ? response.data : []
        });
      }
      if (callback) callback(response);
    },

    *remove({ payload, callback }, { call, put }) {
      const response = yield call(remove, payload);
      if (callback) callback(response);
    },

    *save({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    saveAlcNtcBillConfigList(state, action) {
      return {
        ...state,
        saveAlcNtcBillConfigList: action.saveAlcNtcBillConfigList
      };
    },
  }
};