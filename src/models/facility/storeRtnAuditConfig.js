import {
  save,
  getBillState,
} from '@/services/facility/StoreRtnAuditConfig';

export default {
  namespace: 'storeRtnAuditConfig',

  state: {
    data: {},
  },

  effects: {
    *save({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (callback) callback(response);
    },

    *getBillState({ payload, callback }, { call, put }) {
      const response = yield call(getBillState, payload);
      if (response && response.success && response.data) {
        yield put({
          type: 'save1',
          payload: response.data,
        });
      }
    },
  },

  reducers: {
    save1(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  }
}
